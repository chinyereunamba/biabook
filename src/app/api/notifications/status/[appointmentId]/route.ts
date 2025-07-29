import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { notificationQueue } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { NotificationStatus } from "@/components/ui/notification-status";

/**
 * GET /api/notifications/status/[appointmentId]
 * Get notification status for a specific appointment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { appointmentId: string } },
) {
  try {
    const { appointmentId } = params;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: "Appointment ID is required" },
        { status: 400 },
      );
    }

    // Query notification queue for this appointment
    const notifications = await db
      .select()
      .from(notificationQueue)
      .where(eq(notificationQueue.payload, JSON.stringify({ appointmentId })));

    // Transform database records to UI format
    const notificationStatuses: NotificationStatus[] = notifications.map(
      (notification) => {
        // Determine notification type based on recipient
        let type: NotificationStatus["type"] = "email";
        if (notification.recipientPhone) {
          type = notification.type.includes("whatsapp") ? "whatsapp" : "sms";
        }

        // Map database status to UI status
        let status: NotificationStatus["status"] = "pending";
        switch (notification.status) {
          case "processed":
            status = "delivered";
            break;
          case "failed":
            status = "failed";
            break;
          case "pending":
          default:
            status = "pending";
            break;
        }

        return {
          id: notification.id!,
          type,
          status,
          recipient:
            notification.recipientEmail ||
            notification.recipientPhone ||
            "Unknown",
          sentAt:
            notification.status === "processed"
              ? notification.lastAttemptAt
              : undefined,
          error: notification.error || undefined,
          retryCount: notification.attempts || 0,
        };
      },
    );

    return NextResponse.json({
      success: true,
      notifications: notificationStatuses,
    });
  } catch (error) {
    console.error("Error fetching notification status:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notification status",
      },
      { status: 500 },
    );
  }
}
