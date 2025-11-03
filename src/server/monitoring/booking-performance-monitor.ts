/**
 * Booking system performance monitoring and analytics
 * Tracks booking operations, conversion rates, and system health
 */

export interface BookingMetrics {
  timestamp: number;
  businessId: string;
  operation:
    | "availability_check"
    | "booking_create"
    | "booking_update"
    | "booking_cancel";
  duration: number; // milliseconds
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ConversionMetrics {
  businessId: string;
  date: string; // YYYY-MM-DD
  availabilityViews: number;
  bookingAttempts: number;
  successfulBookings: number;
  abandonedBookings: number;
  conversionRate: number; // percentage
}

export interface SystemHealthMetrics {
  timestamp: number;
  avgResponseTime: number; // milliseconds
  errorRate: number; // percentage
  cacheHitRate: number; // percentage
  activeConnections: number;
  memoryUsage: number; // MB
}

export class BookingPerformanceMonitor {
  private metrics: BookingMetrics[] = [];
  private conversionData: Map<string, ConversionMetrics> = new Map();
  private readonly MAX_METRICS_HISTORY = 10000; // Keep last 10k metrics
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Cleanup old metrics periodically
    setInterval(() => {
      this.cleanupOldMetrics();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Record a booking operation metric
   */
  recordOperation(
    businessId: string,
    operation: BookingMetrics["operation"],
    duration: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>,
  ): void {
    const metric: BookingMetrics = {
      timestamp: Date.now(),
      businessId,
      operation,
      duration,
      success,
      error,
      metadata,
    };

    this.metrics.push(metric);

    // Log performance issues
    if (duration > 5000) {
      // > 5 seconds
      console.warn(`Slow booking operation detected:`, {
        businessId,
        operation,
        duration,
        success,
        error,
      });
    }

    if (!success) {
      console.error(`Booking operation failed:`, {
        businessId,
        operation,
        duration,
        error,
        metadata,
      });
    }

    // Keep metrics array size manageable
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY);
    }
  }

  /**
   * Record availability view (for conversion tracking)
   */
  recordAvailabilityView(businessId: string): void {
    const today = new Date().toISOString().split("T")[0]!;
    const key = `${businessId}:${today}`;

    const existing = this.conversionData.get(key) || {
      businessId,
      date: today,
      availabilityViews: 0,
      bookingAttempts: 0,
      successfulBookings: 0,
      abandonedBookings: 0,
      conversionRate: 0,
    };

    existing.availabilityViews++;
    this.conversionData.set(key, existing);
  }

  /**
   * Record booking attempt (for conversion tracking)
   */
  recordBookingAttempt(businessId: string, success: boolean): void {
    const today = new Date().toISOString().split("T")[0]!;
    const key = `${businessId}:${today}`;

    const existing = this.conversionData.get(key) || {
      businessId,
      date: today,
      availabilityViews: 0,
      bookingAttempts: 0,
      successfulBookings: 0,
      abandonedBookings: 0,
      conversionRate: 0,
    };

    existing.bookingAttempts++;
    if (success) {
      existing.successfulBookings++;
    } else {
      existing.abandonedBookings++;
    }

    // Calculate conversion rate
    existing.conversionRate =
      existing.availabilityViews > 0
        ? (existing.successfulBookings / existing.availabilityViews) * 100
        : 0;

    this.conversionData.set(key, existing);
  }

  /**
   * Get performance metrics for a business
   */
  getBusinessMetrics(
    businessId: string,
    timeRange: { start: number; end: number },
  ): {
    totalOperations: number;
    successRate: number;
    avgResponseTime: number;
    operationBreakdown: Record<string, number>;
    errorBreakdown: Record<string, number>;
  } {
    const businessMetrics = this.metrics.filter(
      (m) =>
        m.businessId === businessId &&
        m.timestamp >= timeRange.start &&
        m.timestamp <= timeRange.end,
    );

    if (businessMetrics.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        avgResponseTime: 0,
        operationBreakdown: {},
        errorBreakdown: {},
      };
    }

    const successfulOps = businessMetrics.filter((m) => m.success).length;
    const totalDuration = businessMetrics.reduce(
      (sum, m) => sum + m.duration,
      0,
    );

    // Operation breakdown
    const operationBreakdown: Record<string, number> = {};
    businessMetrics.forEach((m) => {
      operationBreakdown[m.operation] =
        (operationBreakdown[m.operation] || 0) + 1;
    });

    // Error breakdown
    const errorBreakdown: Record<string, number> = {};
    businessMetrics
      .filter((m) => !m.success && m.error)
      .forEach((m) => {
        const error = m.error!;
        errorBreakdown[error] = (errorBreakdown[error] || 0) + 1;
      });

    return {
      totalOperations: businessMetrics.length,
      successRate: (successfulOps / businessMetrics.length) * 100,
      avgResponseTime: totalDuration / businessMetrics.length,
      operationBreakdown,
      errorBreakdown,
    };
  }

  /**
   * Get conversion metrics for a business
   */
  getConversionMetrics(
    businessId: string,
    days: number = 7,
  ): ConversionMetrics[] {
    const result: ConversionMetrics[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0]!;
      const key = `${businessId}:${dateStr}`;

      const metrics = this.conversionData.get(key) || {
        businessId,
        date: dateStr,
        availabilityViews: 0,
        bookingAttempts: 0,
        successfulBookings: 0,
        abandonedBookings: 0,
        conversionRate: 0,
      };

      result.push(metrics);
    }

    return result.reverse(); // Return in chronological order
  }

  /**
   * Get system health metrics
   */
  getSystemHealthMetrics(timeRange: {
    start: number;
    end: number;
  }): SystemHealthMetrics {
    const recentMetrics = this.metrics.filter(
      (m) => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end,
    );

    if (recentMetrics.length === 0) {
      return {
        timestamp: Date.now(),
        avgResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        activeConnections: 0,
        memoryUsage: 0,
      };
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const errorCount = recentMetrics.filter((m) => !m.success).length;
    const cacheHits = recentMetrics.filter((m) => m.metadata?.cacheHit).length;

    return {
      timestamp: Date.now(),
      avgResponseTime: totalDuration / recentMetrics.length,
      errorRate: (errorCount / recentMetrics.length) * 100,
      cacheHitRate:
        recentMetrics.length > 0 ? (cacheHits / recentMetrics.length) * 100 : 0,
      activeConnections: this.getActiveConnections(),
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Get alerts for performance issues
   */
  getPerformanceAlerts(): Array<{
    type: "high_error_rate" | "slow_response" | "low_conversion" | "cache_miss";
    severity: "low" | "medium" | "high";
    message: string;
    businessId?: string;
    timestamp: number;
  }> {
    const alerts: Array<{
      type:
        | "high_error_rate"
        | "slow_response"
        | "low_conversion"
        | "cache_miss";
      severity: "low" | "medium" | "high";
      message: string;
      businessId?: string;
      timestamp: number;
    }> = [];

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Check system-wide metrics
    const systemHealth = this.getSystemHealthMetrics({
      start: oneHourAgo,
      end: now,
    });

    if (systemHealth.errorRate > 10) {
      alerts.push({
        type: "high_error_rate",
        severity: systemHealth.errorRate > 25 ? "high" : "medium",
        message: `High error rate detected: ${systemHealth.errorRate.toFixed(1)}%`,
        timestamp: now,
      });
    }

    if (systemHealth.avgResponseTime > 3000) {
      alerts.push({
        type: "slow_response",
        severity: systemHealth.avgResponseTime > 5000 ? "high" : "medium",
        message: `Slow response times detected: ${systemHealth.avgResponseTime.toFixed(0)}ms average`,
        timestamp: now,
      });
    }

    if (systemHealth.cacheHitRate < 50) {
      alerts.push({
        type: "cache_miss",
        severity: systemHealth.cacheHitRate < 25 ? "high" : "medium",
        message: `Low cache hit rate: ${systemHealth.cacheHitRate.toFixed(1)}%`,
        timestamp: now,
      });
    }

    // Check business-specific conversion rates
    const businesses = new Set(this.metrics.map((m) => m.businessId));
    businesses.forEach((businessId) => {
      const conversionMetrics = this.getConversionMetrics(businessId, 1)[0];
      if (
        conversionMetrics &&
        conversionMetrics.availabilityViews > 10 &&
        conversionMetrics.conversionRate < 5
      ) {
        alerts.push({
          type: "low_conversion",
          severity: conversionMetrics.conversionRate < 2 ? "high" : "medium",
          message: `Low conversion rate for business: ${conversionMetrics.conversionRate.toFixed(1)}%`,
          businessId,
          timestamp: now,
        });
      }
    });

    return alerts;
  }

  /**
   * Create a performance monitoring decorator
   */
  createMonitoringDecorator<T extends (...args: any[]) => Promise<any>>(
    operation: BookingMetrics["operation"],
    getBusinessId: (...args: Parameters<T>) => string,
  ) {
    return (
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor,
    ) => {
      const method = descriptor.value;

      descriptor.value = async function (...args: Parameters<T>) {
        const businessId = getBusinessId(...args);
        const startTime = Date.now();
        let success = false;
        let error: string | undefined;

        try {
          const result = await method.apply(this, args);
          success = true;
          return result;
        } catch (err) {
          error = err instanceof Error ? err.message : "Unknown error";
          throw err;
        } finally {
          const duration = Date.now() - startTime;
          bookingPerformanceMonitor.recordOperation(
            businessId,
            operation,
            duration,
            success,
            error,
          );
        }
      };

      return descriptor;
    };
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Remove metrics older than 24 hours
    this.metrics = this.metrics.filter((m) => m.timestamp > oneDayAgo);

    // Remove conversion data older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0]!;

    for (const [key, data] of this.conversionData.entries()) {
      if (data.date < cutoffDate) {
        this.conversionData.delete(key);
      }
    }

    console.log(
      `Cleaned up old metrics. Current metrics count: ${this.metrics.length}`,
    );
  }

  /**
   * Get active connections (placeholder - would integrate with actual connection pool)
   */
  private getActiveConnections(): number {
    // In a real implementation, this would check the database connection pool
    return 0;
  }

  /**
   * Get memory usage in MB
   */
  private getMemoryUsage(): number {
    const usage = process.memoryUsage();
    return Math.round(usage.heapUsed / 1024 / 1024);
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format: "json" | "prometheus" = "json"): string {
    if (format === "prometheus") {
      return this.exportPrometheusMetrics();
    }

    return JSON.stringify(
      {
        metrics: this.metrics.slice(-1000), // Last 1000 metrics
        conversionData: Array.from(this.conversionData.values()),
        systemHealth: this.getSystemHealthMetrics({
          start: Date.now() - 60 * 60 * 1000,
          end: Date.now(),
        }),
        alerts: this.getPerformanceAlerts(),
      },
      null,
      2,
    );
  }

  /**
   * Export metrics in Prometheus format
   */
  private exportPrometheusMetrics(): string {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const systemHealth = this.getSystemHealthMetrics({
      start: oneHourAgo,
      end: now,
    });

    return `
# HELP booking_operations_total Total number of booking operations
# TYPE booking_operations_total counter
booking_operations_total ${this.metrics.length}

# HELP booking_response_time_avg Average response time in milliseconds
# TYPE booking_response_time_avg gauge
booking_response_time_avg ${systemHealth.avgResponseTime}

# HELP booking_error_rate Error rate percentage
# TYPE booking_error_rate gauge
booking_error_rate ${systemHealth.errorRate}

# HELP booking_cache_hit_rate Cache hit rate percentage
# TYPE booking_cache_hit_rate gauge
booking_cache_hit_rate ${systemHealth.cacheHitRate}

# HELP booking_memory_usage Memory usage in MB
# TYPE booking_memory_usage gauge
booking_memory_usage ${systemHealth.memoryUsage}
`.trim();
  }
}

// Export singleton instance
export const bookingPerformanceMonitor = new BookingPerformanceMonitor();
