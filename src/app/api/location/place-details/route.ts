/**
 * API endpoint for getting place details from Google Places API
 */

import { NextRequest, NextResponse } from "next/server";
import { geocodingService } from "@/lib/api/geocoding-service";
import { z } from "zod";

// Request schema
const placeDetailsRequestSchema = z.object({
  placeId: z.string().min(1, "Place ID is required"),
});

/**
 * GET /api/location/place-details?placeId=...
 * Gets place details from a place ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json(
        {
          success: false,
          error: "placeId parameter is required",
        },
        { status: 400 },
      );
    }

    const { placeId: validatedPlaceId } = placeDetailsRequestSchema.parse({
      placeId,
    });

    const placeDetails =
      await geocodingService.getPlaceDetails(validatedPlaceId);

    return NextResponse.json({
      success: true,
      data: placeDetails,
    });
  } catch (error) {
    console.error("Place details error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
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
            : "Failed to get place details",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/location/place-details
 * Gets place details from a place ID (alternative POST method)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeId } = placeDetailsRequestSchema.parse(body);

    const placeDetails = await geocodingService.getPlaceDetails(placeId);

    return NextResponse.json({
      success: true,
      data: placeDetails,
    });
  } catch (error) {
    console.error("Place details error:", error);

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
            : "Failed to get place details",
      },
      { status: 500 },
    );
  }
}
