import { type NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { errorLogger } from "@/server/logging/error-logger";
import { errorMonitor } from "@/server/monitoring/error-monitor";
import { bookingLogger } from "@/server/logging/booking-logger";
import { auth } from "@/server/auth";

async function getErrorDashboardHandler(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you'd check for admin role
    // if (!session.user.role?.includes('admin')) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") || "24h";
    const errorType = searchParams.get("errorType");
    const operation = searchParams.get("operation");

    // Calculate time
    const now = new Date();
    let fromDate: Date;

    switch (timeRange) {
      case "1h":
        fromDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get error metrics from error monitor
    const errorMetrics = errorMonitor.getErrorMetrics({
      from: fromDate,
      to: now,
    });

    // Get error statistics from booking logger
    const bookingStats = bookingLogger.getErrorStats({
      from: fromDate,
      to: now,
    });

    // Get detailed error metrics from error logger
    const detailedMetrics = errorLogger.getErrorMetrics();

    // Get error history with filters
    const errorHistory = errorLogger.searchErrors("", {
      level: errorType as any,
      operation,
      startDate: fromDate,
      endDate: now,
    });

    // Generate error report
    const errorReport = errorMonitor.generateErrorReport({
      from: fromDate,
      to: now,
    });

    // Calculate additional metrics
    const totalRequests = getTotalRequests(fromDate, now);
    const errorRate =
      totalRequests > 0 ? (errorMetrics.totalErrors / totalRequests) * 100 : 0;

    // Get top error patterns
    const errorPatterns = getErrorPatterns(errorHistory);

    // Get user impact analysis
    const userImpact = getUserImpactAnalysis(errorHistory);

    const dashboardData = {
      overview: {
        totalErrors: errorMetrics.totalErrors,
        errorRate: Math.round(errorRate * 100) / 100,
        criticalErrors: errorMetrics.criticalErrors,
        totalRequests,
        timeRange,
        lastUpdated: now.toISOString(),
      },

      errorsByType: errorMetrics.errorsByType,
      errorsByEndpoint: errorMetrics.errorsByEndpoint,

      trends: {
        errorTrend: errorReport.trends.errorTrend,
        mostProblematicEndpoint: errorReport.trends.mostProblematicEndpoint,
        mostCommonError: errorReport.trends.mostCommonError,
      },

      recentErrors: errorMetrics.recentErrors.slice(0, 20),

      recommendations: errorReport.recommendations,

      patterns: errorPatterns,

      userImpact,

      bookingSpecific: {
        bookingErrors: bookingStats.totalErrors,
        errorsByOperation: bookingStats.errorsByOperation,
        recentBookingErrors: bookingStats.recentErrors.slice(0, 10),
      },

      systemHealth: {
        alertThresholds: errorMonitor.getAlertConfig(),
        currentAlertStatus: errorMonitor.checkAlertThresholds(),
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}

/**
 * Get total requests count (simplified - in real app would track this properly)
 */
function getTotalRequests(fromDate: Date, toDate: Date): number {
  // This is a simplified calculation
  // In a real app, you'd track successful requests as well
  const allLogs = bookingLogger.getRecentLogs(1000);
  return allLogs.filter(
    (log: { timestamp: string | number | Date }) => new Date(log.timestamp) >= fromDate && new Date(log.timestamp) <= toDate,
  ).length;
}

/**
 * Analyze error patterns for insights
 */
function getErrorPatterns(errorHistory: any[]): Array<{
  pattern: string;
  count: number;
  severity: string;
  description: string;
}> {
  const patterns = new Map<
    string,
    { count: number; severity: string; description: string }
  >();

  errorHistory.forEach((error) => {
    const errorCode = error.context.errorCode || "UNKNOWN";
    const operation = error.context.operation || "unknown";
    const pattern = `${errorCode}_${operation}`;

    if (!patterns.has(pattern)) {
      patterns.set(pattern, {
        count: 0,
        severity: error.level,
        description: getPatternDescription(errorCode, operation),
      });
    }

    patterns.get(pattern)!.count++;
  });

  return Array.from(patterns.entries())
    .map(([pattern, data]) => ({
      pattern,
      ...data,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Get description for error patterns
 */
function getPatternDescription(errorCode: string, operation: string): string {
  const descriptions: Record<string, string> = {
    BOOKING_CONFLICT_createBooking:
      "Users trying to book already taken time slots",
    VALIDATION_ERROR_createBooking: "Invalid booking data submitted by users",
    BUSINESS_UNAVAILABLE_getAvailability:
      "Requests for unavailable business hours",
    SERVICE_NOT_FOUND_getServices: "Requests for non-existent services",
    DATABASE_ERROR_createBooking: "Database issues during booking creation",
    RATE_LIMIT_EXCEEDED_createBooking:
      "Too many booking attempts from same user",
  };

  const key = `${errorCode}_${operation}`;
  return descriptions[key] || `${errorCode} errors in ${operation} operation`;
}

/**
 * Analyze user impact from errors
 */
function getUserImpactAnalysis(errorHistory: any[]): {
  affectedUsers: number;
  topAffectedUsers: Array<{ userId: string; errorCount: number }>;
  impactByOperation: Record<string, number>;
} {
  const userErrors = new Map<string, number>();
  const operationImpact = new Map<string, number>();

  errorHistory.forEach((error) => {
    if (error.context.userId) {
      userErrors.set(error.context.userId, (userErrors.get(error.context.userId) || 0) + 1);
    }

    const operation = error.context.operation || "unknown";
    operationImpact.set(operation, (operationImpact.get(operation) || 0) + 1);
  });

  const topAffectedUsers = Array.from(userErrors.entries())
    .map(([userId, errorCount]) => ({ userId, errorCount }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 10);

  return {
    affectedUsers: userErrors.size,
    topAffectedUsers,
    impactByOperation: Object.fromEntries(operationImpact),
  };
}

export const GET = withErrorHandler(getErrorDashboardHandler);