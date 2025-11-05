import { env } from "@/env";
import { notificationLogger } from "./notification-logger";
import type { Appointment } from "@/types/appointment";
import type { Service } from "@/types/service";
import type { Business } from "@/types/business";
import { formatDate, formatTime, formatCurrency } from "@/utils/format";

// Types for WhatsApp API
interface WhatsAppMessageTemplate {
  name: string;
  language: {
    code: string;
  };
  components?: {
    type: "header" | "body" | "button";
    parameters: {
      type: "text" | "currency" | "date_time";
      text?: string;
      currency?: {
        fallback_value: string;
        code: string;
        amount_1000: number;
      };
      date_time?: {
        fallback_value: string;
      };
    }[];
  }[];
}

interface WhatsAppMessage {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "template";
  template: WhatsAppMessageTemplate;
}

/**
 * WhatsApp service for sending WhatsApp notifications
 */
export class WhatsAppService {
  private apiUrl: string;
  private phoneNumberId: string;
  private accessToken: string;
  private isConfigured: boolean;

  constructor() {
    this.apiUrl = env.WHATSAPP_API_URL ?? "";
    this.phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID ?? "";
    this.accessToken = env.WHATSAPP_ACCESS_TOKEN ?? "";

    this.isConfigured = !!(
      this.apiUrl &&
      this.phoneNumberId &&
      this.accessToken
    );

    // Check if WhatsApp is explicitly disabled
    const isDisabled = process.env.DISABLE_WHATSAPP === "true";
    if (isDisabled) {
      console.log(
        "WhatsApp notifications are disabled via DISABLE_WHATSAPP environment variable",
      );
      this.isConfigured = false;
    }

    if (!this.isConfigured) {
      console.warn(
        "WhatsApp API is not configured or disabled. WhatsApp messages will not be sent.",
      );
    }
  }

  /**
   * Send a WhatsApp message using the WhatsApp Business API
   */
  private async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    if (!this.isConfigured) {
      notificationLogger.logWhatsAppAttempt(
        message.to,
        false,
        "WhatsApp service not configured",
      );
      return false;
    }

    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(message),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));

        const errorMessage = `API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`;
        notificationLogger.logWhatsAppAttempt(message.to, false, errorMessage);
        return false;
      }

      const responseData = await response
        .json()
        .catch(() => ({ success: true }));

      notificationLogger.logWhatsAppAttempt(message.to, true, undefined, {
        messageId: responseData.messages?.[0]?.id,
      });
      return true;
    } catch (error) {
      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Request timed out after 10 seconds";
        } else if (error.message.includes("ETIMEDOUT")) {
          errorMessage = "Connection timed out";
        } else {
          errorMessage = error.message;
        }
      }

      notificationLogger.logWhatsAppAttempt(message.to, false, errorMessage);
      return false;
    }
  }

  /**
   * Send a new booking notification to the business owner
   */
  async sendNewBookingNotification(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    if (!business.phone) {
      console.warn(
        "Business phone number not available for WhatsApp notification",
      );
      return false;
    }

    // Format the phone number for WhatsApp (remove non-digits and ensure it starts with country code)
    let phoneNumber = business.phone.replace(/\D/g, "");

    // Add country code if missing (assuming US numbers)
    if (phoneNumber.length === 10) {
      phoneNumber = "1" + phoneNumber;
    }

    // Create the WhatsApp message using a template
    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "template",
      template: {
        name: "new_booking_notification",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: appointment.customerName },
              { type: "text", text: service.name },
              { type: "text", text: formatDate(appointment.appointmentDate) },
              { type: "text", text: formatTime(appointment.startTime) },
              {
                type: "currency",
                currency: {
                  fallback_value: formatCurrency(service.price),
                  code: "USD",
                  amount_1000: service.price * 10, // WhatsApp expects amount_1000 (amount * 1000)
                },
              },
              { type: "text", text: appointment.customerPhone },
              { type: "text", text: appointment.customerEmail },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }

  /**
   * Send a booking cancellation notification to the business owner
   */
  async sendCancellationNotification(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    if (!business.phone) {
      console.warn(
        "Business phone number not available for WhatsApp notification",
      );
      return false;
    }

    // Format the phone number for WhatsApp
    let phoneNumber = business.phone.replace(/\D/g, "");

    // Add country code if missing (assuming US numbers)
    if (phoneNumber.length === 10) {
      phoneNumber = "1" + phoneNumber;
    }

    // Create the WhatsApp message using a template
    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "template",
      template: {
        name: "booking_cancellation",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: appointment.customerName },
              { type: "text", text: service.name },
              { type: "text", text: formatDate(appointment.appointmentDate) },
              { type: "text", text: formatTime(appointment.startTime) },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }

  /**
   * Send a booking reminder notification to the business owner
   */
  async sendReminderNotification(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    if (!business.phone) {
      console.warn(
        "Business phone number not available for WhatsApp notification",
      );
      return false;
    }

    // Format the phone number for WhatsApp
    let phoneNumber = business.phone.replace(/\D/g, "");

    // Add country code if missing (assuming US numbers)
    if (phoneNumber.length === 10) {
      phoneNumber = "1" + phoneNumber;
    }

    // Create the WhatsApp message using a template
    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "template",
      template: {
        name: "booking_reminder",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: appointment.customerName },
              { type: "text", text: service.name },
              { type: "text", text: formatDate(appointment.appointmentDate) },
              { type: "text", text: formatTime(appointment.startTime) },
              { type: "text", text: appointment.customerPhone },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }
}

// Create a singleton instance
export const whatsAppService = new WhatsAppService();
