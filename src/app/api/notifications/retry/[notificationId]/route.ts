import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { notificationQueue } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { notificationScheduler } from "@/server/notifications/notification-scheduler";

/**
 * POST /api/notifications/retry/[notificationId]
 * Retry a failed notification
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { notificationId } = await params;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 },
      );
    }

    // Find the notification in the queue
    const [notification] = await db
      .select()
      .from(notificationQueue)
      .where(eq(notificationQueue.id, notificationId))
      .limit(1);

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.status !== "failed") {
      return NextResponse.json(
        { success: false, error: "Only failed notifications can be retried" },
        { status: 400 },
      );
    }

    // Reset the notification status to pending and increment attempts
    await db
      .update(notificationQueue)
      .set({
        status: "pending",
        error: null,
        attempts: (notification.attempts || 0) + 1,
        scheduledFor: new Date(), // Retry immediately
      })
      .where(eq(notificationQueue.id, notificationId));

    // Process the notification immediately
    try {
      await notificationScheduler.processPendingNotifications(1);
    } catch (processingError) {
      console.error("Error processing retried notification:", processingError);
      // Don't fail the API call if processing fails - it will be picked up by the scheduler
    }

    return NextResponse.json({
      success: true,
      message: "Notification retry initiated",
    });
  } catch (error) {
    console.error("Error retrying notification:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retry notification",
      },
      { status: 500 },
    );
  }
}
