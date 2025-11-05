/**
 * API endpoint for address autocomplete suggestions
 */

import { NextRequest, NextResponse } from "next/server";
import { geocodingService } from "@/lib/api/geocoding-service";
import { z } from "zod";

// Request schema
const autocompleteRequestSchema = z.object({
  input: z.string().min(3, "Input must be at least 3 characters"),
  sessionToken: z.string().optional(),
});

/**
 * GET /api/location/autocomplete?input=...&sessionToken=...
 * Gets address autocomplete suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("input");
    const sessionToken = searchParams.get("sessionToken");

    if (!input) {
      return NextResponse.json(
        {
          success: false,
          error: "Input parameter is required",
        },
        { status: 400 },
      );
    }

    const { input: validatedInput, sessionToken: validatedSessionToken } =
      autocompleteRequestSchema.parse({
        input,
        sessionToken: sessionToken || undefined,
      });

    const suggestions = await geocodingService.getAddressSuggestions(
      validatedInput,
      validatedSessionToken,
    );

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        input: validatedInput,
      },
    });
  } catch (error) {
    console.error("Address autocomplete error:", error);

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
        error: error instanceof Error ? error.message : "Autocomplete failed",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/location/autocomplete
 * Gets address autocomplete suggestions (alternative POST method)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, sessionToken } = autocompleteRequestSchema.parse(body);

    const suggestions = await geocodingService.getAddressSuggestions(
      input,
      sessionToken,
    );

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        input,
      },
    });
  } catch (error) {
    console.error("Address autocomplete error:", error);

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
        error: error instanceof Error ? error.message : "Autocomplete failed",
      },
      { status: 500 },
    );
  }
}
