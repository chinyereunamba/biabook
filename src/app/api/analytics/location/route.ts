import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { customerLocationService } from "@/server/services/customer-location-service";
import { businessRepository } from "@/server/repositories/business-repository";
import { z } from "zod";

// Validation schema for location analytics request
const locationAnalyticsSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get business ID from query parameters
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    // Validate request
    const validation = locationAnalyticsSchema.safeParse({ businessId });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    // Verify business ownership
    const business = await businessRepository.findById(businessId!);
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    if (business.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get location analytics
    const analytics =
      await customerLocationService.getBusinessLocationAnalytics(businessId!);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Failed to get location analytics:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve location analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
