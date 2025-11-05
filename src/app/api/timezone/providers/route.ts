import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  detectTimezone,
  detectTimezoneWithProvider,
  getAvailableTimezoneProviders,
} from "@/lib/timezone-service";
import { LocationError } from "@/lib/location-validation";

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const providerTestSchema = z.object({
  coordinates: coordinatesSchema,
  provider: z.string().optional(),
});

/**
 * GET /api/timezone/providers
 * Returns available timezone providers and their status
 */
export async function GET() {
  try {
    const providers = getAvailableTimezoneProviders();

    return NextResponse.json({
      success: true,
      providers,
    });
  } catch (error) {
    console.error("Failed to get timezone providers:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get timezone providers",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/timezone/providers
 * Test timezone detection with specific provider or auto-fallback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coordinates, provider } = providerTestSchema.parse(body);

    let result;

    if (provider) {
      // Test specific provider
      result = await detectTimezoneWithProvider(coordinates, provider);
    } else {
      // Use auto-fallback
      const timezone = await detectTimezone(coordinates);
      result = { timezone, provider: "auto" };
    }

    return NextResponse.json({
      success: true,
      ...result,
      coordinates,
    });
  } catch (error) {
    console.error("Timezone detection failed:", error);

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
        error: "Timezone detection failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
