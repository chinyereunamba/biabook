import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appointmentRepository } from "@/server/repositories/appointment-repository";
import { auth } from "@/server/auth";

// Schema for updating an appointment
const updateAppointmentSchema = z.object({
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // YYYY-MM-DD
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(), // HH:MM
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/appointments/[id]
 * Get a specific appointment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointment = await appointmentRepository.getById(params.id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error getting appointment:", error);
    return NextResponse.json(
      { error: "Failed to get appointment" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/appointments/[id]
 * Update a specific appointment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = updateAppointmentSchema.parse(body);

    // Update appointment
    const appointment = await appointmentRepository.update(
      id,
      validatedData,
    );

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/appointments/[id]
 * Delete a specific appointment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await appointmentRepository.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 },
    );
  }
}
