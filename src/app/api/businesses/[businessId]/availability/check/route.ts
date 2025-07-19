import { type NextRequest, NextResponse } from "next/server";
import { availabilityCalculationEngine } from "@/server/repositories/availability-calculation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId } = await params;
    const { searchParams } = new URL(request.url);

    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 },
      );
    }

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Date, start time, and end time are required" },
        { status: 400 },
      );
    }

    // Check if the specific time slot is available
    const available = await availabilityCalculationEngine.isTimeSlotAvailable(
      businessId,
      date,
      startTime,
      endTime,
    );

    return NextResponse.json({ available });
  } catch (error) {
    console.error("Error checking slot availability:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to check slot availability" },
      { status: 500 },
    );
  }
}