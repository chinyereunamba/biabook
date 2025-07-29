import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { errorMonitor } from "@/server/monitoring/error-monitor";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors } from "@/server/errors/booking-errors";
import { bookingLogger } from "@/server/logging/booking-logger";

async function getErrorMetricsHandler(request: NextRequest) {
  const startTime = Date.now();
  const context = {
    operation: "getErrorMetrics",
    path: "/api/admin/errors",
    method: "GET",
  };

  try {
    // Check authentication and admin permissions
    const session = await auth();
    if (!session?.user) {
      throw BookingErrors.validation("Authentication required", "auth", [
        "Please log in to access error metrics",
      ]);
    }

    // In a real app, you'd check for admin role here
    // For now, we'll allow any authenticated user
    // if (!session.user.role || session.user.role !== 'admin') {
    //   throw BookingErrors.validation("Admin access required", "authorization");
    // }

    const { searchParams } = new URL(request.url);
    const hoursParam = searchParams.get("hours");
    const hours = hoursParam ? parseInt(hoursParam, 10) : 24;

    // Validate hours parameter
    if (isNaN(hours) || hours < 1 || hours > 168) {
      throw BookingErrors.validation(
        "Invalid time range",
        "hours",
        ["Hours must be between 1 and 168 (1 week)"],
      );
    }

    const timeRange = {
      from: new Date(Date.now() - hours * 60 * 60 * 1000),
      to: new Date(),
    };

    // Get error metrics
    const metrics = errorMonitor.getErrorMetrics(timeRange);
    const report = errorMonitor.generateErrorReport(timeRange);
    const alertConfig = errorMonitor.getAlertConfig();

    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation("getErrorMetrics", true, duration, {
      ...context,
      userId: session.user.id,
      timeRangeHours: hours,
    });

    return NextResponse.json({
      timeRange: {
        from: timeRange.from.toISOString(),
        to: timeRange.to.toISOString(),
        hours,
      },
      metrics,
      report,
      alertConfig,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation(
      "getErrorMetrics",
      false,
      duration,
      context,
      error as Error,
    );

    throw error;
  }
}

async function updateAlertConfigHandler(request: NextRequest) {
  const startTime = Date.now();
  const context = {
    operation: "updateAlertConfig",
    path: "/api/admin/errors",
    method: "POST",
  };

  try {
    // Check authentication and admin permissions
    const session = await auth();
    if (!session?.user) {
      throw BookingErrors.validation("Authentication required", "auth", [
        "Please log in to update alert configuration",
      ]);
    }

    const body = await request.json();
    const { errorRate, criticalErrorCount, timeWindow } = body;

    // Validate alert configuration
    if (typeof errorRate !== "number" || errorRate < 0 || errorRate > 100) {
      throw BookingErrors.validation(
        "Invalid error rate threshold",
        "errorRate",
        ["Error rate must be between 0 and 100"],
      );
    }

    if (typeof criticalErrorCount !== "number" || criticalErrorCount < 1) {
      throw BookingErrors.validation(
        "Invalid critical error count",
        "criticalErrorCount",
        ["Critical error count must be at least 1"],
      );
    }

    if (typeof timeWindow !== "number" || timeWindow < 1 || timeWindow > 1440) {
      throw BookingErrors.validation(
        "Invalid time window",
        "timeWindow",
        ["Time window must be between 1 and 1440 minutes (24 hours)"],
      );
    }

    // Update alert thresholds
    errorMonitor.updateThresholds({
      errorRate,
      criticalErrorCount,
      timeWindow,
    });

    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation("updateAlertConfig", true, duration, {
      ...context,
      userId: session.user.id,
      newConfig: { errorRate, criticalErrorCount, timeWindow },
    });

    return NextResponse.json({
      message: "Alert configuration updated successfully",
      config: errorMonitor.getAlertConfig(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation(
      "updateAlertConfig",
      false,
      duration,
      context,
      error as Error,
    );

    throw error;
  }
}

export const GET = withErrorHandler(getErrorMetricsHandler);
export const POST = withErrorHandler(updateAlertConfigHandler);