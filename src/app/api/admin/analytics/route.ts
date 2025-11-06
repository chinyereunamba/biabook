import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import {
  businesses,
  users,
  appointments,
  categories,
} from "@/server/db/schema";
import { eq, count, sql, desc, gte, and, isNotNull } from "drizzle-orm";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalBookings: number;
    bookingsGrowth: number;
    activeBusinesses: number;
    businessGrowth: number;
    avgBookingValue: number;
    valueGrowth: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  bookingsByCategory: Array<{
    name: string;
    value: number;
    bookings: number;
  }>;
  businessGrowth: Array<{
    month: string;
    businesses: number;
    active: number;
  }>;
  topPerformingBusinesses: Array<{
    name: string;
    revenue: number;
    bookings: number;
    growth: number;
  }>;
}

const getDateRange = (timeRange: string) => {
  const now = new Date();
  const ranges = {
    "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    "1y": new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
  };
  return ranges[timeRange as keyof typeof ranges] || ranges["30d"];
};

const getPreviousDateRange = (timeRange: string) => {
  const now = new Date();
  const ranges = {
    "7d": {
      start: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      end: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    "30d": {
      start: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      end: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
    "90d": {
      start: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      end: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    },
    "1y": {
      start: new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000),
      end: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    },
  };
  return ranges[timeRange as keyof typeof ranges] || ranges["30d"];
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    const startDate = getDateRange(timeRange);
    const previousRange = getPreviousDateRange(timeRange);

    // Get overview metrics
    const [currentPeriodStats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${appointments.servicePrice}), 0)`,
        totalBookings: sql<number>`COUNT(${appointments.id})`,
        avgBookingValue: sql<number>`COALESCE(AVG(${appointments.servicePrice}), 0)`,
      })
      .from(appointments)
      .where(gte(appointments.createdAt, startDate));

    const [previousPeriodStats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${appointments.servicePrice}), 0)`,
        totalBookings: sql<number>`COUNT(${appointments.id})`,
        avgBookingValue: sql<number>`COALESCE(AVG(${appointments.servicePrice}), 0)`,
      })
      .from(appointments)
      .where(
        and(
          gte(appointments.createdAt, previousRange.start),
          gte(previousRange.end, appointments.createdAt),
        ),
      );

    // Get business counts
    const [currentBusinessCount] = await db
      .select({
        total: count(),
      })
      .from(businesses)
      .where(gte(businesses.createdAt, startDate));

    const [previousBusinessCount] = await db
      .select({
        total: count(),
      })
      .from(businesses)
      .where(
        and(
          gte(businesses.createdAt, previousRange.start),
          gte(previousRange.end, businesses.createdAt),
        ),
      );

    // Get active businesses (businesses with at least one appointment)
    const activeBusinessesQuery = await db
      .select({
        businessId: appointments.businessId,
      })
      .from(appointments)
      .where(gte(appointments.createdAt, startDate))
      .groupBy(appointments.businessId);

    const activeBusinesses = activeBusinessesQuery.length;

    // Calculate growth percentages
    const revenueGrowth =
      previousPeriodStats.totalRevenue > 0
        ? ((currentPeriodStats.totalRevenue -
            previousPeriodStats.totalRevenue) /
            previousPeriodStats.totalRevenue) *
          100
        : 0;

    const bookingsGrowth =
      previousPeriodStats.totalBookings > 0
        ? ((currentPeriodStats.totalBookings -
            previousPeriodStats.totalBookings) /
            previousPeriodStats.totalBookings) *
          100
        : 0;

    const businessGrowth =
      previousBusinessCount.total > 0
        ? ((currentBusinessCount.total - previousBusinessCount.total) /
            previousBusinessCount.total) *
          100
        : 0;

    const valueGrowth =
      previousPeriodStats.avgBookingValue > 0
        ? ((currentPeriodStats.avgBookingValue -
            previousPeriodStats.avgBookingValue) /
            previousPeriodStats.avgBookingValue) *
          100
        : 0;

    // Get revenue by month (last 6 months)
    const monthlyData = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${appointments.createdAt})`,
        revenue: sql<number>`COALESCE(SUM(${appointments.servicePrice}), 0)`,
        bookings: sql<number>`COUNT(${appointments.id})`,
      })
      .from(appointments)
      .where(
        gte(
          appointments.createdAt,
          new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
        ),
      )
      .groupBy(sql`strftime('%Y-%m', ${appointments.createdAt})`)
      .orderBy(sql`strftime('%Y-%m', ${appointments.createdAt})`);

    // Format monthly data
    const revenueByMonth = monthlyData.map((item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      revenue: item.revenue,
      bookings: item.bookings,
    }));

    // Get bookings by category
    const categoryData = await db
      .select({
        categoryName: categories.name,
        bookings: sql<number>`COUNT(${appointments.id})`,
      })
      .from(appointments)
      .leftJoin(businesses, eq(appointments.businessId, businesses.id))
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .where(gte(appointments.createdAt, startDate))
      .groupBy(categories.name)
      .orderBy(desc(sql`COUNT(${appointments.id})`));

    const totalCategoryBookings = categoryData.reduce(
      (sum, item) => sum + item.bookings,
      0,
    );
    const bookingsByCategory = categoryData.map((item) => ({
      name: item.categoryName || "Uncategorized",
      value:
        totalCategoryBookings > 0
          ? Math.round((item.bookings / totalCategoryBookings) * 100)
          : 0,
      bookings: item.bookings,
    }));

    // Get business growth over time (last 6 months)
    const businessGrowthData = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${businesses.createdAt})`,
        businesses: sql<number>`COUNT(${businesses.id})`,
      })
      .from(businesses)
      .where(
        gte(
          businesses.createdAt,
          new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
        ),
      )
      .groupBy(sql`strftime('%Y-%m', ${businesses.createdAt})`)
      .orderBy(sql`strftime('%Y-%m', ${businesses.createdAt})`);

    // Calculate cumulative business counts
    let cumulativeBusinesses = 0;
    const businessGrowth = businessGrowthData.map((item) => {
      cumulativeBusinesses += item.businesses;
      return {
        month: new Date(item.month + "-01").toLocaleDateString("en-US", {
          month: "short",
        }),
        businesses: cumulativeBusinesses,
        active: Math.round(cumulativeBusinesses * 0.85), // Estimate 85% active
      };
    });

    // Get top performing businesses
    const topBusinesses = await db
      .select({
        businessName: businesses.name,
        revenue: sql<number>`COALESCE(SUM(${appointments.servicePrice}), 0)`,
        bookings: sql<number>`COUNT(${appointments.id})`,
      })
      .from(appointments)
      .leftJoin(businesses, eq(appointments.businessId, businesses.id))
      .where(gte(appointments.createdAt, startDate))
      .groupBy(businesses.id, businesses.name)
      .orderBy(desc(sql`SUM(${appointments.servicePrice})`))
      .limit(5);

    const topPerformingBusinesses = topBusinesses.map((business) => ({
      name: business.businessName || "Unknown Business",
      revenue: business.revenue,
      bookings: business.bookings,
      growth: Math.random() * 20 + 5, // Mock growth data for now
    }));

    const analyticsData: AnalyticsData = {
      overview: {
        totalRevenue: currentPeriodStats.totalRevenue,
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
        totalBookings: currentPeriodStats.totalBookings,
        bookingsGrowth: Number(bookingsGrowth.toFixed(1)),
        activeBusinesses,
        businessGrowth: Number(businessGrowth.toFixed(1)),
        avgBookingValue: currentPeriodStats.avgBookingValue,
        valueGrowth: Number(valueGrowth.toFixed(1)),
      },
      revenueByMonth,
      bookingsByCategory,
      businessGrowth,
      topPerformingBusinesses,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
