import { NextResponse } from "next/server";
import { notificationCleanupService } from "@/server/notifications/notification-cleanup-service";

/**
 * Manual notification cleanup endpoint
 * GET /api/notifications/cleanup?days=15
 *
 * Deletes processed and failed notifications older than specified days
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "15");

    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        {
          success: false,
          error: "Days must be between 1 and 365",
        },
        { status: 400 },
      );
    }

    console.log(`\n[API] Manual cleanup requested (retention: ${days} days)`);

    const deletedCount = await notificationCleanupService.manualCleanup(days);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} old notification(s)`,
      data: {
        deletedCount,
        retentionDays: days,
        cutoffDate: new Date(
          Date.now() - days * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup notifications",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Get cleanup service status
 * POST /api/notifications/cleanup
 */
export async function POST() {
  try {
    const status = notificationCleanupService.getStatus();

    return NextResponse.json({
      success: true,
      data: {
        running: status.running,
        message: status.running
          ? "Cleanup service is running (every 24 hours)"
          : "Cleanup service is not running",
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check cleanup service status",
      },
      { status: 500 },
    );
  }
}
