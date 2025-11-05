/**
 * API endpoint for geocoding addresses
 */

import { NextRequest, NextResponse } from "next/server";
import { geocodingService } from "@/lib/api/geocoding-service";
import { validateAddress } from "@/lib/location-validation";
import { z } from "zod";

// Request schema
const geocodeRequestSchema = z.object({
  address: z.string().min(1, "Address is required"),
});

const reverseGeocodeRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * POST /api/location/geocode
 * Geocodes an address to coordinates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = geocodeRequestSchema.parse(body);

    const coordinates = await geocodingService.geocodeAddress(address);

    return NextResponse.json({
      success: true,
      data: {
        coordinates,
        address,
      },
    });
  } catch (error) {
    console.error("Geocoding error:", error);

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
        error: error instanceof Error ? error.message : "Geocoding failed",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/location/geocode
 * Reverse geocodes coordinates to an address
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude } = reverseGeocodeRequestSchema.parse(body);

    const address = await geocodingService.reverseGeocode({
      latitude,
      longitude,
    });

    return NextResponse.json({
      success: true,
      data: {
        address,
        coordinates: { latitude, longitude },
      },
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);

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
          error instanceof Error ? error.message : "Reverse geocoding failed",
      },
      { status: 500 },
    );
  }
}
