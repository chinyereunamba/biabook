import { NextRequest, NextResponse } from "next/server";
import { cacheWarmingService } from "@/server/cache/cache-warming";
import { auth } from "@/server/auth";

/**
 * POST /api/admin/cache/warm
 * Manually trigger cache warming for businesses
 *
 * Body Parameters:
 * - businessId: Optional specific business ID to warm
 * - mode: 'all' | 'active' (default: 'active')
 * - hoursBack: For 'active' mode, how many hours back to look for activity (default: 24)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { businessId, mode = "active", hoursBack = 24 } = body;

    // Validate parameters
    if (mode && !["all", "active"].includes(mode)) {
      return NextResponse.json(
        { error: "Mode must be 'all' or 'active'" },
        { status: 400 },
      );
    }

    if (hoursBack && (hoursBack < 1 || hoursBack > 168)) {
      return NextResponse.json(
        { error: "hoursBack must be between 1 and 168 hours" },
        { status: 400 },
      );
    }

    let result;

    if (businessId) {
      // Warm specific business
      try {
        await cacheWarmingService.warmBusinessCache(businessId);
        result = {
          success: true,
          businessesWarmed: 1,
          errors: [],
          duration: 0, // Not tracked for single business
        };
      } catch (error) {
        result = {
          success: false,
          businessesWarmed: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          duration: 0,
        };
      }
    } else if (mode === "all") {
      // Warm all businesses
      result = await cacheWarmingService.warmAllBusinesses();
    } else {
      // Warm active businesses
      result = await cacheWarmingService.warmActiveBusinesses(hoursBack);
    }

    return NextResponse.json({
      success: result.success,
      data: {
        businessesWarmed: result.businessesWarmed,
        errors: result.errors,
        duration: result.duration,
        mode: businessId ? "single" : mode,
        ...(businessId && { businessId }),
        ...(mode === "active" && { hoursBack }),
      },
    });
  } catch (error) {
    console.error("Error warming cache:", error);
    return NextResponse.json(
      { error: "Failed to warm cache" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/cache/warm
 * Get cache warming status
 */
export async function GET() {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const status = cacheWarmingService.getStatus();

    return NextResponse.json({
      success: true,
      data: {
        isWarming: status.isWarming,
        lastWarmingTime: status.lastWarmingTime
          ? new Date(status.lastWarmingTime).toISOString()
          : null,
        nextWarmingTime: status.nextWarmingTime
          ? new Date(status.nextWarmingTime).toISOString()
          : null,
        shouldWarmCache: cacheWarmingService.shouldWarmCache(),
      },
    });
  } catch (error) {
    console.error("Error getting cache warming status:", error);
    return NextResponse.json(
      { error: "Failed to get cache warming status" },
      { status: 500 },
    );
  }
}
