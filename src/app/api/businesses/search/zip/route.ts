/**
 * API endpoint for zip code-based business search
 */

import { NextRequest, NextResponse } from "next/server";
import { proximitySearchService } from "@/server/services/proximity-search-service";

interface SearchByZipRequest {
  zipCode: string;
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
    const body: SearchByZipRequest = await request.json();
    const {
      zipCode,
      radius = 25,
      categoryId,
      sortBy = "distance",
      includeServices = false,
      validateServiceRadius = false,
      limit = 20,
      offset = 0,
    } = body;

    // Validate input
    if (!zipCode || typeof zipCode !== "string") {
      return NextResponse.json(
        { error: "Valid zip code is required" },
        { status: 400 },
      );
    }

    // Basic zip code validation
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(zipCode.trim())) {
      return NextResponse.json(
        { error: "Invalid zip code format. Use 12345 or 12345-6789 format" },
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
    const results = await proximitySearchService.searchByZipCode(
      zipCode.trim(),
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
          zipCode: zipCode.trim(),
          radius,
          categoryId,
          sortBy,
          resultsCount: results.length,
        },
      },
    });
  } catch (error) {
    console.error("Zip code search error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const zipCode = searchParams.get("zipCode");
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

    if (!zipCode) {
      return NextResponse.json(
        { error: "Zip code query parameter is required" },
        { status: 400 },
      );
    }

    // Basic zip code validation
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(zipCode.trim())) {
      return NextResponse.json(
        { error: "Invalid zip code format. Use 12345 or 12345-6789 format" },
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
    const results = await proximitySearchService.searchByZipCode(
      zipCode.trim(),
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
          zipCode: zipCode.trim(),
          radius,
          categoryId,
          sortBy,
          resultsCount: results.length,
        },
      },
    });
  } catch (error) {
    console.error("Zip code search error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
