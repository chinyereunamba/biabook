import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirmationNumber = searchParams.get("confirmationNumber");

    if (!confirmationNumber) {
      return NextResponse.json(
        { message: "Confirmation number is required" },
        { status: 400 },
      );
    }

    // Find the appointment by confirmation number
    const [appointment] = await db
      .select({
        id: appointments.id,
        businessId: appointments.businessId,
        serviceId: appointments.serviceId,
        customerName: appointments.customerName,
        customerEmail: appointments.customerEmail,
        customerPhone: appointments.customerPhone,
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status,
        notes: appointments.notes,
        confirmationNumber: appointments.confirmationNumber,
      })
      .from(appointments)
      .where(eq(appointments.confirmationNumber, confirmationNumber))
      .limit(1);

    if (!appointment) {
      return NextResponse.json(
        {
          message: "Booking not found. Please check your confirmation number.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error looking up booking:", error);
    return NextResponse.json(
      { message: "Failed to look up booking" },
      { status: 500 },
    );
  }
}
