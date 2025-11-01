import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { businesses, appointments, users, services } from "@/server/db/schema";
import { eq, count, sql, and, gte, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current date for filtering
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total counts
    const [totalBusinesses] = await db
      .select({ count: count() })
      .from(businesses);

    const [totalUsers] = await db.select({ count: count() }).from(users);

    const [totalAppointments] = await db
      .select({ count: count() })
      .from(appointments);

    const [totalServices] = await db.select({ count: count() }).from(services);

    // Get appointments by status
    const appointmentsByStatus = await db
      .select({
        status: appointments.status,
        count: count(),
      })
      .from(appointments)
      .groupBy(appointments.status);

    // Get recent appointments (last 30 days)
    const recentAppointments = await db
      .select({ count: count() })
      .from(appointments)
      .where(gte(appointments.createdAt, thirtyDaysAgo));

    // Get weekly growth
    const weeklyAppointments = await db
      .select({ count: count() })
      .from(appointments)
      .where(gte(appointments.createdAt, sevenDaysAgo));

    // Calculate total revenue (sum of all appointment prices)
    const [revenueResult] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${appointments.servicePrice}), 0)`,
      })
      .from(appointments)
      .where(eq(appointments.status, "completed"));

    // Get monthly revenue trend (last 6 months)
    const monthlyRevenue = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${appointments.createdAt})`,
        revenue: sql<number>`SUM(${appointments.servicePrice})`,
        bookings: count(),
      })
      .from(appointments)
      .where(
        and(
          gte(
            appointments.createdAt,
            new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
          ),
          eq(appointments.status, "completed"),
        ),
      )
      .groupBy(sql`strftime('%Y-%m', ${appointments.createdAt})`)
      .orderBy(sql`strftime('%Y-%m', ${appointments.createdAt})`);

    // Get top performing businesses
    const topBusinesses = await db
      .select({
        businessId: appointments.businessId,
        businessName: businesses.name,
        totalBookings: count(),
        totalRevenue: sql<number>`SUM(${appointments.servicePrice})`,
      })
      .from(appointments)
      .innerJoin(businesses, eq(appointments.businessId, businesses.id))
      .where(eq(appointments.status, "completed"))
      .groupBy(appointments.businessId, businesses.name)
      .orderBy(desc(count()))
      .limit(10);

    return NextResponse.json({
      overview: {
        totalBusinesses: totalBusinesses?.count || 0,
        totalUsers: totalUsers?.count || 0,
        totalAppointments: totalAppointments?.count || 0,
        totalServices: totalServices?.count || 0,
        totalRevenue: revenueResult?.totalRevenue || 0,
        recentAppointments: recentAppointments[0]?.count || 0,
        weeklyAppointments: weeklyAppointments[0]?.count || 0,
      },
      appointmentsByStatus: appointmentsByStatus.map((item) => ({
        status: item.status,
        count: item.count,
      })),
      monthlyRevenue: monthlyRevenue.map((item) => ({
        month: item.month,
        revenue: item.revenue || 0,
        bookings: item.bookings,
      })),
      topBusinesses: topBusinesses.map((item) => ({
        businessId: item.businessId,
        businessName: item.businessName,
        totalBookings: item.totalBookings,
        totalRevenue: item.totalRevenue || 0,
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 },
    );
  }
}
