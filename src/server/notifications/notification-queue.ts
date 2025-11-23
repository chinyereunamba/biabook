import { db } from "@/server/db";
import { sql, eq } from "drizzle-orm";
import { notificationQueue } from "@/server/db/schema";
import { notificationLogger } from "./notification-logger";
import type {
  NotificationType,
  NotificationStatus,
} from "@/types/notification";

/**
 * Interface for notification queue items
 */
export interface NotificationQueueItem {
  id?: string;
  type: NotificationType;
  recipientId: string;
  recipientType: "business" | "customer";
  recipientEmail: string;
  recipientPhone?: string | null;
  payload: Record<string, unknown>;
  scheduledFor: Date;
  status: NotificationStatus;
  attempts: number;
  lastAttemptAt?: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Service for managing notification queue
 */
export class NotificationQueueService {
  /**
   * Add a notification to the queue
   */
  async enqueue(
    notification: Omit<
      NotificationQueueItem,
      "id" | "attempts" | "status" | "createdAt" | "updatedAt"
    >,
  ): Promise<string> {
    // Validate scheduledFor date
    if (
      !notification.scheduledFor ||
      isNaN(notification.scheduledFor.getTime())
    ) {
      throw new Error(
        `Invalid scheduledFor date: ${notification.scheduledFor}`,
      );
    }

    // Validate required fields
    if (!notification.recipientEmail) {
      throw new Error("Recipient email is required");
    }

    const now = new Date();

    console.log("[NotificationQueue] Enqueueing notification");
    console.log("  Type:", notification.type);
    console.log("  Recipient:", notification.recipientEmail);
    console.log("  Scheduled for:", notification.scheduledFor.toISOString());
    console.log("  Current time:", now.toISOString());
    console.log(
      "  Minutes until send:",
      Math.round((notification.scheduledFor.getTime() - now.getTime()) / 60000),
    );

    const [result] = await db
      .insert(notificationQueue)
      .values({
        type: notification.type,
        recipientId: notification.recipientId,
        recipientType: notification.recipientType,
        recipientEmail: notification.recipientEmail,
        recipientPhone: notification.recipientPhone ?? undefined,
        payload: JSON.stringify(notification.payload),
        scheduledFor: Math.floor(notification.scheduledFor.getTime() / 1000),
        status: "pending",
        attempts: 0,
      })
      .returning({ id: notificationQueue.id });

    if (!result) {
      throw new Error("Failed to enqueue notification");
    }

    notificationLogger.logEnqueue(
      notification.type,
      notification.recipientType,
      notification.recipientEmail,
      notification.scheduledFor,
      {
        notificationId: result.id,
        payload: notification.payload,
      },
    );

    return result.id;
  }

  /**
   * Get pending notifications that are due for processing
   */
  async getPendingNotifications(limit = 10): Promise<NotificationQueueItem[]> {
    const now = new Date();

    console.log("[NotificationQueue] Getting pending notifications");
    console.log("[NotificationQueue] Current time:", now.toISOString());

    const results = await db
      .select()
      .from(notificationQueue)
      .where(
        sql`${notificationQueue.status} = 'pending' AND ${notificationQueue.scheduledFor} <= ${now} AND ${notificationQueue.attempts} < 3`,
      )
      .orderBy(notificationQueue.scheduledFor)
      .limit(limit);

    console.log(
      `[NotificationQueue] Found ${results.length} pending notifications`,
    );
    results.forEach((r) => {
      console.log(
        `  - ID: ${r.id}, scheduledFor: ${new Date(r.scheduledFor).toISOString()}, status: ${r.status}`,
      );
    });

    return results.map((item) => ({
      ...item,
      payload:
        typeof item.payload === "string"
          ? JSON.parse(item.payload)
          : item.payload,
      type: item.type as NotificationType,
      // Drizzle with mode: "timestamp" returns Date objects directly
      scheduledFor: new Date(item.scheduledFor * 1000),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastAttemptAt: item.lastAttemptAt,
    }));
  }

  /**
   * Mark a notification as processed
   */
  async markAsProcessed(id: string): Promise<void> {
    const now = new Date();

    await db
      .update(notificationQueue)
      .set({
        status: "processed",
        lastAttemptAt: now,
        updatedAt: now,
      })
      .where(eq(notificationQueue.id, id));

    notificationLogger.logProcessingSuccess(id);
  }

  /**
   * Mark a notification as failed and increment attempt count
   */
  async markAsFailed(id: string, error?: string): Promise<void> {
    const [notification] = await db
      .select()
      .from(notificationQueue)
      .where(eq(notificationQueue.id, id))
      .limit(1);

    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    const attempts = notification.attempts + 1;
    const status = attempts >= 3 ? "failed" : "pending";
    const now = new Date();

    await db
      .update(notificationQueue)
      .set({
        status,
        attempts,
        lastAttemptAt: now,
        error: error ?? null,
        updatedAt: now,
      })
      .where(eq(notificationQueue.id, id));

    notificationLogger.logProcessingFailure(id, error || "Unknown error", {
      status,
      attempts,
      maxAttempts: 3,
    });
  }

  /**
   * Reschedule a notification for later
   */
  async reschedule(id: string, scheduledFor: Date): Promise<void> {
    const now = new Date();

    await db
      .update(notificationQueue)
      .set({
        scheduledFor: scheduledFor.getDate(),
        updatedAt: now,
      })
      .where(eq(notificationQueue.id, id));

    console.log(
      `Notification ${id} rescheduled for ${scheduledFor.toISOString()}`,
    );
  }

  /**
   * Cancel pending notifications for a specific appointment
   */
  async cancelNotificationsForAppointment(
    appointmentId: string,
  ): Promise<number> {
    console.log(
      `[NotificationQueue] Cancelling notifications for appointment: ${appointmentId}`,
    );

    const now = new Date();

    // Update all pending notifications for this appointment to 'failed' status
    const result = await db
      .update(notificationQueue)
      .set({
        status: "failed",
        error: "Appointment cancelled",
        updatedAt: now,
      })
      .where(
        sql`${notificationQueue.status} = 'pending' AND ${notificationQueue.payload} LIKE '%"appointmentId":"${appointmentId}"%'`,
      )
      .returning({ id: notificationQueue.id });

    console.log(
      `[NotificationQueue] Cancelled ${result.length} notification(s)`,
    );
    notificationLogger.info(
      `Cancelled ${result.length} notifications for appointment ${appointmentId}`,
    );

    return result.length;
  }

  /**
   * Delete old notifications (processed and failed) older than a certain date
   * This keeps the database clean and prevents it from growing indefinitely
   */
  async cleanupOldNotifications(olderThan: Date): Promise<number> {
    console.log(
      `[NotificationQueue] Cleaning up notifications older than ${olderThan.toISOString()}`,
    );

    const result = await db
      .delete(notificationQueue)
      .where(
        sql`(${notificationQueue.status} = 'processed' OR ${notificationQueue.status} = 'failed') AND ${notificationQueue.updatedAt} < ${olderThan}`,
      )
      .returning({ id: notificationQueue.id });

    console.log(
      `[NotificationQueue] Cleaned up ${result.length} old notification(s)`,
    );
    notificationLogger.info(
      `Cleaned up ${result.length} old notifications older than ${olderThan.toISOString()}`,
    );

    return result.length;
  }
}

// Create a singleton instance
export const notificationQueueService = new NotificationQueueService();
