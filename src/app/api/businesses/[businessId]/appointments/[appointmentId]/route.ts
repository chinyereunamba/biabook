import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, services, businesses } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/server/auth";
import { z } from "zod";
import { notificationScheduler } from "@/server/notifications/notification-scheduler";

// Validation schema for appointment updates
const updateAppointmentSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  notes: z.string().optional(),
});

// GET /api/businesses/:businessId/appointments/:appointmentId
export async function GET(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ businessId: string; appointmentId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, appointmentId } = await params;

    // Get appointment with service and business details
    const appointment = await db
      .select({
        id: appointments.id,
        customerName: appointments.customerName,
        customerEmail: appointments.customerEmail,
        customerPhone: appointments.customerPhone,
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status,
        notes: appointments.notes,
        confirmationNumber: appointments.confirmationNumber,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        servicePrice: appointments.servicePrice,
        service: {
          id: services.id,
          name: services.name,
          duration: services.duration,
          price: services.price,
        },
        business: {
          id: businesses.id,
          name: businesses.name,
          phone: businesses.phone,
          email: businesses.email,
        },
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(businesses, eq(appointments.businessId, businesses.id))
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.businessId, businessId),
        ),
      )
      .limit(1);

    if (appointment.length === 0) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ appointment: appointment[0] });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 },
    );
  }
}

// PATCH /api/businesses/:businessId/appointments/:appointmentId
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ businessId: string; appointmentId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, appointmentId } = await params;
    const body = await req.json();

    // Validate request body
    const validationResult = updateAppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error },
        { status: 400 },
      );
    }

    const updateData = validationResult.data;

    // Check if appointment exists and belongs to the business
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.businessId, businessId),
        ),
      )
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    const currentAppointment = existingAppointment[0]!;

    // Update the appointment
    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId))
      .returning();

    if (!updatedAppointment) {
      return NextResponse.json(
        { error: "Failed to update appointment" },
        { status: 500 },
      );
    }

    // Handle status change notifications
    if (updateData.status && updateData.status !== currentAppointment.status) {
      try {
        // Get service and business details for notifications
        const service = await db
          .select()
          .from(services)
          .where(eq(services.id, currentAppointment.serviceId))
          .limit(1);

        const business = await db
          .select()
          .from(businesses)
          .where(eq(businesses.id, businessId))
          .limit(1);

        if (service[0] && business[0]) {
          const appointmentForNotification = {
            ...updatedAppointment,
            appointmentDate: new Date(updatedAppointment.appointmentDate),
          };

          const businessForNotification = {
            ...business[0],
            slug: business[0].name.toLowerCase().replace(/ /g, "-"),
            userId: business[0].ownerId,
          };

          if (updateData.status === "cancelled") {
            await notificationScheduler.scheduleBookingCancellation(
              appointmentForNotification,
              service[0],
              businessForNotification,
            );
          } else if (updateData.status === "confirmed") {
            await notificationScheduler.scheduleBookingConfirmation(
              appointmentForNotification,
              service[0],
              businessForNotification,
            );
          }
        }
      } catch (notificationError) {
        console.error("Failed to schedule notifications:", notificationError);
        // Don't fail the update if notifications fail
      }
    }

    return NextResponse.json({
      appointment: updatedAppointment,
      message: "Appointment updated successfully",
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 },
    );
  }
}

// DELETE /api/businesses/:businessId/appointments/:appointmentId
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ businessId: string; appointmentId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, appointmentId } = await params;

    // Check if appointment exists and belongs to the business
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.businessId, businessId),
        ),
      )
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    // Soft delete by setting status to cancelled
    const [cancelledAppointment] = await db
      .update(appointments)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId))
      .returning();

    if (!cancelledAppointment) {
      return NextResponse.json(
        { error: "Failed to cancel appointment" },
        { status: 500 },
      );
    }

    // Send cancellation notifications
    try {
      const service = await db
        .select()
        .from(services)
        .where(eq(services.id, existingAppointment[0]!.serviceId))
        .limit(1);

      const business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, businessId))
        .limit(1);

      if (service[0] && business[0]) {
        const appointmentForNotification = {
          ...cancelledAppointment,
          appointmentDate: new Date(cancelledAppointment.appointmentDate),
        };

        const businessForNotification = {
          ...business[0],
          slug: business[0].name.toLowerCase().replace(/ /g, "-"),
          userId: business[0].ownerId,
        };

        await notificationScheduler.scheduleBookingCancellation(
          appointmentForNotification,
          service[0],
          businessForNotification,
        );
      }
    } catch (notificationError) {
      console.error(
        "Failed to schedule cancellation notifications:",
        notificationError,
      );
      // Don't fail the cancellation if notifications fail
    }

    return NextResponse.json({
      appointment: cancelledAppointment,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 },
    );
  }
}
