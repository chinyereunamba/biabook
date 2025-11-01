import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, businesses, appointments } from "@/server/db/schema";
import { eq, count, sql, desc, asc, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin (temporarily disabled for testing)
    // if (!session?.user || session.user.role !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(like(users.name, `%${search}%`), like(users.email, `%${search}%`)),
      );
    }

    // Get users with their business and appointment counts
    const usersQuery = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        isOnboarded: users.isOnboarded,
        onboardedAt: users.onboardedAt,
        createdAt: users.createdAt,
        businessCount: sql<number>`COALESCE(COUNT(DISTINCT ${businesses.id}), 0)`,
        appointmentCount: sql<number>`COALESCE(COUNT(DISTINCT ${appointments.id}), 0)`,
      })
      .from(users)
      .leftJoin(businesses, eq(users.id, businesses.ownerId))
      .leftJoin(appointments, eq(businesses.id, appointments.businessId))
      .groupBy(
        users.id,
        users.name,
        users.email,
        users.isOnboarded,
        users.onboardedAt,
        users.createdAt,
      );

    // Apply where conditions
    if (whereConditions.length > 0) {
      whereConditions.forEach((condition) => {
        usersQuery.where(condition);
      });
    }

    // Apply status filter
    if (status === "onboarded") {
      usersQuery.where(eq(users.isOnboarded, true));
    } else if (status === "pending") {
      usersQuery.where(eq(users.isOnboarded, false));
    }

    // Apply sorting
    usersQuery.orderBy(desc(users.createdAt));

    // Get total count for pagination
    const [totalCount] = await db.select({ count: count() }).from(users);

    // Apply pagination
    const usersData = await usersQuery.limit(limit).offset(offset);

    // Get summary stats
    const [onboardedCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isOnboarded, true));

    const [businessOwnersCount] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${users.id})` })
      .from(users)
      .innerJoin(businesses, eq(users.id, businesses.ownerId));

    return NextResponse.json({
      users: usersData,
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        pages: Math.ceil((totalCount?.count || 0) / limit),
      },
      summary: {
        total: totalCount?.count || 0,
        onboarded: onboardedCount?.count || 0,
        pending: (totalCount?.count || 0) - (onboardedCount?.count || 0),
        businessOwners: businessOwnersCount?.count || 0,
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
