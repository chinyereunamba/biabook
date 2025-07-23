import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { analyticsRepository } from "@/server/repositories/analytics-repository";

// GET /api/businesses/:businessId/analytics/trends
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you would check if the user has access to this business
    // For now, we'll assume they do

    const { businessId } = await params;
    const { searchParams } = new URL(req.url);

    // Parse days parameter (default to 30 days)
    const days = parseInt(searchParams.get("days") || "30");

    // Get booking trends
    const trends = await analyticsRepository.getBookingTrends(businessId, days);

    return NextResponse.json({
      trends,
      period: {
        days,
      },
    });
  } catch (error) {
    console.error("Error fetching booking trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking trends" },
      { status: 500 },
    );
  }
}
