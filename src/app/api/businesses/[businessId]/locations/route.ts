import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { businessLocations, businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// GET /api/businesses/[businessId]/locations - Get all locations for a business
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await params;

    // Verify user owns this business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all locations for this business
    const locations = await db
      .select()
      .from(businessLocations)
      .where(eq(businessLocations.businessId, businessId));

    return NextResponse.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}

// POST /api/businesses/[businessId]/locations - Create a new location
export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = params;

    // Verify user owns this business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      timezone,
      serviceRadius,
    } = body;

    // Validate required fields
    if (
      !address ||
      !city ||
      !state ||
      !zipCode ||
      !country ||
      latitude === undefined ||
      longitude === undefined ||
      !timezone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create new location
    const [newLocation] = await db
      .insert(businessLocations)
      .values({
        businessId,
        address,
        city,
        state,
        zipCode,
        country,
        latitude,
        longitude,
        timezone,
        serviceRadius: serviceRadius || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newLocation,
    });
  } catch (error) {
    console.error("Failed to create location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 },
    );
  }
}
