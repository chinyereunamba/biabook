import { NextRequest, NextResponse } from "next/server";
import { availabilityCalculationEngine } from "@/server/repositories/availability-calculation";

export async function GET(
    request: NextRequest,
    { params }: { params: { businessId: string } }
) {
    try {
        const { businessId } = params;
        const { searchParams } = new URL(request.url);

        const serviceId = searchParams.get("serviceId");
        const startDate = searchParams.get("startDate");
        const days = searchParams.get("days");

        if (!businessId) {
            return NextResponse.json(
                { error: "Business ID is required" },
                { status: 400 }
            );
        }

        const options = {
            startDate: startDate || undefined,
            days: days ? parseInt(days) : 30,
        };

        const availability = await availabilityCalculationEngine.calculateAvailability(
            businessId,
            serviceId || undefined,
            options
        );

        return NextResponse.json({ availability });
    } catch (error) {
        console.error("Error fetching availability:", error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to fetch availability" },
            { status: 500 }
        );
    }
}