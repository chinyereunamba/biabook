import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors, toBookingError } from "@/server/errors/booking-errors";
import { bookingLogger } from "@/server/logging/booking-logger";

// Validation schema for lookup request
const lookupSchema = z.object({
  confirmationNumber: z
    .string()
    .min(1, "Confirmation number is required")
    .max(50, "Confirmation number is too long"),
});

async function lookupBookingHandler(request: NextRequest) {
  const startTime = Date.now();
  const context = {
    operation: "lookupBooking",
    path: "/api/bookings/lookup",
    method: "GET",
  };

  try {
    const { searchParams } = new URL(request.url);
    const queryData = {
      confirmationNumber: searchParams.get("confirmationNumber") ?? "",
    };

    // Validate query parameters
    const validationResult = lookupSchema.safeParse(queryData);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      bookingLogger.logValidationError(
        "lookup_request",
        queryData,
        `Validation failed: ${fieldErrors.map((e) => `${e.field}: ${e.message}`).join(", ")}`,
        context,
      );

      throw BookingErrors.validation(
        "Please provide a valid confirmation number",
        "confirmationNumber",
        [
          "Confirmation numbers are typically 8-12 characters long",
          "Check your booking confirmation email for the correct number",
        ],
      );
    }

    const { confirmationNumber } = validationResult.data;

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
      bookingLogger.warn("Booking not found during lookup", {
        ...context,
        confirmationNumber,
      });

      throw BookingErrors.appointmentNotFound(confirmationNumber);
    }

    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation("lookupBooking", true, duration, {
      ...context,
      appointmentId: appointment.id,
      confirmationNumber,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    const duration = Date.now() - startTime;
    const bookingError = toBookingError(error);

    bookingLogger.logBookingOperation(
      "lookupBooking",
      false,
      duration,
      context,
      bookingError,
    );

    throw bookingError;
  }
}

export const GET = withErrorHandler(lookupBookingHandler);
