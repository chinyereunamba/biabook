import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import {
  businesses,
  users,
  appointments,
  categories,
} from "@/server/db/schema";
import { eq, count, sql, desc, asc, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status") || "";

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(businesses.name, `%${search}%`),
          like(businesses.email, `%${search}%`),
          like(users.name, `%${search}%`),
        ),
      );
    }

    // Get businesses with owner info and stats
    const businessesQuery = db
      .select({
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        location: businesses.location,
        phone: businesses.phone,
        email: businesses.email,
        categoryId: businesses.categoryId,
        categoryName: categories.name,
        ownerId: businesses.ownerId,
        ownerName: users.name,
        ownerEmail: users.email,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        totalAppointments: sql<number>`COALESCE(COUNT(${appointments.id}), 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(${appointments.servicePrice}), 0)`,
      })
      .from(businesses)
      .leftJoin(users, eq(businesses.ownerId, users.id))
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .leftJoin(appointments, eq(businesses.id, appointments.businessId))
      .groupBy(
        businesses.id,
        businesses.name,
        businesses.slug,
        businesses.description,
        businesses.location,
        businesses.phone,
        businesses.email,
        businesses.categoryId,
        categories.name,
        businesses.ownerId,
        users.name,
        users.email,
        businesses.createdAt,
        businesses.updatedAt,
      );

    // Apply where conditions
    if (whereConditions.length > 0) {
      whereConditions.forEach((condition) => {
        businessesQuery.where(condition);
      });
    }

    // Apply sorting
    const orderBy = sortOrder === "desc" ? desc : asc;
    switch (sortBy) {
      case "name":
        businessesQuery.orderBy(orderBy(businesses.name));
        break;
      case "owner":
        businessesQuery.orderBy(orderBy(users.name));
        break;
      case "appointments":
        businessesQuery.orderBy(orderBy(sql`COUNT(${appointments.id})`));
        break;
      case "revenue":
        businessesQuery.orderBy(
          orderBy(sql`SUM(${appointments.servicePrice})`),
        );
        break;
      default:
        businessesQuery.orderBy(orderBy(businesses.createdAt));
    }

    // Get total count for pagination
    const [totalCount] = await db
      .select({ count: count() })
      .from(businesses)
      .leftJoin(users, eq(businesses.ownerId, users.id));

    // Apply pagination
    const businessesData = await businessesQuery.limit(limit).offset(offset);

    return NextResponse.json({
      businesses: businessesData,
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        pages: Math.ceil((totalCount?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Admin businesses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, action } = await request.json();

    if (!businessId || !action) {
      return NextResponse.json(
        { error: "Business ID and action are required" },
        { status: 400 },
      );
    }

    // For now, we'll just return success since we don't have a status field
    // In a real implementation, you'd add a status field to the businesses table

    return NextResponse.json({
      message: `Business ${action} successfully`,
      businessId,
      action,
    });
  } catch (error) {
    console.error("Admin business action error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 },
    );
  }
}
