import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { analyticsRepository } from "@/server/repositories/analytics-repository";

// GET /api/businesses/:businessId/analytics/customers
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
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    // Get customer metrics
    const customerMetrics = await analyticsRepository.getCustomerMetrics(
      businessId,
      {
        from,
        to,
      },
    );

    return NextResponse.json({
      customers: customerMetrics,
      dateRange: {
        from: from ?? null,
        to: to ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching customer analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer analytics" },
      { status: 500 },
    );
  }
}
