import { and, asc, desc, eq, gte, lt, sql, count, sum } from "drizzle-orm";
import { db } from "@/server/db";
import { appointments, services } from "@/server/db/schema";
import type {
  BookingAnalytics,
  ServicePerformance,
  BookingTrend,
  DateRangeFilter,
  CustomerMetrics,
} from "@/types/analytics";

/**
 * Repository for booking analytics and reporting
 * Handles complex aggregation queries for business insights
 */
export class AnalyticsRepository {
  /**
   * Get comprehensive booking analytics for a business
   * @param businessId Business ID
   * @param dateRange Optional date range filter
   * @returns Complete analytics data
   */
  async getBookingAnalytics(
    businessId: string,
    dateRange?: DateRangeFilter,
  ): Promise<BookingAnalytics> {
    const whereConditions = [eq(appointments.businessId, businessId)];

    // Apply date range filter if provided
    if (dateRange?.from) {
      whereConditions.push(gte(appointments.appointmentDate, dateRange.from));
    }
    if (dateRange?.to) {
      whereConditions.push(lt(appointments.appointmentDate, dateRange.to));
    }

    // Get basic booking counts by status
    const statusCounts = await db
      .select({
        status: appointments.status,
        count: count(),
        revenue: sum(appointments.servicePrice),
      })
      .from(appointments)
      .where(and(...whereConditions))
      .groupBy(appointments.status);

    // Initialize metrics
    let totalBookings = 0;
    let confirmedBookings = 0;
    let cancelledBookings = 0;
    let pendingBookings = 0;
    let completedBookings = 0;
    let totalRevenue = 0;
    let confirmedRevenue = 0;

    // Process status counts
    statusCounts.forEach((row) => {
      const bookingCount = Number(row.count);
      const revenue = Number(row.revenue ?? 0);

      totalBookings += bookingCount;
      totalRevenue += revenue;

      switch (row.status) {
        case "confirmed":
          confirmedBookings = bookingCount;
          confirmedRevenue = revenue;
          break;
        case "cancelled":
          cancelledBookings = bookingCount;
          break;
        case "pending":
          pendingBookings = bookingCount;
          break;
        case "completed":
          completedBookings = bookingCount;
          confirmedRevenue += revenue; // Include completed in confirmed revenue
          break;
      }
    });

    // Calculate average booking value
    const averageBookingValue =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Get time-based metrics
    const todayBookings = await this.getBookingCountForPeriod(
      businessId,
      "today",
    );
    const weekBookings = await this.getBookingCountForPeriod(
      businessId,
      "week",
    );
    const monthBookings = await this.getBookingCountForPeriod(
      businessId,
      "month",
    );

    // Calculate growth metrics
    const monthlyGrowth = await this.calculateGrowthRate(businessId, "month");
    const weeklyGrowth = await this.calculateGrowthRate(businessId, "week");

    // Get service performance
    const topServices = await this.getServicePerformance(businessId, dateRange);

    // Get customer metrics
    const customerMetrics = await this.getCustomerMetrics(
      businessId,
      dateRange,
    );

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
      confirmedRevenue,
      averageBookingValue,
      todayBookings,
      weekBookings,
      monthBookings,
      monthlyGrowth,
      weeklyGrowth,
      topServices,
      totalCustomers: customerMetrics.totalCustomers,
      repeatCustomers: customerMetrics.repeatCustomers,
      repeatCustomerRate: customerMetrics.repeatCustomerRate,
    };
  }

  /**
   * Get booking trends over time
   * @param businessId Business ID
   * @param days Number of days to include in trend
   * @returns Daily booking trends
   */
  async getBookingTrends(
    businessId: string,
    days = 30,
  ): Promise<BookingTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split("T")[0]!;
    const endDateStr = endDate.toISOString().split("T")[0]!;

    const trends = await db
      .select({
        date: appointments.appointmentDate,
        bookings: count(),
        revenue: sum(appointments.servicePrice),
        confirmedBookings: sql<number>`SUM(CASE WHEN ${appointments.status} IN ('confirmed', 'completed') THEN 1 ELSE 0 END)`,
        cancelledBookings: sql<number>`SUM(CASE WHEN ${appointments.status} = 'cancelled' THEN 1 ELSE 0 END)`,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          gte(appointments.appointmentDate, startDateStr),
          lt(appointments.appointmentDate, endDateStr),
        ),
      )
      .groupBy(appointments.appointmentDate)
      .orderBy(asc(appointments.appointmentDate));

    return trends.map((trend) => ({
      date: trend.date,
      bookings: Number(trend.bookings),
      revenue: Number(trend.revenue ?? 0),
      confirmedBookings: Number(trend.confirmedBookings),
      cancelledBookings: Number(trend.cancelledBookings),
    }));
  }

  /**
   * Get service performance metrics
   * @param businessId Business ID
   * @param dateRange Optional date range filter
   * @returns Service performance data
   */
  async getServicePerformance(
    businessId: string,
    dateRange?: DateRangeFilter,
  ): Promise<ServicePerformance[]> {
    const whereConditions = [eq(appointments.businessId, businessId)];

    if (dateRange?.from) {
      whereConditions.push(gte(appointments.appointmentDate, dateRange.from));
    }
    if (dateRange?.to) {
      whereConditions.push(lt(appointments.appointmentDate, dateRange.to));
    }

    const serviceStats = await db
      .select({
        serviceId: appointments.serviceId,
        serviceName: services.name,
        totalBookings: count(),
        totalRevenue: sum(appointments.servicePrice),
        confirmedBookings: sql<number>`SUM(CASE WHEN ${appointments.status} IN ('confirmed', 'completed') THEN 1 ELSE 0 END)`,
        cancelledBookings: sql<number>`SUM(CASE WHEN ${appointments.status} = 'cancelled' THEN 1 ELSE 0 END)`,
        averagePrice: sql<number>`AVG(${appointments.servicePrice})`,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(...whereConditions))
      .groupBy(appointments.serviceId, services.name)
      .orderBy(desc(count()));

    return serviceStats.map((stat) => {
      const totalBookings = Number(stat.totalBookings);
      const cancelledBookings = Number(stat.cancelledBookings);
      const cancellationRate =
        totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

      return {
        serviceId: stat.serviceId,
        serviceName: stat.serviceName,
        bookingCount: totalBookings,
        revenue: Number(stat.totalRevenue ?? 0),
        averagePrice: Number(stat.averagePrice ?? 0),
        cancellationRate,
      };
    });
  }

  /**
   * Get customer metrics
   * @param businessId Business ID
   * @param dateRange Optional date range filter
   * @returns Customer analytics
   */
  async getCustomerMetrics(
    businessId: string,
    dateRange?: DateRangeFilter,
  ): Promise<CustomerMetrics> {
    const whereConditions = [eq(appointments.businessId, businessId)];

    if (dateRange?.from) {
      whereConditions.push(gte(appointments.appointmentDate, dateRange.from));
    }
    if (dateRange?.to) {
      whereConditions.push(lt(appointments.appointmentDate, dateRange.to));
    }

    // Get customer booking counts
    const customerBookings = await db
      .select({
        customerEmail: appointments.customerEmail,
        bookingCount: count(),
      })
      .from(appointments)
      .where(and(...whereConditions))
      .groupBy(appointments.customerEmail);

    const totalCustomers = customerBookings.length;
    const repeatCustomers = customerBookings.filter(
      (customer) => Number(customer.bookingCount) > 1,
    ).length;

    const repeatCustomerRate =
      totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    return {
      totalCustomers,
      repeatCustomers,
      repeatCustomerRate,
    };
  }

  /**
   * Get booking count for a specific period
   * @param businessId Business ID
   * @param period Period type
   * @returns Booking count
   */
  private async getBookingCountForPeriod(
    businessId: string,
    period: "today" | "week" | "month",
  ): Promise<number> {
    const today = new Date();
    let startDate: Date;

    switch (period) {
      case "today":
        startDate = new Date(today);
        break;
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
    }

    const startDateStr = startDate.toISOString().split("T")[0]!;
    const endDateStr =
      period === "today" ? startDateStr : today.toISOString().split("T")[0]!;

    const whereConditions = [
      eq(appointments.businessId, businessId),
      gte(appointments.appointmentDate, startDateStr),
    ];

    if (period !== "today") {
      whereConditions.push(lt(appointments.appointmentDate, endDateStr));
    }

    const [result] = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(...whereConditions));

    return Number(result?.count ?? 0);
  }

  /**
   * Calculate growth rate compared to previous period
   * @param businessId Business ID
   * @param period Period type
   * @returns Growth rate percentage
   */
  private async calculateGrowthRate(
    businessId: string,
    period: "week" | "month",
  ): Promise<number> {
    const today = new Date();

    // Current period
    const currentStart = new Date(today);
    if (period === "week") {
      currentStart.setDate(today.getDate() - 7);
    } else {
      currentStart.setMonth(today.getMonth() - 1);
    }

    // Previous period
    const previousStart = new Date(currentStart);
    const previousEnd = new Date(currentStart);
    if (period === "week") {
      previousStart.setDate(currentStart.getDate() - 7);
    } else {
      previousStart.setMonth(currentStart.getMonth() - 1);
    }

    const currentStartStr = currentStart.toISOString().split("T")[0]!;
    const todayStr = today.toISOString().split("T")[0]!;
    const previousStartStr = previousStart.toISOString().split("T")[0]!;
    const previousEndStr = previousEnd.toISOString().split("T")[0]!;

    // Get current period bookings
    const [currentResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          gte(appointments.appointmentDate, currentStartStr),
          lt(appointments.appointmentDate, todayStr),
        ),
      );

    // Get previous period bookings
    const [previousResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          gte(appointments.appointmentDate, previousStartStr),
          lt(appointments.appointmentDate, previousEndStr),
        ),
      );

    const currentCount = Number(currentResult?.count ?? 0);
    const previousCount = Number(previousResult?.count ?? 0);

    if (previousCount === 0) {
      return currentCount > 0 ? 100 : 0;
    }

    return ((currentCount - previousCount) / previousCount) * 100;
  }
}

// Export a singleton instance
export const analyticsRepository = new AnalyticsRepository();
