import { emailService } from "./email-service";
import { whatsAppService } from "./whatsapp-service";
import * as emailTemplates from "./email-templates";
import type { Appointment } from "@/types/appointment";
import type { Service } from "@/types/service";
import type { Business } from "@/types/business";

// Base URL for the application
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export class NotificationService {
  /**
   * Send a booking cancellation notification to the business owner (WhatsApp with email fallback)
   */
  async sendCancellationNotificationToBusiness(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    const viewBookingUrl = `${BASE_URL}/dashboard/bookings/${appointment.id}`;

    // Try to send WhatsApp notification first
    try {
      const whatsAppSent = await whatsAppService.sendCancellationNotification(
        appointment,
        service,
        business,
      );

      // If WhatsApp notification was successful, we're done
      if (whatsAppSent) {
        return true;
      }
    } catch (error) {
      console.error("WhatsApp notification failed:", error);
      // Continue to email fallback
    }

    // Fallback to email notification
    const html = emailTemplates.businessNewBookingEmail(
      appointment,
      service,
      viewBookingUrl,
    );

    return emailService.sendEmail({
      to: business.email ?? "",
      subject: `Booking Cancelled - ${appointment.customerName}`,
      html,
    });
  }

  /**
   * Send a booking reminder notification to the business owner (WhatsApp with email fallback)
   */
  async sendReminderNotificationToBusiness(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    const viewBookingUrl = `${BASE_URL}/dashboard/bookings/${appointment.id}`;

    // Try to send WhatsApp notification first
    try {
      const whatsAppSent = await whatsAppService.sendReminderNotification(
        appointment,
        service,
        business,
      );

      // If WhatsApp notification was successful, we're done
      if (whatsAppSent) {
        return true;
      }
    } catch (error) {
      console.error("WhatsApp notification failed:", error);
      // Continue to email fallback
    }

    // Fallback to email notification
    const html = emailTemplates.businessNewBookingEmail(
      appointment,
      service,
      viewBookingUrl,
    );

    return emailService.sendEmail({
      to: business.email ?? "",
      subject: `Reminder: Upcoming Appointment - ${appointment.customerName}`,
      html,
    });
  }
  /**
   * Send a booking confirmation email to the customer with timezone support
   */
  async sendBookingConfirmationToCustomer(
    appointment: Appointment,
    service: Service,
    business: Business,
    businessTimezone?: string,
  ): Promise<boolean> {
    const cancellationUrl = `${BASE_URL}/booking/${appointment.id}/cancel`;
    const rescheduleUrl = `${BASE_URL}/booking/${appointment.id}/reschedule`;

    const html = await emailTemplates.bookingConfirmationEmail(
      appointment,
      service,
      business,
      cancellationUrl,
      rescheduleUrl,
      businessTimezone,
    );

    return emailService.sendEmail({
      to: appointment.customerEmail,
      subject: `Booking Confirmation - ${business.name}`,
      html,
    });
  }

  /**
   * Send a booking notification to the business owner (WhatsApp with email fallback)
   */
  async sendBookingNotificationToBusiness(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    const viewBookingUrl = `${BASE_URL}/dashboard/bookings/${appointment.id}`;

    // Try to send WhatsApp notification first
    try {
      const whatsAppSent = await whatsAppService.sendNewBookingNotification(
        appointment,
        service,
        business,
      );

      // If WhatsApp notification was successful, we're done
      if (whatsAppSent) {
        return true;
      }
    } catch (error) {
      console.error("WhatsApp notification failed:", error);
      // Continue to email fallback
    }

    // Fallback to email notification
    const html = emailTemplates.businessNewBookingEmail(
      appointment,
      service,
      viewBookingUrl,
    );

    return emailService.sendEmail({
      to: business.email ?? "",
      subject: `New Booking - ${appointment.customerName}`,
      html,
    });
  }

  /**
   * Send a booking cancellation email to the customer
   */
  async sendBookingCancellationToCustomer(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    const html = emailTemplates.bookingCancellationEmail(
      appointment,
      service,
      business,
    );

    return emailService.sendEmail({
      to: appointment.customerEmail,
      subject: `Booking Cancelled - ${business.name}`,
      html,
    });
  }

  /**
   * Send a booking reminder email to the customer with timezone support
   */
  async sendBookingReminderToCustomer(
    appointment: Appointment,
    service: Service,
    business: Business,
    businessTimezone?: string,
  ): Promise<boolean> {
    const cancellationUrl = `${BASE_URL}/booking/${appointment.id}/cancel`;
    const rescheduleUrl = `${BASE_URL}/booking/${appointment.id}/reschedule`;

    const html = await emailTemplates.bookingReminderEmail(
      appointment,
      service,
      business,
      cancellationUrl,
      rescheduleUrl,
      businessTimezone,
    );

    return emailService.sendEmail({
      to: appointment.customerEmail,
      subject: `Reminder: Your Appointment with ${business.name}`,
      html,
    });
  }

  /**
   * Send a booking rescheduled email to the customer
   */
  async sendBookingRescheduledToCustomer(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    const cancellationUrl = `${BASE_URL}/booking/${appointment.id}/cancel`;

    const html = emailTemplates.bookingRescheduledEmail(
      appointment,
      service,
      business,
      cancellationUrl,
    );

    return emailService.sendEmail({
      to: appointment.customerEmail,
      subject: `Booking Rescheduled - ${business.name}`,
      html,
    });
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();
