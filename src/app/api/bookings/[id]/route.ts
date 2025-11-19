import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appointmentRepository } from "@/server/repositories/appointment-repository";
import { auth } from "@/server/auth";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors } from "@/server/errors/booking-errors";

// Schema for updating an appointment
const updateAppointmentSchema = z.object({
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/bookings/[id]
 * Get a specific booking by ID
 */
async function getBookingHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    throw BookingErrors.unauthorized();
  }

  const appointment = await appointmentRepository.getById(id);

  if (!appointment) {
    throw BookingErrors.notFound(id);
  }

  return NextResponse.json(appointment);
}

/**
 * PATCH /api/bookings/[id]
 * Update a specific booking
 */
async function updateBookingHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    throw BookingErrors.unauthorized();
  }

  const body = await request.json();
  const validatedData = updateAppointmentSchema.parse(body);

  const appointment = await appointmentRepository.update(id, validatedData);

  return NextResponse.json(appointment);
}

/**
 * DELETE /api/bookings/[id]
 * Delete a specific booking
 */
async function deleteBookingHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    throw BookingErrors.unauthorized();
  }

  const success = await appointmentRepository.delete(id);

  if (!success) {
    throw BookingErrors.notFound(id);
  }

  return NextResponse.json({ success: true });
}

export const GET = withErrorHandler(getBookingHandler);
export const PATCH = withErrorHandler(updateBookingHandler);
export const DELETE = withErrorHandler(deleteBookingHandler);
