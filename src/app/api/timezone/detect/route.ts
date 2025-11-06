import { NextRequest, NextResponse } from "next/server";
import { timezoneProviderManager } from "@/lib/timezone-providers";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";
import { z } from "zod";

const DetectTimezoneSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude } = DetectTimezoneSchema.parse(body);

    const result = await timezoneProviderManager.detectTimezoneWithFallback({
      latitude,
      longitude,
    });

    return NextResponse.json({
      timezone: result.timezone,
      provider: result.provider,
    });
  } catch (error) {
    console.error("Timezone detection API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid coordinates provided",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    if (error instanceof LocationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          userMessage: error.userMessage,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to detect timezone",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
