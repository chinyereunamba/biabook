import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments } from "@/server/db/schema";
import { eq, and, gte, lt, sql, count } from "drizzle-orm";
import { auth } from "@/server/auth";

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

    // Get current date and first day of current month
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date | undefined) => {
      if (!date) return "";
      return date.toISOString().split("T")[0];
    };
    const todayStr = formatDate(today);
    const currentMonthStr = formatDate(currentMonth);
    const lastMonthStr = formatDate(lastMonth);
    const nextMonthStr = formatDate(nextMonth);

    // Get total revenue (sum of service prices for confirmed appointments)
    const [totalRevenueResult] = await db
      .select({
        total: sql<number>`SUM(service_price)`,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          eq(appointments.status, "confirmed"),
        ),
      );

    // Get current month revenue
    const [currentMonthRevenueResult] = await db
      .select({
        total: sql<number>`SUM(service_price)`,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          eq(appointments.status, "confirmed"),
          gte(appointments.appointmentDate, currentMonthStr),
          lt(appointments.appointmentDate, nextMonthStr),
        ),
      );

    // Get last month revenue
    const [lastMonthRevenueResult] = await db
      .select({
        total: sql<number>`SUM(service_price)`,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          eq(appointments.status, "confirmed"),
          gte(appointments.appointmentDate, lastMonthStr),
          lt(appointments.appointmentDate, currentMonthStr),
        ),
      );

    // Get total bookings count
    const [totalBookingsResult] = await db
      .select({
        count: count(),
      })
      .from(appointments)
      .where(eq(appointments.businessId, businessId));

    // Get current month bookings
    const [currentMonthBookingsResult] = await db
      .select({
        count: count(),
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          gte(appointments.appointmentDate, currentMonthStr),
          lt(appointments.appointmentDate, nextMonthStr),
        ),
      );

    // Get last month bookings
    const [lastMonthBookingsResult] = await db
      .select({
        count: count(),
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          gte(appointments.appointmentDate, lastMonthStr),
          lt(appointments.appointmentDate, currentMonthStr),
        ),
      );

    // Get today's bookings
    const [todayBookingsResult] = await db
      .select({
        count: count(),
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          eq(appointments.appointmentDate, todayStr),
        ),
      );

    // Calculate percentage changes
    const totalRevenue = totalRevenueResult?.total ?? 0;
    const currentMonthRevenue = currentMonthRevenueResult?.total ?? 0;
    const lastMonthRevenue = lastMonthRevenueResult?.total ?? 0;
    const revenueChange =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    const totalBookings = totalBookingsResult?.count ?? 0;
    const currentMonthBookings = currentMonthBookingsResult?.count ?? 0;
    const lastMonthBookings = lastMonthBookingsResult?.count ?? 0;
    const bookingsChange =
      lastMonthBookings > 0
        ? ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
        : 0;

    const todayBookings = todayBookingsResult?.count ?? 0;

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        currentMonth: currentMonthRevenue,
        lastMonth: lastMonthRevenue,
        percentChange: revenueChange,
      },
      bookings: {
        total: totalBookings,
        currentMonth: currentMonthBookings,
        lastMonth: lastMonthBookings,
        percentChange: bookingsChange,
        today: todayBookings,
      },
    });
  } catch (error) {
    console.error("Error fetching business stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch business stats" },
      { status: 500 },
    );
  }
}
