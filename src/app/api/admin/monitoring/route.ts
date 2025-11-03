import { NextRequest, NextResponse } from "next/server";
import { bookingPerformanceMonitor } from "@/server/monitoring/booking-performance-monitor";
import { auth } from "@/server/auth";

/**
 * GET /api/admin/monitoring
 * Get booking system performance metrics and health data
 *
 * Query Parameters:
 * - businessId: Optional business ID to filter metrics
 * - timeRange: Time range in hours (default: 24)
 * - format: Response format ('json' | 'prometheus', default: 'json')
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    const timeRangeHours = parseInt(searchParams.get("timeRange") || "24");
    const format =
      (searchParams.get("format") as "json" | "prometheus") || "json";

    // Validate time range
    if (timeRangeHours < 1 || timeRangeHours > 168) {
      // Max 1 week
      return NextResponse.json(
        { error: "Time range must be between 1 and 168 hours" },
        { status: 400 },
      );
    }

    const now = Date.now();
    const timeRange = {
      start: now - timeRangeHours * 60 * 60 * 1000,
      end: now,
    };

    if (format === "prometheus") {
      const prometheusMetrics =
        bookingPerformanceMonitor.exportMetrics("prometheus");
      return new Response(prometheusMetrics, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // Get system health metrics
    const systemHealth =
      bookingPerformanceMonitor.getSystemHealthMetrics(timeRange);

    // Get performance alerts
    const alerts = bookingPerformanceMonitor.getPerformanceAlerts();

    let businessMetrics = null;
    let conversionMetrics = null;

    if (businessId) {
      // Get business-specific metrics
      businessMetrics = bookingPerformanceMonitor.getBusinessMetrics(
        businessId,
        timeRange,
      );
      conversionMetrics = bookingPerformanceMonitor.getConversionMetrics(
        businessId,
        7,
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        systemHealth,
        alerts,
        businessMetrics,
        conversionMetrics,
        timeRange: {
          start: new Date(timeRange.start).toISOString(),
          end: new Date(timeRange.end).toISOString(),
          hours: timeRangeHours,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching monitoring data:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitoring data" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/monitoring/alert
 * Manually trigger performance alerts check
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const alerts = bookingPerformanceMonitor.getPerformanceAlerts();

    // In a production system, you might want to send these alerts
    // to external monitoring systems like Slack, PagerDuty, etc.
    const criticalAlerts = alerts.filter((alert) => alert.severity === "high");

    if (criticalAlerts.length > 0) {
      console.warn("Critical performance alerts detected:", criticalAlerts);
      // TODO: Send to external alerting system
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        criticalCount: criticalAlerts.length,
        totalCount: alerts.length,
      },
    });
  } catch (error) {
    console.error("Error checking alerts:", error);
    return NextResponse.json(
      { error: "Failed to check alerts" },
      { status: 500 },
    );
  }
}
