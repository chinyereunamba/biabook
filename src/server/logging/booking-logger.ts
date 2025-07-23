/**
 * Logging service for booking operations
 */

export interface LogContext {
  userId?: string;
  businessId?: string;
  appointmentId?: string;
  serviceId?: string;
  customerEmail?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  context?: LogContext;
  error?: Error;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export class BookingLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  /**
   * Log an info message
   */
  info(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ) {
    this.log("info", message, context, undefined, metadata);
  }

  /**
   * Log a warning message
   */
  warn(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ) {
    this.log("warn", message, context, undefined, metadata);
  }

  /**
   * Log an error message
   */
  error(
    message: string,
    error?: Error,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ) {
    this.log("error", message, context, error, metadata);
  }

  /**
   * Log a debug message
   */
  debug(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ) {
    this.log("debug", message, context, undefined, metadata);
  }

  /**
   * Log a booking operation with timing
   */
  logBookingOperation(
    operation: string,
    success: boolean,
    duration: number,
    context?: LogContext,
    error?: Error,
    metadata?: Record<string, unknown>,
  ) {
    const level = success ? "info" : "error";
    const message = `Booking operation: ${operation} ${success ? "succeeded" : "failed"}`;

    this.log(level, message, context, error, {
      ...metadata,
      operation,
      success,
      duration,
    });
  }

  /**
   * Log a conflict detection event
   */
  logConflictDetection(
    conflictType: string,
    resolved: boolean,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ) {
    const level = resolved ? "warn" : "error";
    const message = `Booking conflict detected: ${conflictType} - ${resolved ? "resolved" : "unresolved"}`;

    this.log(level, message, context, undefined, {
      ...metadata,
      conflictType,
      resolved,
    });
  }

  /**
   * Log validation errors
   */
  logValidationError(
    field: string,
    value: unknown,
    reason: string,
    context?: LogContext,
  ) {
    this.log(
      "warn",
      `Validation failed for ${field}: ${reason}`,
      context,
      undefined,
      {
        field,
        value: typeof value === "string" ? value : JSON.stringify(value),
        reason,
      },
    );
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetric(
    operation: string,
    duration: number,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ) {
    const level = duration > 5000 ? "warn" : "info"; // Warn if operation takes > 5 seconds
    const message = `Performance: ${operation} took ${duration}ms`;

    this.log(level, message, context, undefined, {
      ...metadata,
      operation,
      duration,
      performanceMetric: true,
    });
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 100, level?: LogEntry["level"]): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = this.logs.filter((log) => log.level === level);
    }

    return filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get logs for a specific context
   */
  getLogsForContext(context: Partial<LogContext>, limit = 100): LogEntry[] {
    return this.logs
      .filter((log) => {
        if (!log.context) return false;

        return Object.entries(context).every(
          ([key, value]) => log.context![key] === value,
        );
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeRange?: { from: Date; to: Date }): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByOperation: Record<string, number>;
    recentErrors: LogEntry[];
  } {
    let errorLogs = this.logs.filter((log) => log.level === "error");

    if (timeRange) {
      errorLogs = errorLogs.filter(
        (log) =>
          log.timestamp >= timeRange.from && log.timestamp <= timeRange.to,
      );
    }

    const errorsByType: Record<string, number> = {};
    const errorsByOperation: Record<string, number> = {};

    errorLogs.forEach((log) => {
      // Count by error type
      const errorType = log.error?.name ?? "Unknown";
      errorsByType[errorType] = (errorsByType[errorType] ?? 0) + 1;

      // Count by operation
      const operation = String(log.metadata?.operation ?? "Unknown");
      errorsByOperation[operation] = (errorsByOperation[operation] ?? 0) + 1;
    });

    return {
      totalErrors: errorLogs.length,
      errorsByType,
      errorsByOperation,
      recentErrors: errorLogs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10),
    };
  }

  /**
   * Clear old logs to prevent memory issues
   */
  private cleanupLogs() {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.maxLogs);
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogEntry["level"],
    message: string,
    context?: LogContext,
    error?: Error,
    metadata?: Record<string, unknown>,
  ) {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
      metadata,
    };

    this.logs.push(logEntry);
    this.cleanupLogs();

    // In production, you would send this to a proper logging service
    // For now, we'll use console logging with structured output
    this.consoleLog(logEntry);
  }

  /**
   * Console logging with structured output
   */
  private consoleLog(entry: LogEntry) {
    const logData = {
      timestamp: entry.timestamp.toISOString(),
      level: entry.level.toUpperCase(),
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.error && {
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        },
      }),
      ...(entry.metadata && { metadata: entry.metadata }),
    };

    switch (entry.level) {
      case "error":
        console.error("[BOOKING]", JSON.stringify(logData, null, 2));
        break;
      case "warn":
        console.warn("[BOOKING]", JSON.stringify(logData, null, 2));
        break;
      case "debug":
        console.debug("[BOOKING]", JSON.stringify(logData, null, 2));
        break;
      default:
        console.log("[BOOKING]", JSON.stringify(logData, null, 2));
    }
  }
}

// Export singleton instance
export const bookingLogger = new BookingLogger();

/**
 * Decorator for logging method execution
 */
export function logExecution(operation: string) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();
      const context: LogContext = {
        operation: `${(target as { constructor: { name: string } }).constructor.name}.${propertyName}`,
      };

      try {
        bookingLogger.debug(`Starting ${operation}`, context);
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;

        bookingLogger.logBookingOperation(operation, true, duration, context);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        bookingLogger.logBookingOperation(
          operation,
          false,
          duration,
          context,
          error as Error,
        );
        throw error;
      }
    };

    return descriptor;
  };
}
