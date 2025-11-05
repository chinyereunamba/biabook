/**
 * API endpoint for getting geocoding provider information
 */

import { NextResponse } from "next/server";
import { enhancedGeocodingService } from "@/lib/api/enhanced-geocoding-service";

export async function GET() {
  try {
    const providerInfo = enhancedGeocodingService.getProviderInfo();

    return NextResponse.json({
      success: true,
      data: providerInfo,
    });
  } catch (error) {
    console.error("Provider info error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get provider info",
      },
      { status: 500 },
    );
  }
}
