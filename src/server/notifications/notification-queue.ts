import { db } from "@/server/db";
import { sql } from "drizzle-orm";
import { notificationQueue } from "@/server/db/schema";
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
    const [result] = await db
      .insert(notificationQueue)
      .values({
        type: notification.type,
        recipientId: notification.recipientId,
        recipientType: notification.recipientType,
        recipientEmail: notification.recipientEmail,
        recipientPhone: notification.recipientPhone ?? undefined,
        payload: JSON.stringify(notification.payload),
        scheduledFor: notification.scheduledFor,
        status: "pending",
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: notificationQueue.id });

    if (!result) {
      throw new Error("Failed to enqueue notification");
    }

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
    }));
  }

  /**
   * Mark a notification as processed
   */
  async markAsProcessed(id: string): Promise<void> {
    await db
      .update(notificationQueue)
      .set({
        status: "processed",
        updatedAt: new Date(),
      })
      .where(sql`${notificationQueue.id} = ${id}`);
  }

  /**
   * Mark a notification as failed and increment attempt count
   */
  async markAsFailed(id: string, error?: string): Promise<void> {
    const [notification] = await db
      .select()
      .from(notificationQueue)
      .where(sql`${notificationQueue.id} = ${id}`)
      .limit(1);

    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    const attempts = notification.attempts + 1;
    const status = attempts >= 3 ? "failed" : "pending";

    await db
      .update(notificationQueue)
      .set({
        status,
        attempts,
        lastAttemptAt: new Date(),
        error: error ?? null,
        updatedAt: new Date(),
      })
      .where(sql`${notificationQueue.id} = ${id}`);
  }

  /**
   * Reschedule a notification for later
   */
  async reschedule(id: string, scheduledFor: Date): Promise<void> {
    await db
      .update(notificationQueue)
      .set({
        scheduledFor,
        updatedAt: new Date(),
      })
      .where(sql`${notificationQueue.id} = ${id}`);
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

    return result.length;
  }
}

// Create a singleton instance
export const notificationQueueService = new NotificationQueueService();
