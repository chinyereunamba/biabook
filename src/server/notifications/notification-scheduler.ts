import { notificationQueueService } from "./notification-queue";
import { notificationService } from "./notification-service";
import { notificationLogger } from "./notification-logger";
import { db } from "@/server/db";
import {
  appointments,
  services,
  businesses,
  businessNotificationPreferences,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { Appointment } from "@/types/appointment";
import type { Service } from "@/types/service";
import type { Business } from "@/types/business";
import type { NotificationType } from "@/types/notification";

/**
 * Safely create a Date object from appointment date and time
 */
function createAppointmentDateTime(
  appointmentDate: Date | string,
  startTime: string,
): Date | null {
  try {
    const dateStr =
      appointmentDate instanceof Date
        ? appointmentDate.toISOString().split("T")[0]
        : String(appointmentDate).split("T")[0];

    const dateTime = new Date(dateStr + "T" + startTime);

    // Validate the resulting date
    if (isNaN(dateTime.getTime())) {
      return null;
    }

    return dateTime;
  } catch (error) {
    console.error("Error creating appointment date time:", error);
    return null;
  }
}

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
    if (preferences.email ?? preferences.whatsapp) {
      await this.scheduleNotification({
        type: "business_new_booking",
        recipientId: business.id,
        recipientType: "business",
        recipientEmail: business.email ?? "",
        recipientPhone: business.phone ?? undefined,
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
    // Parse appointment date and time safely
    const appointmentDate = createAppointmentDateTime(
      appointment.appointmentDate,
      appointment.startTime,
    );

    // Validate the appointment date
    if (!appointmentDate) {
      console.error("Invalid appointment date/time:", {
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        appointmentId: appointment.id,
      });
      return;
    }

    // Schedule 24-hour reminder for customer
    const reminder24h = new Date(appointmentDate);
    reminder24h.setHours(reminder24h.getHours() - 24);

    // Validate reminder date
    if (isNaN(reminder24h.getTime())) {
      console.error("Invalid reminder24h date:", {
        appointmentDate: appointmentDate.toISOString(),
        appointmentId: appointment.id,
      });
      return;
    }

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
        scheduledFor: new Date(reminder24h.toISOString()),
      });
    }

    // Schedule 2-hour reminder for customer
    const reminder2h = new Date(appointmentDate);
    reminder2h.setHours(reminder2h.getHours() - 2);

    // Validate reminder date
    if (isNaN(reminder2h.getTime())) {
      console.error("Invalid reminder2h date:", {
        appointmentDate: appointmentDate.toISOString(),
        appointmentId: appointment.id,
      });
      return;
    }

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

    // Schedule 30-minute reminder for customer
    const reminder30m = new Date(appointmentDate);
    reminder30m.setMinutes(reminder30m.getMinutes() - 30);

    // Validate reminder date
    if (isNaN(reminder30m.getTime())) {
      console.error("Invalid reminder30m date:", {
        appointmentDate: appointmentDate.toISOString(),
        appointmentId: appointment.id,
      });
      return;
    }

    if (reminder30m > new Date()) {
      await this.scheduleNotification({
        type: "booking_reminder_30m",
        recipientId: appointment.customerEmail,
        recipientType: "customer",
        recipientEmail: appointment.customerEmail,
        recipientPhone: appointment.customerPhone,
        payload: {
          appointmentId: appointment.id,
          serviceId: service.id,
          businessId: business.id,
        },
        scheduledFor: reminder30m,
      });
    }

    // Check business notification preferences
    const preferences = await this.getBusinessNotificationPreferences(
      business.id,
    );

    // Schedule 24-hour reminder for business if enabled
    if (preferences.reminderEmail ?? preferences.reminderWhatsapp) {
      await this.scheduleNotification({
        type: "business_booking_reminder",
        recipientId: business.id,
        recipientType: "business",
        recipientEmail: business.email ?? "",
        recipientPhone: business.phone ?? undefined,
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
    if (preferences.email ?? preferences.whatsapp) {
      await this.scheduleNotification({
        type: "business_booking_cancelled",
        recipientId: business.id,
        recipientType: "business",
        recipientEmail: business.email ?? "",
        recipientPhone: business.phone ?? undefined,
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
    if (preferences.email ?? preferences.whatsapp) {
      await this.scheduleNotification({
        type: "booking_rescheduled",
        recipientId: business.id,
        recipientType: "business",
        recipientEmail: business.email ?? "",
        recipientPhone: business.phone ?? undefined,
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
        notificationLogger.logProcessingStart(notification.id!, {
          type: notification.type,
          recipientType: notification.recipientType,
          recipientEmail: notification.recipientEmail,
          attempts: notification.attempts,
        });

        const { type, payload } = notification;

        // Get the appointment, service, and business data
        const appointment = await this.getAppointmentById(
          payload.appointmentId as string,
        );
        if (!appointment) {
          await notificationQueueService.markAsFailed(
            notification.id!,
            "Appointment not found",
          );
          continue;
        }

        const service = await this.getServiceById(payload.serviceId as string);
        if (!service) {
          await notificationQueueService.markAsFailed(
            notification.id!,
            "Service not found",
          );
          continue;
        }

        const business = await this.getBusinessById(
          payload.businessId as string,
        );
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
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        notificationLogger.error(
          `Error processing notification ${notification.id}`,
          error,
          {
            notificationId: notification.id,
            type: notification.type,
            recipientType: notification.recipientType,
          },
        );
        await notificationQueueService.markAsFailed(
          notification.id!,
          errorMessage,
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
      case "booking_reminder_30m":
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

      case "booking_rescheduled":
        return notificationService.sendBookingNotificationToBusiness(
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
    payload: Record<string, unknown>;
    scheduledFor: Date;
  }): Promise<string> {
    return notificationQueueService.enqueue(notification);
  }

  /**
   * Get business notification preferences
   */
  protected async getBusinessNotificationPreferences(businessId: string) {
    const [preferences] = await db
      .select()
      .from(businessNotificationPreferences)
      .where(eq(businessNotificationPreferences.businessId, businessId))
      .limit(1);

    if (preferences) {
      return preferences;
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
    const [result] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    return result
      ? ({
          ...result,
          appointmentDate: new Date(result.appointmentDate),
        } as Appointment)
      : null;
  }

  /**
   * Get service by ID
   */
  protected async getServiceById(id: string): Promise<Service | null> {
    const [result] = await db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    return result ? (result as Service) : null;
  }

  /**
   * Get business by ID
   */
  protected async getBusinessById(id: string): Promise<Business | null> {
    const [result] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    return result
      ? ({
          ...result,
          slug: result.name.toLowerCase().replace(/ /g, "-"),
          userId: result.ownerId,
        } as Business)
      : null;
  }
}

// Create a singleton instance
export const notificationScheduler = new NotificationScheduler();
