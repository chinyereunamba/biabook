import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, services, businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { notificationService } from "@/server/notifications/notification-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const { appointmentDate, startTime, endTime, rescheduleReason } =
      await request.json();

    // Validate required fields
    if (!appointmentDate || !startTime || !endTime) {
      return NextResponse.json(
        { message: "Date and time are required" },
        { status: 400 },
      );
    }

    // Find the appointment
    const [appointmentData] = await db
      .select({
        appointment: appointments,
        service: services,
        business: businesses,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(businesses, eq(appointments.businessId, businesses.id))
      .where(eq(appointments.id, id))
      .limit(1);

    if (!appointmentData) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    // Check if the booking is cancelled
    if (appointmentData.appointment.status === "cancelled") {
      return NextResponse.json(
        { message: "Cannot reschedule a cancelled booking" },
        { status: 400 },
      );
    }

    // Check if the booking is in the past
    const currentAppointmentDate = new Date(
      `${appointmentData.appointment.appointmentDate}T${appointmentData.appointment.startTime}:00`,
    );
    if (currentAppointmentDate < new Date()) {
      return NextResponse.json(
        { message: "Cannot reschedule a booking that has already passed" },
        { status: 400 },
      );
    }

    // Check if the new appointment time is available
    // In a real app, you would check for conflicts here

    // Update the appointment with new date and time
    await db
      .update(appointments)
      .set({
        appointmentDate: appointmentDate,
        startTime,
        endTime,
        notes: rescheduleReason
          ? `${appointmentData.appointment.notes || ""}\n\nReschedule reason: ${rescheduleReason}`.trim()
          : appointmentData.appointment.notes,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id));

    // Send rescheduling notifications
    try {
      // Update the appointment object with new values for notifications
      const updatedAppointment = {
        ...appointmentData.appointment,
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
      };

      const businessForNotification = {
        ...appointmentData.business,
        slug: appointmentData.business.slug ?? "", // Add a fallback for slug
        ownerId: appointmentData.business.ownerId, // Assuming ownerId is the userId
      };
      
      // Notify the business owner
      await notificationService.sendBookingNotificationToBusiness(
        updatedAppointment,
        appointmentData.service,
        businessForNotification,
      );

      // Send rescheduled email to the customer
      await notificationService.sendBookingRescheduledToCustomer(
        updatedAppointment,
        appointmentData.service,
        businessForNotification,
      );
    } catch (notificationError) {
      console.error(
        "Error sending reschedule notifications:",
        notificationError,
      );
      // Continue with the rescheduling even if notifications fail
    }

    return NextResponse.json({
      message: "Booking rescheduled successfully",
      id: appointmentData.appointment.id,
    });
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    return NextResponse.json(
      { message: "Failed to reschedule booking" },
      { status: 500 },
    );
  }
}
