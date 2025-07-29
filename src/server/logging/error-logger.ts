/**
 * Enhanced error logging system for comprehensive error tracking and monitoring
 */

import { bookingLogger } from "./booking-logger";

export interface ErrorLogEntry {
  level: "error" | "warn" | "info" | "debug";
  message: string;
  error?: Error;
  context: Record<string, unknown>;
  metadata: Record<string, unknown>;
  timestamp: Date;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ErrorMetrics {
  errorCount: number;
  errorRate: number; // errors per minute
  topErrors: Array<{
    code: string;
    count: number;
    percentage: number;
  }>;
  errorsByOperation: Record<string, number>;
  errorsByUser: Record<string, number>;
  recentErrors: ErrorLogEntry[];
}

/**
 * Enhanced error logger with comprehensive tracking and metrics
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private errorHistory: ErrorLogEntry[] = [];
  private readonly maxHistorySize = 1000;
  private readonly metricsWindow = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with comprehensive context
   */
  logError(
    message: string,
    error?: Error,
    context: Record<string, unknown> = {},
    metadata: Record<string, unknown> = {},
  ): void {
    const entry: ErrorLogEntry = {
      level: "error",
      message,
      error,
      context,
      metadata,
      timestamp: new Date(),
      correlationId: metadata.correlationId as string,
      userId: context.userId as string,
      sessionId: context.sessionId as string,
      userAgent: context.userAgent as string,
      ipAddress: context.ipAddress as string,
    };

    // Add to history
    this.addToHistory(entry);

    // Log using existing booking logger
    bookingLogger.error(message, error, context, metadata);

    // Send to external monitoring services in production
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoringServices(entry);
    }
  }

  /**
   * Log a warning
   */
  logWarning(
    message: string,
    context: Record<string, unknown> = {},
    metadata: Record<string, unknown> = {},
  ): void {
    const entry: ErrorLogEntry = {
      level: "warn",
      message,
      context,
      metadata,
      timestamp: new Date(),
      correlationId: metadata.correlationId as string,
      userId: context.userId as string,
    };

    this.addToHistory(entry);
    bookingLogger.warn(message, context, metadata);
  }

  /**
   * Log an info message
   */
  logInfo(
    message: string,
    context: Record<string, unknown> = {},
    metadata: Record<string, unknown> = {},
  ): void {
    const entry: ErrorLogEntry = {
      level: "info",
      message,
      context,
      metadata,
      timestamp: new Date(),
      correlationId: metadata.correlationId as string,
      userId: context.userId as string,
    };

    this.addToHistory(entry);
    bookingLogger.info(message, context, metadata);
  }

  /**
   * Log user action for error context
   */
  logUserAction(
    action: string,
    userId: string,
    context: Record<string, unknown> = {},
  ): void {
    this.logInfo(`User action: ${action}`, {
      ...context,
      userId,
      actionType: "user_action",
    });
  }

  /**
   * Log API request for error context
   */
  logApiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context: Record<string, unknown> = {},
  ): void {
    const level =
      statusCode >= 400 ? "error" : statusCode >= 300 ? "warn" : "info";

    const entry: ErrorLogEntry = {
      level,
      message: `${method} ${path} - ${statusCode} (${duration}ms)`,
      context: {
        ...context,
        method,
        path,
        statusCode,
        duration,
        requestType: "api_request",
      },
      metadata: {},
      timestamp: new Date(),
    };

    this.addToHistory(entry);

    if (level === "error") {
      bookingLogger.error(entry.message, undefined, entry.context);
    } else if (level === "warn") {
      bookingLogger.warn(entry.message, entry.context);
    } else {
      bookingLogger.info(entry.message, entry.context);
    }
  }

  /**
   * Log booking operation with detailed context
   */
  logBookingOperation(
    operation: string,
    success: boolean,
    duration: number,
    context: Record<string, unknown> = {},
    error?: Error,
  ): void {
    const message = `Booking operation: ${operation} - ${success ? "SUCCESS" : "FAILED"} (${duration}ms)`;

    const operationContext = {
      ...context,
      operation,
      success,
      duration,
      operationType: "booking_operation",
    };

    if (success) {
      this.logInfo(message, operationContext);
    } else {
      this.logError(message, error, operationContext);
    }
  }

  /**
   * Get error metrics for monitoring dashboard
   */
  getErrorMetrics(): ErrorMetrics {
    const now = Date.now();
    const windowStart = now - this.metricsWindow;

    // Filter errors within the metrics window
    const recentErrors = this.errorHistory.filter(
      (entry) =>
        entry.timestamp.getTime() >= windowStart && entry.level === "error",
    );

    // Calculate error rate (errors per minute)
    const errorRate = recentErrors.length / (this.metricsWindow / 60000);

    // Count errors by code
    const errorCounts = new Map<string, number>();
    const operationCounts = new Map<string, number>();
    const userCounts = new Map<string, number>();

    recentErrors.forEach((entry) => {
      // Count by error code
      const errorCode = (entry.context.errorCode as string) || "UNKNOWN";
      errorCounts.set(errorCode, (errorCounts.get(errorCode) || 0) + 1);

      // Count by operation
      const operation = (entry.context.operation as string) || "unknown";
      operationCounts.set(operation, (operationCounts.get(operation) || 0) + 1);

      // Count by user
      if (entry.userId) {
        userCounts.set(entry.userId, (userCounts.get(entry.userId) || 0) + 1);
      }
    });

    // Get top errors
    const topErrors = Array.from(errorCounts.entries())
      .map(([code, count]) => ({
        code,
        count,
        percentage: (count / recentErrors.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      errorCount: recentErrors.length,
      errorRate,
      topErrors,
      errorsByOperation: Object.fromEntries(operationCounts),
      errorsByUser: Object.fromEntries(userCounts),
      recentErrors: recentErrors.slice(-50), // Last 50 errors
    };
  }

  /**
   * Get error history for debugging
   */
  getErrorHistory(limit = 100): ErrorLogEntry[] {
    return this.errorHistory
      .filter((entry) => entry.level === "error")
      .slice(-limit)
      .reverse();
  }

  /**
   * Search error history
   */
  searchErrors(
    query: string,
    filters: {
      level?: "error" | "warn" | "info" | "debug";
      userId?: string;
      operation?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): ErrorLogEntry[] {
    return this.errorHistory.filter((entry) => {
      // Level filter
      if (filters.level && entry.level !== filters.level) {
        return false;
      }

      // User filter
      if (filters.userId && entry.userId !== filters.userId) {
        return false;
      }

      // Operation filter
      if (filters.operation && entry.context.operation !== filters.operation) {
        return false;
      }

      // Date range filter
      if (filters.startDate && entry.timestamp < filters.startDate) {
        return false;
      }
      if (filters.endDate && entry.timestamp > filters.endDate) {
        return false;
      }

      // Text search
      if (query) {
        const searchText =
          `${entry.message} ${JSON.stringify(entry.context)} ${JSON.stringify(entry.metadata)}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      }

      return true;
    });
  }

  /**
   * Clear old error history to prevent memory leaks
   */
  clearOldHistory(): void {
    const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
    this.errorHistory = this.errorHistory.filter(
      (entry) => entry.timestamp.getTime() >= cutoffTime,
    );
  }

  /**
   * Export error data for analysis
   */
  exportErrorData(startDate?: Date, endDate?: Date): string {
    const filteredErrors = this.errorHistory.filter((entry) => {
      if (startDate && entry.timestamp < startDate) return false;
      if (endDate && entry.timestamp > endDate) return false;
      return true;
    });

    return JSON.stringify(filteredErrors, null, 2);
  }

  /**
   * Add entry to history with size management
   */
  private addToHistory(entry: ErrorLogEntry): void {
    this.errorHistory.push(entry);

    // Maintain history size limit
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Send error to external monitoring services
   */
  private sendToMonitoringServices(entry: ErrorLogEntry): void {
    // In a production environment, you would send errors to services like:
    // - Sentry
    // - DataDog
    // - New Relic
    // - CloudWatch
    // - Custom monitoring endpoints

    try {
      // Example: Send to Sentry
      if (process.env.SENTRY_DSN) {
        // Sentry.captureException(entry.error, {
        //   tags: {
        //     operation: entry.context.operation,
        //     userId: entry.userId,
        //   },
        //   extra: {
        //     context: entry.context,
        //     metadata: entry.metadata,
        //   },
        // });
      }

      // Example: Send to custom monitoring endpoint
      if (process.env.MONITORING_WEBHOOK_URL) {
        fetch(process.env.MONITORING_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            level: entry.level,
            message: entry.message,
            error: entry.error?.message,
            stack: entry.error?.stack,
            context: entry.context,
            metadata: entry.metadata,
            timestamp: entry.timestamp.toISOString(),
            correlationId: entry.correlationId,
          }),
        }).catch((err) => {
          console.error("Failed to send error to monitoring service:", err);
        });
      }
    } catch (error) {
      console.error("Error in sendToMonitoringServices:", error);
    }
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Auto-cleanup old history every hour
if (typeof window === "undefined") {
  // Server-side only
  setInterval(
    () => {
      errorLogger.clearOldHistory();
    },
    60 * 60 * 1000,
  ); // 1 hour
}
