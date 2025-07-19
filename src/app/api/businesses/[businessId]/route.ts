import { type NextRequest, NextResponse } from "next/server";
import { businessRepository } from "@/server/repositories/business-repository";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ businessId: string }> }
) {
    try {
        const { businessId } = await params;

        if (!businessId) {
            return NextResponse.json(
                { error: "Business ID is required" },
                { status: 400 }
            );
        }

        const business = await businessRepository.findByIdWithServices(businessId);

        if (!business) {
            return NextResponse.json(
                { error: "Business not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(business);
    } catch (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}