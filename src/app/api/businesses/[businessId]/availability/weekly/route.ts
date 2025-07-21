import {type NextRequest, NextResponse } from "next/server";
import { weeklyAvailabilityRepository } from "@/server/repositories/weekly-availability-repository";
import { auth } from "@/server/auth";

// GET /api/businesses/:businessId/availability/weekly
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

    const {businessId} = await params;
    const weeklySchedule =
      await weeklyAvailabilityRepository.findByBusinessId(businessId);

    return NextResponse.json({ weeklySchedule });
  } catch (error) {
    console.error("Error fetching weekly availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly availability" },
      { status: 500 },
    );
  }
}

// POST /api/businesses/:businessId/availability/weekly
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await params;
    const data = await req.json();

    if (!Array.isArray(data.schedule)) {
      return NextResponse.json(
        { error: "Invalid schedule data" },
        { status: 400 },
      );
    }

    // Validate and transform the schedule data
    const scheduleData = data.schedule.map((item: any) => ({
      businessId,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      isAvailable: item.isAvailable,
    }));

    // Save the schedule
    const result = await weeklyAvailabilityRepository.bulkSet(
      businessId,
      scheduleData,
    );

    return NextResponse.json({ success: true, weeklySchedule: result });
  } catch (error) {
    console.error("Error saving weekly availability:", error);
    return NextResponse.json(
      { error: "Failed to save weekly availability" },
      { status: 500 },
    );
  }
}
