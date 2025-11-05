/**
 * API endpoint for validating customer location against business service area
 */

import { NextRequest, NextResponse } from "next/server";
import { serviceRadiusValidationService } from "@/server/services/service-radius-validation";
import { validateCoordinates } from "@/lib/distance-utils";

interface ValidateServiceAreaRequest {
  latitude: number;
  longitude: number;
  includeAlternatives?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId } = await params;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 },
      );
    }

    const body: ValidateServiceAreaRequest = await request.json();
    const { latitude, longitude, includeAlternatives = false } = body;

    // Validate input
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Valid latitude and longitude are required" },
        { status: 400 },
      );
    }

    const customerLocation = { latitude, longitude };

    if (!validateCoordinates(customerLocation)) {
      return NextResponse.json(
        { error: "Invalid coordinates provided" },
        { status: 400 },
      );
    }

    // Validate service area
    const validation =
      await serviceRadiusValidationService.validateBookingLocation(
        businessId,
        customerLocation,
        {
          includeAlternatives,
          maxAlternativeRadius: 50,
          maxAlternatives: 5,
        },
      );

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("Service area validation error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Business not found")) {
        return NextResponse.json(
          { error: "Business not found or location not configured" },
          { status: 404 },
        );
      }

      if (error.message.includes("Invalid")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId } = await params;
    const { searchParams } = new URL(request.url);

    const latitude = parseFloat(searchParams.get("latitude") || "");
    const longitude = parseFloat(searchParams.get("longitude") || "");

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Valid latitude and longitude query parameters are required" },
        { status: 400 },
      );
    }

    const customerLocation = { latitude, longitude };

    if (!validateCoordinates(customerLocation)) {
      return NextResponse.json(
        { error: "Invalid coordinates provided" },
        { status: 400 },
      );
    }

    // Simple validation without alternatives
    const validation =
      await serviceRadiusValidationService.validateBeforeBooking(
        businessId,
        customerLocation,
      );

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("Service area validation error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Business not found")) {
        return NextResponse.json(
          { error: "Business not found or location not configured" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
