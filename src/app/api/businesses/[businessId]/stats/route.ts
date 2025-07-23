import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments } from "@/server/db/schema";
import { eq, and, gte, lt, sql, count } from "drizzle-orm";
import { auth } from "@/server/auth";
import { analyticsRepository } from "@/server/repositories/analytics-repository";

// GET /api/businesses/:businessId/stats
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you would check if the user has access to this business
    // For now, we'll assume they do

    const { businessId } = await params;
    const { searchParams } = new URL(req.url);

    // Parse optional date range parameters
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const includeTrends = searchParams.get("trends") === "true";
    const trendDays = parseInt(searchParams.get("trendDays") ?? "30");

    // Get comprehensive analytics
    const analytics = await analyticsRepository.getBookingAnalytics(
      businessId,
      {
        from,
        to,
      },
    );

    // Get booking trends if requested
    let trends = undefined;
    if (includeTrends) {
      trends = await analyticsRepository.getBookingTrends(
        businessId,
        trendDays,
      );
    }

    // Format response to maintain backward compatibility with existing endpoint
    const response = {
      // Legacy format for backward compatibility
      revenue: {
        total: analytics.totalRevenue,
        currentMonth: analytics.totalRevenue, // Will be filtered by date range if provided
        lastMonth: 0, // Not calculated in new system
        percentChange: analytics.monthlyGrowth,
      },
      bookings: {
        total: analytics.totalBookings,
        currentMonth: analytics.monthBookings,
        lastMonth: 0, // Not calculated in new system
        percentChange: analytics.monthlyGrowth,
        today: analytics.todayBookings,
      },

      // Enhanced analytics data
      analytics: {
        overview: {
          totalBookings: analytics.totalBookings,
          confirmedBookings: analytics.confirmedBookings,
          cancelledBookings: analytics.cancelledBookings,
          pendingBookings: analytics.pendingBookings,
          completedBookings: analytics.completedBookings,
        },
        revenue: {
          total: analytics.totalRevenue,
          confirmed: analytics.confirmedRevenue,
          average: analytics.averageBookingValue,
        },
        timeMetrics: {
          today: analytics.todayBookings,
          week: analytics.weekBookings,
          month: analytics.monthBookings,
        },
        growth: {
          monthly: analytics.monthlyGrowth,
          weekly: analytics.weeklyGrowth,
        },
        services: analytics.topServices,
        customers: {
          total: analytics.totalCustomers,
          repeat: analytics.repeatCustomers,
          repeatRate: analytics.repeatCustomerRate,
        },
      },

      // Include trends if requested
      ...(trends && { trends }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching business stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch business stats" },
      { status: 500 },
    );
  }
}
