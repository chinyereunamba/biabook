import { NextResponse } from "next/server";
import { bookingPerformanceMonitor } from "@/server/monitoring/booking-performance-monitor";
import { db } from "@/server/db";

/**
 * GET /api/health
 * System health check endpoint
 * Returns basic system health information
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Test database connectivity
    const dbHealthy = await testDatabaseHealth();

    // Get basic system metrics
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const systemHealth = bookingPerformanceMonitor.getSystemHealthMetrics({
      start: oneHourAgo,
      end: now,
    });

    // Get performance alerts
    const alerts = bookingPerformanceMonitor.getPerformanceAlerts();
    const criticalAlerts = alerts.filter((alert) => alert.severity === "high");

    // Determine overall health status
    const isHealthy =
      dbHealthy &&
      systemHealth.errorRate < 25 &&
      systemHealth.avgResponseTime < 10000 &&
      criticalAlerts.length === 0;

    const responseTime = Date.now() - startTime;

    const healthData = {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      responseTime,
      checks: {
        database: dbHealthy ? "healthy" : "unhealthy",
        performance: {
          avgResponseTime: systemHealth.avgResponseTime,
          errorRate: systemHealth.errorRate,
          cacheHitRate: systemHealth.cacheHitRate,
          memoryUsage: systemHealth.memoryUsage,
        },
        alerts: {
          total: alerts.length,
          critical: criticalAlerts.length,
        },
      },
      version: process.env.npm_package_version || "unknown",
      uptime: process.uptime(),
    };

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
        checks: {
          database: "unknown",
          performance: "unknown",
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    );
  }
}

/**
 * Test database connectivity
 */
async function testDatabaseHealth(): Promise<boolean> {
  try {
    // Simple query to test database connectivity
    await db.run("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}
