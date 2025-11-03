import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { availabilityCalculationEngine } from "@/server/repositories/availability-calculation";
import { bookingPerformanceMonitor } from "@/server/monitoring/booking-performance-monitor";

// The caching is now handled by the availability cache service

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
  const startTime = Date.now();
  let success = false;
  let errorMessage: string | undefined;

  try {
    const { businessId } = await params;
    const { searchParams } = new URL(request.url);

    const serviceId = searchParams.get("serviceId") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const days = Math.min(parseInt(searchParams.get("days") ?? "7"), 30); // Limit to 30 days max

    // Record availability view for conversion tracking
    bookingPerformanceMonitor.recordAvailabilityView(businessId);

    // Validate required parameters
    if (!businessId?.trim()) {
      errorMessage = "Business ID is required";
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 },
      );
    }

    // Validate days parameter
    if (days < 1) {
      errorMessage = "Days must be at least 1";
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
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

    // Use cached availability calculation from the engine
    const availability =
      await availabilityCalculationEngine.calculateAvailability(
        businessId,
        serviceId,
        options,
      );

    console.timeEnd(`availability-${businessId}`);
    success = true;

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
    errorMessage = error instanceof Error ? error.message : "Unknown error";

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
  } finally {
    // Record performance metrics
    const duration = Date.now() - startTime;
    const { businessId } = await params;
    bookingPerformanceMonitor.recordOperation(
      businessId,
      "availability_check",
      duration,
      success,
      errorMessage,
    );
  }
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]!;
}
