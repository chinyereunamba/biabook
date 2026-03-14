import { inngest } from "./client";
import { notificationService } from "@/server/notifications/notification-service";
import type { Appointment } from "@/types/appointment";
import type { Service } from "@/types/service";
import type { Business } from "@/types/business";
import type { NotificationType } from "@/types/notification";
import { db } from "@/server/db";
import { appointments, services, businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Robust notification worker using Inngest.
 * Replaces the brittle manual DB polling or inline serverless executions.
 */
export const sendNotification = inngest.createFunction(
  { id: "send-notification", retries: 3 },
  { event: "notification/send" },
  async ({ event, step }) => {
    const {
      type,
      recipientType,
      payload,
      scheduledFor,
    } = event.data as {
      type: NotificationType;
      recipientType: "business" | "customer";
      payload: {
        appointmentId?: string;
        serviceId?: string;
        businessId?: string;
        appointment?: Appointment;
        service?: Service;
        business?: Business;
      };
      scheduledFor: number; // Unix timestamp
    };

    // 1. Sleep until the scheduled execution time
    const executeAtMs = scheduledFor * 1000;
    if (executeAtMs > Date.now()) {
      await step.sleepUntil("wait-for-schedule", new Date(executeAtMs));
    }

    // 2. Hydrate the entities if only IDs were passed via payload to keep event size small
    // Note: step.run serializes the returned value, so Dates become strings here.
    const hydratedData = await step.run("hydrate-entities", async () => {
      let appointment = payload.appointment;
      let service = payload.service;
      let business = payload.business;

      if (!appointment && payload.appointmentId) {
        const [aptRes] = await db
          .select()
          .from(appointments)
          .where(eq(appointments.id, payload.appointmentId))
          .limit(1);
        if (aptRes) appointment = aptRes as unknown as Appointment;
      }

      if (!service && payload.serviceId) {
        const [svcRes] = await db
          .select()
          .from(services)
          .where(eq(services.id, payload.serviceId))
          .limit(1);
        if (svcRes) service = svcRes as Service;
      }

      if (!business && payload.businessId) {
        const [bizRes] = await db
          .select()
          .from(businesses)
          .where(eq(businesses.id, payload.businessId))
          .limit(1);
        if (bizRes) {
          business = {
            ...bizRes,
            slug: bizRes.name.toLowerCase().replace(/ /g, "-"),
            userId: bizRes.ownerId,
          } as Business;
        }
      }

      return { appointment, service, business };
    });

    // Rehydrate dates outside the Inngest serialization barrier
    const appointment = hydratedData.appointment ? ({ 
      ...hydratedData.appointment, 
      appointmentDate: new Date(hydratedData.appointment.appointmentDate as any) 
    } as unknown as Appointment) : undefined;
    const service = hydratedData.service as Service | undefined;
    const business = hydratedData.business as Business | undefined;

    if (!appointment || !service || !business) {
      throw new Error("Failed to hydrate required notification entities.");
    }

    // 3. Dispatch the message
    await step.run("dispatch-message", async () => {
      let success = false;
      if (recipientType === "customer") {
        success = await dispatchToCustomer(type, appointment, service, business);
      } else {
        success = await dispatchToBusiness(type, appointment, service, business);
      }

      if (!success) {
        throw new Error(`Failed to dispatch ${type} notification to ${recipientType}`);
      }
      
      return success;
    });
  }
);

// Helpers extracted from notification-scheduler.ts logic
async function dispatchToCustomer(type: NotificationType, appt: Appointment, svc: Service, biz: Business) {
  switch (type) {
    case "booking_confirmation":
      return notificationService.sendBookingConfirmationToCustomer(appt, svc, biz);
    case "booking_reminder_24h":
    case "booking_reminder_2h":
    case "booking_reminder_30m":
      return notificationService.sendBookingReminderToCustomer(appt, svc, biz);
    case "booking_cancellation":
      return notificationService.sendBookingCancellationToCustomer(appt, svc, biz);
    case "booking_rescheduled":
      return notificationService.sendBookingRescheduledToCustomer(appt, svc, biz);
    default:
      console.error(`Unknown customer notification type: ${type}`);
      return false;
  }
}

async function dispatchToBusiness(type: NotificationType, appt: Appointment, svc: Service, biz: Business) {
  switch (type) {
    case "business_new_booking":
      return notificationService.sendBookingNotificationToBusiness(appt, svc, biz);
    case "business_booking_cancelled":
      return notificationService.sendCancellationNotificationToBusiness(appt, svc, biz);
    case "business_booking_reminder":
      return notificationService.sendReminderNotificationToBusiness(appt, svc, biz);
    case "booking_rescheduled":
      return notificationService.sendBookingNotificationToBusiness(appt, svc, biz);
    default:
      console.error(`Unknown business notification type: ${type}`);
      return false;
  }
}
