/**
 * API endpoint for business location management
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { businessLocationRepository } from "@/server/repositories/business-location-repository";
import { geocodingService } from "@/lib/api/geocoding-service";
import { validateCoordinates } from "@/lib/location-validation";
import { LocationError } from "@/types/location";
import { z } from "zod";

// Request schemas
const updateLocationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().default("US"),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
  serviceRadius: z.number().min(1).max(500).optional(),
});

const updateServiceRadiusSchema = z.object({
  serviceRadius: z.number().min(1).max(500).optional(),
});

/**
 * GET /api/businesses/[businessId]/location
 * Gets business location information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { businessId } = await params;
    const location =
      await businessLocationRepository.getByBusinessId(businessId);

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Get business location error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get location",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/businesses/[businessId]/location
 * Creates or updates business location
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { businessId } = await params;
    const body = await request.json();
    const locationData = updateLocationSchema.parse(body);

    let coordinates = locationData.coordinates;

    // If coordinates not provided, geocode the address
    if (!coordinates) {
      const fullAddress = `${locationData.address}, ${locationData.city}, ${locationData.state} ${locationData.zipCode}, ${locationData.country}`;
      coordinates = await geocodingService.geocodeAddress(fullAddress);
    } else {
      // Validate provided coordinates
      coordinates = validateCoordinates(coordinates);
    }

    // Get timezone for the coordinates
    const timezone = await geocodingService.getTimezone(coordinates);

    // Save location to database
    const location = await businessLocationRepository.upsert({
      businessId,
      address: locationData.address,
      city: locationData.city,
      state: locationData.state,
      zipCode: locationData.zipCode,
      country: locationData.country,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      timezone,
      serviceRadius: locationData.serviceRadius,
    });

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Update business location error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof LocationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          fallbackAction: error.fallbackAction,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update location",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/businesses/[businessId]/location
 * Updates service radius only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { businessId } = await params;
    const body = await request.json();
    const { serviceRadius } = updateServiceRadiusSchema.parse(body);

    await businessLocationRepository.updateServiceRadius(
      businessId,
      serviceRadius,
    );

    const updatedLocation =
      await businessLocationRepository.getByBusinessId(businessId);

    return NextResponse.json({
      success: true,
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Update service radius error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update service radius",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/businesses/[businessId]/location
 * Deletes business location
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { businessId } = await params;
    await businessLocationRepository.delete(businessId);

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Delete business location error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete location",
      },
      { status: 500 },
    );
  }
}
