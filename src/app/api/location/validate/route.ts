/**
 * API endpoint for address validation
 */

import { NextRequest, NextResponse } from "next/server";
import { geocodingService } from "@/lib/api/geocoding-service";
import { z } from "zod";

// Request schema
const validateRequestSchema = z.object({
  address: z.string().min(1, "Address is required"),
});

/**
 * POST /api/location/validate
 * Validates an address and returns detailed information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = validateRequestSchema.parse(body);

    const validation = await geocodingService.validateAddress(address);

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("Address validation error:", error);

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
          error instanceof Error ? error.message : "Address validation failed",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/location/validate?address=...
 * Validates an address (alternative GET method)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "address parameter is required",
        },
        { status: 400 },
      );
    }

    const { address: validatedAddress } = validateRequestSchema.parse({
      address,
    });

    const validation = await geocodingService.validateAddress(validatedAddress);

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("Address validation error:", error);

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
          error instanceof Error ? error.message : "Address validation failed",
      },
      { status: 500 },
    );
  }
}
