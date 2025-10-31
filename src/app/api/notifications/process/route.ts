import { type NextRequest, NextResponse } from "next/server";
import { notificationScheduler } from "@/server/notifications/notification-scheduler";
import { auth } from "@/server/auth";

/**
 * POST /api/notifications/process
 * Process pending notifications
 * This endpoint can be called manually or by a cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Allow unauthenticated access for cron jobs, but require auth for manual calls
    const authHeader = request.headers.get("authorization");
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronJob) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Get the limit from the request body
    let limit = 10;
    try {
      const body = await request.json();
      limit = body.limit ?? 10;
    } catch {
      // If no body, use default limit
    }

    // Process pending notifications
    const processedCount =
      await notificationScheduler.processPendingNotifications(limit);

    return NextResponse.json({
      success: true,
      processedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing notifications:", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/notifications/process
 * Process pending notifications (for testing)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication for this endpoint
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process pending notifications (limit to 5 for testing)
    const processedCount =
      await notificationScheduler.processPendingNotifications(5);

    return NextResponse.json({
      success: true,
      processedCount,
    });
  } catch (error) {
    console.error("Error processing notifications:", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 },
    );
  }
}
