import { type NextRequest, NextResponse } from "next/server";
import { businessRepository } from "@/server/repositories/business-repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId } = await params;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 },
      );
    }

    // TODO: cache the business info when fetch to avoid fetching again when the user refreshes

    // Try to find by ID first, then by slug
    let business = await businessRepository.findByIdWithServices(businessId);

    if (!business) {
      // If not found by ID, try by slug
      business = await businessRepository.findBySlugWithServices(businessId);
    }

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
