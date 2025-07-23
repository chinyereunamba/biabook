import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { analyticsRepository } from "@/server/repositories/analytics-repository";

// GET /api/businesses/:businessId/analytics
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

    // Parse query parameters
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const includeTrends = searchParams.get("trends") === "true";
    const trendDays = parseInt(searchParams.get("trendDays") || "30");
    const includeServices = searchParams.get("services") !== "false";

    // Get comprehensive analytics
    const analytics = await analyticsRepository.getBookingAnalytics(
      businessId,
      {
        from,
        to,
      },
    );

    // Build response object
    const response: any = {
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
      customers: {
        total: analytics.totalCustomers,
        repeat: analytics.repeatCustomers,
        repeatRate: analytics.repeatCustomerRate,
      },
    };

    // Include service performance if requested
    if (includeServices) {
      response.services = analytics.topServices;
    }

    // Include booking trends if requested
    if (includeTrends) {
      response.trends = await analyticsRepository.getBookingTrends(
        businessId,
        trendDays,
      );
    }

    // Add date range info if filters were applied
    if (from || to) {
      response.dateRange = {
        from: from || null,
        to: to || null,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching business analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch business analytics" },
      { status: 500 },
    );
  }
}
