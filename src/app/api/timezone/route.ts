/**
 * API endpoints for timezone operations
 */

import { NextRequest, NextResponse } from "next/server";
import { timezoneService } from "@/lib/timezone-service";
import { timezoneRepository } from "@/server/repositories/timezone-repository";
import { validateCoordinates } from "@/lib/location-validation";
import { LocationError, LocationErrorCode } from "@/types/location";
import type { Coordinates } from "@/types/location";

/**
 * POST /api/timezone - Detect timezone from coordinates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coordinates } = body;

    if (!coordinates) {
      return NextResponse.json(
        { error: "Coordinates are required" },
        { status: 400 },
      );
    }

    const validatedCoordinates = validateCoordinates(coordinates);
    const timezone = await timezoneService.detectTimezone(validatedCoordinates);

    return NextResponse.json({
      timezone,
      coordinates: validatedCoordinates,
    });
  } catch (error) {
    console.error("Timezone detection error:", error);

    if (error instanceof LocationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          fallbackAction: error.fallbackAction,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to detect timezone" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/timezone?businessId=xxx - Get business timezone
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 },
      );
    }

    const timezone = await timezoneRepository.getBusinessTimezone(businessId);

    if (!timezone) {
      return NextResponse.json(
        { error: "Business timezone not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ timezone, businessId });
  } catch (error) {
    console.error("Get business timezone error:", error);

    if (error instanceof LocationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          fallbackAction: error.fallbackAction,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to get business timezone" },
      { status: 500 },
    );
  }
}
