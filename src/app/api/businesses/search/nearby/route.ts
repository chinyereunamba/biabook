/**
 * API endpoint for proximity-based business search
 */

import { NextRequest, NextResponse } from "next/server";
import { proximitySearchService } from "@/server/services/proximity-search-service";
import { validateCoordinates } from "@/lib/distance-utils";

interface SearchNearbyRequest {
  latitude: number;
  longitude: number;
  radius?: number;
  categoryId?: string;
  sortBy?: "distance" | "rating" | "price" | "name";
  includeServices?: boolean;
  validateServiceRadius?: boolean;
  limit?: number;
  offset?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchNearbyRequest = await request.json();
    const {
      latitude,
      longitude,
      radius = 25,
      categoryId,
      sortBy = "distance",
      includeServices = false,
      validateServiceRadius = false,
      limit = 20,
      offset = 0,
    } = body;

    // Validate input
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Valid latitude and longitude are required" },
        { status: 400 },
      );
    }

    const location = { latitude, longitude };

    if (!validateCoordinates(location)) {
      return NextResponse.json(
        { error: "Invalid coordinates provided" },
        { status: 400 },
      );
    }

    if (radius <= 0 || radius > 500) {
      return NextResponse.json(
        { error: "Radius must be between 1 and 500 miles" },
        { status: 400 },
      );
    }

    // Perform search
    const results = await proximitySearchService.searchNearby(
      location,
      {
        radius,
        categoryId,
        sortBy,
        limit,
        offset,
      },
      {
        includeServices,
        validateServiceRadius,
      },
    );

    return NextResponse.json({
      success: true,
      data: {
        businesses: results,
        searchParams: {
          location,
          radius,
          categoryId,
          sortBy,
          resultsCount: results.length,
        },
      },
    });
  } catch (error) {
    console.error("Proximity search error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const latitude = parseFloat(searchParams.get("latitude") || "");
    const longitude = parseFloat(searchParams.get("longitude") || "");
    const radius = parseInt(searchParams.get("radius") || "25");
    const categoryId = searchParams.get("categoryId") || undefined;
    const sortBy =
      (searchParams.get("sortBy") as
        | "distance"
        | "rating"
        | "price"
        | "name") || "distance";
    const includeServices = searchParams.get("includeServices") === "true";
    const validateServiceRadius =
      searchParams.get("validateServiceRadius") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Valid latitude and longitude query parameters are required" },
        { status: 400 },
      );
    }

    const location = { latitude, longitude };

    if (!validateCoordinates(location)) {
      return NextResponse.json(
        { error: "Invalid coordinates provided" },
        { status: 400 },
      );
    }

    if (radius <= 0 || radius > 500) {
      return NextResponse.json(
        { error: "Radius must be between 1 and 500 miles" },
        { status: 400 },
      );
    }

    // Perform search
    const results = await proximitySearchService.searchNearby(
      location,
      {
        radius,
        categoryId,
        sortBy,
        limit,
        offset,
      },
      {
        includeServices,
        validateServiceRadius,
      },
    );

    return NextResponse.json({
      success: true,
      data: {
        businesses: results,
        searchParams: {
          location,
          radius,
          categoryId,
          sortBy,
          resultsCount: results.length,
        },
      },
    });
  } catch (error) {
    console.error("Proximity search error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
