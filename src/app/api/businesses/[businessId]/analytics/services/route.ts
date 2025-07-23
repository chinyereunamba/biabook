import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { analyticsRepository } from "@/server/repositories/analytics-repository";

// GET /api/businesses/:businessId/analytics/services
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

    // Parse optional date range parameters
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    // Get service performance analytics
    const servicePerformance = await analyticsRepository.getServicePerformance(
      businessId,
      {
        from,
        to,
      },
    );

    return NextResponse.json({
      services: servicePerformance,
      dateRange: {
        from: from || null,
        to: to || null,
      },
    });
  } catch (error) {
    console.error("Error fetching service analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch service analytics" },
      { status: 500 },
    );
  }
}
