import { type NextRequest, NextResponse } from "next/server";
import { availabilityExceptionRepository } from "@/server/repositories/availability-exception-repository";
import { auth } from "@/server/auth";
// import { getCurrentUserBusiness } from "@/server/auth/helpers";

// DELETE /api/businesses/:businessId/availability/exceptions/:exceptionId
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string; exceptionId: string }> },
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you would check if the user has access to this business
    // For now, we'll assume they do

    const { businessId, exceptionId } = await params;

    // Delete the exception
    const success = await availabilityExceptionRepository.delete(
      exceptionId,
      businessId,
    );

    if (!success) {
      return NextResponse.json(
        { error: "Exception not found or could not be deleted" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting availability exception:", error);
    return NextResponse.json(
      { error: "Failed to delete availability exception" },
      { status: 500 },
    );
  }
}
