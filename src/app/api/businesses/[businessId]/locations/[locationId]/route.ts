import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { businessLocations, businesses } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/businesses/[businessId]/locations/[locationId] - Get a specific location
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; locationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, locationId } = await params;

    // Verify user owns this business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the location
    const [location] = await db
      .select()
      .from(businessLocations)
      .where(
        and(
          eq(businessLocations.id, locationId),
          eq(businessLocations.businessId, businessId),
        ),
      )
      .limit(1);

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Failed to fetch location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 },
    );
  }
}

// PUT /api/businesses/[businessId]/locations/[locationId] - Update a location
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; locationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, locationId } = await params;

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

    // Update location
    const [updatedLocation] = await db
      .update(businessLocations)
      .set({
        address,
        city,
        state,
        zipCode,
        country,
        latitude,
        longitude,
        timezone,
        serviceRadius: serviceRadius || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(businessLocations.id, locationId),
          eq(businessLocations.businessId, businessId),
        ),
      )
      .returning();

    if (!updatedLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Failed to update location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 },
    );
  }
}

// DELETE /api/businesses/[businessId]/locations/[locationId] - Delete a location
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; locationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, locationId } = await params;

    // Verify user owns this business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if this is the only location
    const locations = await db
      .select()
      .from(businessLocations)
      .where(eq(businessLocations.businessId, businessId));

    if (locations.length === 1) {
      return NextResponse.json(
        {
          error: "Cannot delete the only location. Add another location first.",
        },
        { status: 400 },
      );
    }

    // Delete location
    await db
      .delete(businessLocations)
      .where(
        and(
          eq(businessLocations.id, locationId),
          eq(businessLocations.businessId, businessId),
        ),
      );

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete location:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 },
    );
  }
}
