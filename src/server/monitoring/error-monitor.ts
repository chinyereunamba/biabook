/**
 * Error monitoring and alerting service for booking operations
 */

import { bookingLogger } from "@/server/logging/booking-logger";

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  criticalErrors: number;
  errorsByType: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  recentErrors: Array<{
    timestamp: Date;
    code: string;
    message: string;
    endpoint: string;
    context?: Record<string, unknown>;
  }>;
}

export interface AlertThreshold {
  errorRate: number; // Percentage (e.g., 5 = 5%)
  criticalErrorCount: number;
  timeWindow: number; // Minutes
}

export class ErrorMonitor {
  private alertThresholds: AlertThreshold = {
    errorRate: 10, // Alert if error rate exceeds 10%
    criticalErrorCount: 5, // Alert if more than 5 critical errors
    timeWindow: 15, // Within 15 minutes
  };

  private lastAlertTime = new Map<string, Date>();
  private alertCooldown = 30 * 60 * 1000; // 30 minutes between alerts

  /**
   * Get error metrics for a specific time range
   */
  getErrorMetrics(timeRange?: { from: Date; to: Date }): ErrorMetrics {
    const stats = bookingLogger.getErrorStats(timeRange);
    const recentLogs = bookingLogger.getRecentLogs(100, "error");

    // Calculate error rate (assuming we track total requests somewhere)
    // For now, we'll use a simplified calculation
    const totalOperations = this.getTotalOperations(timeRange);
    const errorRate =
      totalOperations > 0 ? (stats.totalErrors / totalOperations) * 100 : 0;

    // Count critical errors
    const criticalErrors = recentLogs.filter(
      (log) =>
        log.metadata?.severity === "critical" ||
        log.error?.name === "DatabaseError" ||
        log.error?.name === "OptimisticLockError",
    ).length;

    // Group errors by endpoint
    const errorsByEndpoint: Record<string, number> = {};
    recentLogs.forEach((log) => {
      const endpoint = log.context?.path;
      if (typeof endpoint === "string") {
        errorsByEndpoint[endpoint] = (errorsByEndpoint[endpoint] || 0) + 1;
      }
    });

    return {
      totalErrors: stats.totalErrors,
      errorRate,
      criticalErrors,
      errorsByType: stats.errorsByType,
      errorsByEndpoint,
      recentErrors: recentLogs.map((log) => ({
        timestamp: log.timestamp,
        code: log.error?.name || "UNKNOWN_ERROR",
        message: log.message,
        endpoint: String(log.context?.path || "unknown"),
        context: log.context,
      })),
    };
  }

  /**
   * Check if error thresholds are exceeded and trigger alerts
   */
  checkAlertThresholds(): {
    shouldAlert: boolean;
    alertType: string;
    metrics: ErrorMetrics;
  } {
    const timeRange = {
      from: new Date(Date.now() - this.alertThresholds.timeWindow * 60 * 1000),
      to: new Date(),
    };

    const metrics = this.getErrorMetrics(timeRange);

    // Check error rate threshold
    if (metrics.errorRate > this.alertThresholds.errorRate) {
      if (this.shouldSendAlert("error_rate")) {
        return {
          shouldAlert: true,
          alertType: "HIGH_ERROR_RATE",
          metrics,
        };
      }
    }

    // Check critical error threshold
    if (metrics.criticalErrors > this.alertThresholds.criticalErrorCount) {
      if (this.shouldSendAlert("critical_errors")) {
        return {
          shouldAlert: true,
          alertType: "CRITICAL_ERRORS",
          metrics,
        };
      }
    }

    return {
      shouldAlert: false,
      alertType: "",
      metrics,
    };
  }

  /**
   * Send alert notification (placeholder for actual implementation)
   */
  async sendAlert(alertType: string, metrics: ErrorMetrics): Promise<void> {
    const alertMessage = this.formatAlertMessage(alertType, metrics);

    // Log the alert
    bookingLogger.error("ALERT TRIGGERED", undefined, {
      alertType,
      metrics: {
        totalErrors: metrics.totalErrors,
        errorRate: metrics.errorRate,
        criticalErrors: metrics.criticalErrors,
      },
    });

    // In a real implementation, you would send this to:
    // - Slack/Discord webhook
    // - Email notification service
    // - PagerDuty or similar alerting service
    // - SMS service for critical alerts

    console.error("🚨 BOOKING SYSTEM ALERT 🚨");
    console.error(alertMessage);

    // For demo purposes, we'll just log to console
    // In production, implement actual notification sending:
    /*
    try {
      await this.sendSlackAlert(alertMessage);
      await this.sendEmailAlert(alertMessage);
      
      if (alertType === "CRITICAL_ERRORS") {
        await this.sendSMSAlert(alertMessage);
      }
    } catch (error) {
      console.error("Failed to send alert:", error);
    }
    */
  }

  /**
   * Format alert message for notifications
   */
  private formatAlertMessage(alertType: string, metrics: ErrorMetrics): string {
    const timestamp = new Date().toISOString();

    let message = `🚨 BookMe Alert: ${alertType}\n`;
    message += `Time: ${timestamp}\n\n`;

    switch (alertType) {
      case "HIGH_ERROR_RATE":
        message += `Error Rate: ${metrics.errorRate.toFixed(2)}% (threshold: ${this.alertThresholds.errorRate}%)\n`;
        message += `Total Errors: ${metrics.totalErrors}\n`;
        break;

      case "CRITICAL_ERRORS":
        message += `Critical Errors: ${metrics.criticalErrors} (threshold: ${this.alertThresholds.criticalErrorCount})\n`;
        message += `Total Errors: ${metrics.totalErrors}\n`;
        break;
    }

    message += `\nTop Error Types:\n`;
    Object.entries(metrics.errorsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([type, count]) => {
        message += `- ${type}: ${count}\n`;
      });

    message += `\nTop Affected Endpoints:\n`;
    Object.entries(metrics.errorsByEndpoint)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([endpoint, count]) => {
        message += `- ${endpoint}: ${count}\n`;
      });

    message += `\nRecent Errors (last 5):\n`;
    metrics.recentErrors.slice(0, 5).forEach((error) => {
      message += `- ${error.timestamp.toISOString()}: ${error.code} at ${error.endpoint}\n`;
    });

    return message;
  }

  /**
   * Check if we should send an alert (respects cooldown period)
   */
  private shouldSendAlert(alertKey: string): boolean {
    const lastAlert = this.lastAlertTime.get(alertKey);
    const now = new Date();

    if (
      !lastAlert ||
      now.getTime() - lastAlert.getTime() > this.alertCooldown
    ) {
      this.lastAlertTime.set(alertKey, now);
      return true;
    }

    return false;
  }

  /**
   * Get total operations count (simplified implementation)
   * In a real system, this would track all successful operations too
   */
  private getTotalOperations(timeRange?: { from: Date; to: Date }): number {
    // This is a simplified calculation
    // In a real implementation, you'd track successful operations as well
    const allLogs = bookingLogger.getRecentLogs(1000);

    if (timeRange) {
      const filteredLogs = allLogs.filter(
        (log) =>
          log.timestamp >= timeRange.from && log.timestamp <= timeRange.to,
      );
      return filteredLogs.length;
    }

    return allLogs.length;
  }

  /**
   * Update alert thresholds
   */
  updateThresholds(thresholds: Partial<AlertThreshold>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };

    bookingLogger.info("Alert thresholds updated", undefined, {
      newThresholds: this.alertThresholds,
    });
  }

  /**
   * Get current alert configuration
   */
  getAlertConfig(): AlertThreshold {
    return { ...this.alertThresholds };
  }

  /**
   * Reset alert cooldowns (useful for testing)
   */
  resetAlertCooldowns(): void {
    this.lastAlertTime.clear();
  }

  /**
   * Generate error report for a specific time period
   */
  generateErrorReport(timeRange: { from: Date; to: Date }): {
    summary: ErrorMetrics;
    recommendations: string[];
    trends: {
      errorTrend: "increasing" | "decreasing" | "stable";
      mostProblematicEndpoint: string;
      mostCommonError: string;
    };
  } {
    const metrics = this.getErrorMetrics(timeRange);

    // Generate recommendations based on error patterns
    const recommendations: string[] = [];

    if (metrics.errorRate > 5) {
      recommendations.push(
        "High error rate detected. Consider implementing circuit breakers.",
      );
    }

    if (
      metrics.errorsByType &&
      (metrics.errorsByType["ConflictError"] || 0) > 10
    ) {
      recommendations.push(
        "High booking conflicts. Consider implementing better availability caching.",
      );
    }

    if (
      metrics.errorsByType &&
      (metrics.errorsByType["ValidationError"] || 0) > 20
    ) {
      recommendations.push(
        "Many validation errors. Review input validation on frontend.",
      );
    }

    if (
      metrics.errorsByType &&
      (metrics.errorsByType["DatabaseError"] || 0) > 5
    ) {
      recommendations.push(
        "Database errors detected. Check database performance and connections.",
      );
    }

    // Determine trends (simplified)
    const mostProblematicEndpoint =
      Object.entries(metrics.errorsByEndpoint).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0] || "none";

    const mostCommonError =
      Object.entries(metrics.errorsByType).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0] || "none";

    return {
      summary: metrics,
      recommendations,
      trends: {
        errorTrend: "stable", // Simplified - would need historical data for real trend analysis
        mostProblematicEndpoint,
        mostCommonError,
      },
    };
  }
}

// Export singleton instance
export const errorMonitor = new ErrorMonitor();

/**
 * Middleware to automatically check for alert conditions
 */
export async function checkErrorAlerts(): Promise<void> {
  try {
    const alertCheck = errorMonitor.checkAlertThresholds();

    if (alertCheck.shouldAlert) {
      await errorMonitor.sendAlert(alertCheck.alertType, alertCheck.metrics);
    }
  } catch (error) {
    console.error("Error checking alert thresholds:", error);
  }
}

/**
 * Schedule periodic error monitoring (call this from your app startup)
 */
export function startErrorMonitoring(intervalMinutes = 5): NodeJS.Timeout {
  const interval = setInterval(checkErrorAlerts, intervalMinutes * 60 * 1000);

  bookingLogger.info("Error monitoring started", undefined, {
    intervalMinutes,
  });

  return interval;
}
