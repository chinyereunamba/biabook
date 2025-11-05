import { NextRequest, NextResponse } from "next/server";
import { notificationQueueService } from "@/server/notifications/notification-queue";

/**
 * Test endpoint for notification system
 * POST /api/notifications/test
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create a test notification
    const testNotification = {
      type: "booking_confirmation" as const,
      recipientId: "test-recipient",
      recipientType: "customer" as const,
      recipientEmail: body.email || "test@example.com",
      recipientPhone: body.phone || null,
      payload: {
        businessName: "Test Business",
        serviceName: "Test Service",
        appointmentDate: new Date().toISOString(),
        customerName: "Test Customer",
      },
      scheduledFor: new Date(Date.now() + 5000), // 5 seconds from now
    };

    const notificationId =
      await notificationQueueService.enqueue(testNotification);

    return NextResponse.json({
      success: true,
      message: "Test notification queued successfully",
      notificationId,
      scheduledFor: testNotification.scheduledFor,
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Get pending notifications for testing
 * GET /api/notifications/test
 */
export async function GET() {
  try {
    const pendingNotifications =
      await notificationQueueService.getPendingNotifications(5);

    return NextResponse.json({
      success: true,
      notifications: pendingNotifications,
      count: pendingNotifications.length,
    });
  } catch (error) {
    console.error("Error fetching test notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
