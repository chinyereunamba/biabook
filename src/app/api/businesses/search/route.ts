import { NextResponse } from "next/server";
import { proximitySearchService } from "@/server/services/proximity-search-service";
import { geocodeAddress } from "@/lib/api/location-client";
import type { Coordinates } from "@/types/location";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      location,
      address,
      zipCode,
      radius = 25,
      categoryId,
      sortBy = "distance",
      limit = 50,
      offset = 0,
    } = body;

    let searchCoordinates: Coordinates;

    // Determine search coordinates based on input
    if (location && location.latitude && location.longitude) {
      searchCoordinates = location;
    } else if (address) {
      try {
        searchCoordinates = await geocodeAddress(address);
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to geocode address" },
          { status: 400 },
        );
      }
    } else if (zipCode) {
      // Use proximity search service's zip code search
      const results = await proximitySearchService.searchByZipCode(
        zipCode,
        { sortBy, limit, offset, categoryId },
        { includeServices: true },
      );
      return NextResponse.json({ businesses: results });
    } else {
      return NextResponse.json(
        { error: "Location, address, or zip code is required" },
        { status: 400 },
      );
    }

    // Search businesses near the coordinates
    const results = await proximitySearchService.searchNearby(
      searchCoordinates,
      {
        radius,
        categoryId,
        sortBy,
        limit,
        offset,
      },
      { includeServices: true },
    );

    return NextResponse.json({
      businesses: results,
      searchLocation: searchCoordinates,
      searchRadius: radius,
    });
  } catch (error) {
    console.error("Error searching businesses:", error);
    return NextResponse.json(
      { error: "Failed to search businesses" },
      { status: 500 },
    );
  }
}
