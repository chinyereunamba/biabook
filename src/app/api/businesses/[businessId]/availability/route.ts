import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { availabilityCalculationEngine } from "@/server/repositories/availability-calculation";

// Cache availability calculations for 5 minutes to avoid repeated calls
const getCachedAvailability = unstable_cache(
  async (
    businessId: string,
    serviceId: string | undefined,
    options: { startDate?: string; days: number },
  ) => {
    return await availabilityCalculationEngine.calculateAvailability(
      businessId,
      serviceId,
      options,
    );
  },
  ["business-availability"], // cache key prefix
  {
    revalidate: 300, // cache for 5 minutes
    tags: ["availability"], // allow manual cache invalidation
  },
);

/**
 * GET /api/businesses/[businessId]/availability
 * Get available time slots for a business and optional service
 *
 * Query Parameters:
 * - serviceId: Optional service ID to get service-specific availability
 * - startDate: Start date in YYYY-MM-DD format (defaults to today)
 * - days: Number of days to calculate (defaults to 7, max 30)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId } = await params;
    const { searchParams } = new URL(request.url);

    const serviceId = searchParams.get("serviceId") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const days = Math.min(parseInt(searchParams.get("days") ?? "7"), 30); // Limit to 30 days max

    // Validate required parameters
    if (!businessId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Business ID is required",
        },
        { status: 400 },
      );
    }

    // Validate days parameter
    if (days < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Days must be at least 1",
        },
        { status: 400 },
      );
    }

    // Prepare options for availability calculation
    const options = {
      days,
      ...(startDate ? { startDate } : {}),
    };

    console.time(`availability-${businessId}`);

    // Use cached availability calculation
    const availability = await getCachedAvailability(
      businessId,
      serviceId,
      options,
    );

    console.timeEnd(`availability-${businessId}`);

    return NextResponse.json({
      success: true,
      data: {
        availability,
        businessId,
        serviceId,
        dateRange: {
          startDate: startDate || getTodayString(),
          days,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 },
        );
      }

      if (error.message.includes("No weekly availability")) {
        return NextResponse.json({
          success: true,
          data: {
            availability: [],
            message: "No availability schedule set for this business",
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch availability",
      },
      { status: 500 },
    );
  }
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]!;
}
