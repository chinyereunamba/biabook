import { notificationQueueService } from "./notification-queue";
import { notificationService } from "./notification-service";
import { db } from "@/server/db";
import {
  appointments,
  services,
  businesses,
  businessNotificationPreferences,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { Appointment } from "@/types/appointment";
import type { Service } from "@/types/service";
import type { Business } from "@/types/business";
import type { NotificationType } from "@/types/notification";

/**
 * Service for scheduling notifications
 */
export class NotificationScheduler {
  /**
   * Schedule a booking confirmation notification
   */
  async scheduleBookingConfirmation(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<void> {
    // Send immediate confirmation to customer
    await this.scheduleNotification({
      type: "booking_confirmation",
      recipientId: appointment.customerEmail,
      recipientType: "customer",
      recipientEmail: appointment.customerEmail,
      recipientPhone: appointment.customerPhone,
      payload: {
        appointmentId: appointment.id,
        serviceId: service.id,
        businessId: business.id,
      },
      scheduledFor: new Date(), // Send immediately
    });

    // Check business notification preferences
    const preferences = await this.getBusinessNotificationPreferences(
      business.id,
    );

    // Send notification to business owner if enabled
    if (preferences.email || preferences.whatsapp) {
      await this.scheduleNotification({
        type: "business_new_booking",
        recipientId: business.id,
        recipientType: "business",
        recipientEmail: business.email,
        recipientPhone: business.phone,
        payload: {
          appointmentId: appointment.id,
          serviceId: service.id,
          businessId: business.id,
        },
        scheduledFor: new Date(), // Send immediately
      });
    }
  }

  /**
   * Schedule booking reminder notifications
   */
  async scheduleBookingReminders(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<void> {
    const appointmentDate = new Date(
      appointment.appointmentDate + "T" + appointment.startTime,
    );

    // Schedule 24-hour reminder for customer
    const reminder24h = new Date(appointmentDate);
    reminder24h.setHours(reminder24h.getHours() - 24);

    if (reminder24h > new Date()) {
      await this.scheduleNotification({
        type: "booking_reminder_24h",
        recipientId: appointment.customerEmail,
        recipientType: "customer",
        recipientEmail: appointment.customerEmail,
        recipientPhone: appointment.customerPhone,
        payload: {
          appointmentId: appointment.id,
          serviceId: service.id,
          businessId: business.id,
        },
        scheduledFor: reminder24h,
      });
    }

    // Schedule 2-hour reminder for customer
    const reminder2h = new Date(appointmentDate);
    reminder2h.setHours(reminder2h.getHours() - 2);

    if (reminder2h > new Date()) {
      await this.scheduleNotification({
        type: "booking_reminder_2h",
        recipientId: appointment.customerEmail,
        recipientType: "customer",
        recipientEmail: appointment.customerEmail,
        recipientPhone: appointment.customerPhone,
        payload: {
          appointmentId: appointment.id,
          serviceId: service.id,
          businessId: business.id,
        },
        scheduledFor: reminder2h,
      });
    }

    // Check business notification preferences
    const preferences = await this.getBusinessNotificationPreferences(
      business.id,
    );

    // Schedule 24-hour reminder for business if enabled
    if (preferences.reminderEmail || preferences.reminderWhatsapp) {
      await this.scheduleNotification({
        type: "business_booking_reminder",
        recipientId: business.id,
        recipientType: "business",
        recipientEmail: business.email,
        recipientPhone: business.phone,
        payload: {
          appointmentId: appointment.id,
          serviceId: service.id,
          businessId: business.id,
        },
        scheduledFor: reminder24h,
      });
    }
  }

  /**
   * Schedule a booking cancellation notification
   */
  async scheduleBookingCancellation(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<void> {
    // Send immediate cancellation to customer
    await this.scheduleNotification({
      type: "booking_cancellation",
      recipientId: appointment.customerEmail,
      recipientType: "customer",
      recipientEmail: appointment.customerEmail,
      recipientPhone: appointment.customerPhone,
      payload: {
        appointmentId: appointment.id,
        serviceId: service.id,
        businessId: business.id,
      },
      scheduledFor: new Date(), // Send immediately
    });

    // Check business notification preferences
    const preferences = await this.getBusinessNotificationPreferences(
      business.id,
    );

    // Send notification to business owner if enabled
    if (preferences.email || preferences.whatsapp) {
      await this.scheduleNotification({
        type: "business_booking_cancelled",
        recipientId: business.id,
        recipientType: "business",
        recipientEmail: business.email,
        recipientPhone: business.phone,
        payload: {
          appointmentId: appointment.id,
          serviceId: service.id,
          businessId: business.id,
        },
        scheduledFor: new Date(), // Send immediately
      });
    }
  }

  /**
   * Schedule a booking rescheduled notification
   */
  async scheduleBookingRescheduled(
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<void> {
    // Send immediate notification to customer
    await this.scheduleNotification({
      type: "booking_rescheduled",
      recipientId: appointment.customerEmail,
      recipientType: "customer",
      recipientEmail: appointment.customerEmail,
      recipientPhone: appointment.customerPhone,
      payload: {
        appointmentId: appointment.id,
        serviceId: service.id,
        businessId: business.id,
      },
      scheduledFor: new Date(), // Send immediately
    });

    // Check business notification preferences
    const preferences = await this.getBusinessNotificationPreferences(
      business.id,
    );

    // Send notification to business owner if enabled
    if (preferences.email || preferences.whatsapp) {
      await this.scheduleNotification({
        type: "business_booking_rescheduled",
        recipientId: business.id,
        recipientType: "business",
        recipientEmail: business.email,
        recipientPhone: business.phone,
        payload: {
          appointmentId: appointment.id,
          serviceId: service.id,
          businessId: business.id,
        },
        scheduledFor: new Date(), // Send immediately
      });
    }
  }

  /**
   * Process pending notifications
   */
  async processPendingNotifications(limit = 10): Promise<number> {
    const pendingNotifications =
      await notificationQueueService.getPendingNotifications(limit);
    let processedCount = 0;

    for (const notification of pendingNotifications) {
      try {
        const { type, payload } = notification;

        // Get the appointment, service, and business data
        const appointment = await this.getAppointmentById(
          payload.appointmentId,
        );
        if (!appointment) {
          await notificationQueueService.markAsFailed(
            notification.id!,
            "Appointment not found",
          );
          continue;
        }

        const service = await this.getServiceById(payload.serviceId);
        if (!service) {
          await notificationQueueService.markAsFailed(
            notification.id!,
            "Service not found",
          );
          continue;
        }

        const business = await this.getBusinessById(payload.businessId);
        if (!business) {
          await notificationQueueService.markAsFailed(
            notification.id!,
            "Business not found",
          );
          continue;
        }

        // Process the notification based on type
        let success = false;

        if (notification.recipientType === "customer") {
          success = await this.processCustomerNotification(
            type,
            appointment,
            service,
            business,
          );
        } else {
          success = await this.processBusinessNotification(
            type,
            appointment,
            service,
            business,
          );
        }

        if (success) {
          await notificationQueueService.markAsProcessed(notification.id!);
          processedCount++;
        } else {
          await notificationQueueService.markAsFailed(
            notification.id!,
            "Failed to send notification",
          );
        }
      } catch (error) {
        console.error(
          `Error processing notification ${notification.id}:`,
          error,
        );
        await notificationQueueService.markAsFailed(
          notification.id!,
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }

    return processedCount;
  }

  /**
   * Process a customer notification
   */
  private async processCustomerNotification(
    type: NotificationType,
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    switch (type) {
      case "booking_confirmation":
        return notificationService.sendBookingConfirmationToCustomer(
          appointment,
          service,
          business,
        );

      case "booking_reminder_24h":
      case "booking_reminder_2h":
        return notificationService.sendBookingReminderToCustomer(
          appointment,
          service,
          business,
        );

      case "booking_cancellation":
        return notificationService.sendBookingCancellationToCustomer(
          appointment,
          service,
          business,
        );

      case "booking_rescheduled":
        return notificationService.sendBookingRescheduledToCustomer(
          appointment,
          service,
          business,
        );

      default:
        console.error(`Unknown customer notification type: ${type}`);
        return false;
    }
  }

  /**
   * Process a business notification
   */
  private async processBusinessNotification(
    type: NotificationType,
    appointment: Appointment,
    service: Service,
    business: Business,
  ): Promise<boolean> {
    switch (type) {
      case "business_new_booking":
        return notificationService.sendBookingNotificationToBusiness(
          appointment,
          service,
          business,
        );

      case "business_booking_cancelled":
        return notificationService.sendCancellationNotificationToBusiness(
          appointment,
          service,
          business,
        );

      case "business_booking_reminder":
        return notificationService.sendReminderNotificationToBusiness(
          appointment,
          service,
          business,
        );

      default:
        console.error(`Unknown business notification type: ${type}`);
        return false;
    }
  }

  /**
   * Schedule a notification
   */
  private async scheduleNotification(notification: {
    type: NotificationType;
    recipientId: string;
    recipientType: "business" | "customer";
    recipientEmail: string;
    recipientPhone?: string;
    payload: Record<string, any>;
    scheduledFor: Date;
  }): Promise<string> {
    return notificationQueueService.enqueue(notification);
  }

  /**
   * Get business notification preferences
   */
  protected async getBusinessNotificationPreferences(businessId: string) {
    const preferences = await db
      .select()
      .from(businessNotificationPreferences)
      .where(eq(businessNotificationPreferences.businessId, businessId))
      .limit(1);

    if (preferences.length > 0) {
      return preferences[0];
    }

    // Return default preferences if none are set
    return {
      businessId,
      email: true,
      whatsapp: true,
      sms: false,
      reminderEmail: true,
      reminderWhatsapp: true,
      reminderSms: false,
    };
  }

  /**
   * Get appointment by ID
   */
  protected async getAppointmentById(id: string): Promise<Appointment | null> {
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    return result.length > 0 ? (result[0] as Appointment) : null;
  }

  /**
   * Get service by ID
   */
  protected async getServiceById(id: string): Promise<Service | null> {
    const result = await db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    return result.length > 0 ? (result[0] as Service) : null;
  }

  /**
   * Get business by ID
   */
  protected async getBusinessById(id: string): Promise<Business | null> {
    const result = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    return result.length > 0 ? (result[0] as Business) : null;
  }
}

// Create a singleton instance
export const notificationScheduler = new NotificationScheduler();
