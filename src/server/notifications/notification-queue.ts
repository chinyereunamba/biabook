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
    const now = new Date();

    const [result] = await db
      .insert(notificationQueue)
      .values({
        type: notification.type,
        recipientId: notification.recipientId,
        recipientType: notification.recipientType,
        recipientEmail: notification.recipientEmail,
        recipientPhone: notification.recipientPhone ?? undefined,
        payload: JSON.stringify(notification.payload),
        scheduledFor: notification.scheduledFor, // Drizzle handles Date to timestamp conversion
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

    const results = await db
      .select()
      .from(notificationQueue)
      .where(
        sql`${notificationQueue.status} = 'pending' AND 
            ${notificationQueue.scheduledFor} <= ${now} AND
            ${notificationQueue.attempts} < 3`,
      )
      .orderBy(notificationQueue.scheduledFor)
      .limit(limit);

    return results.map((item) => ({
      ...item,
      payload:
        typeof item.payload === "string"
          ? JSON.parse(item.payload)
          : item.payload,
      type: item.type as NotificationType,
      // Drizzle with mode: "timestamp" returns Date objects directly
      scheduledFor: item.scheduledFor,
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
        scheduledFor: scheduledFor,
        updatedAt: now,
      })
      .where(eq(notificationQueue.id, id));

    console.log(
      `Notification ${id} rescheduled for ${scheduledFor.toISOString()}`,
    );
  }

  /**
   * Delete processed notifications older than a certain date
   */
  async cleanupOldNotifications(olderThan: Date): Promise<number> {
    const result = await db
      .delete(notificationQueue)
      .where(
        sql`${notificationQueue.status} = 'processed' AND 
            ${notificationQueue.updatedAt} < ${olderThan}`,
      )
      .returning({ id: notificationQueue.id });

    console.log(`Cleaned up ${result.length} old notifications`);
    return result.length;
  }
}

// Create a singleton instance
export const notificationQueueService = new NotificationQueueService();
