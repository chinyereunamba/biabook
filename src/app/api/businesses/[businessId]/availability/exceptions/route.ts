import { type NextRequest, NextResponse } from "next/server";
import { availabilityExceptionRepository } from "@/server/repositories/availability-exception-repository";
import { auth } from "@/server/auth";

// GET /api/businesses/:businessId/availability/exceptions
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
    const exceptions =
      await availabilityExceptionRepository.findByBusinessId(businessId);

    return NextResponse.json({ exceptions });
  } catch (error) {
    console.error("Error fetching availability exceptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability exceptions" },
      { status: 500 },
    );
  }
}

// POST /api/businesses/:businessId/availability/exceptions
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

    // Create the exception
    const exceptionData = {
      businessId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      isAvailable: data.isAvailable,
      reason: data.reason,
    };

    const result = await availabilityExceptionRepository.create(exceptionData);

    return NextResponse.json({ success: true, exception: result });
  } catch (error) {
    console.error("Error creating availability exception:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create availability exception",
      },
      { status: 500 },
    );
  }
}
