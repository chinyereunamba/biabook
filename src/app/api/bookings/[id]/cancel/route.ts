import {type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, services, businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { notificationService } from "@/server/notifications/notification-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    // Check if the booking is already cancelled
    if (appointmentData.appointment.status === "cancelled") {
      return NextResponse.json(
        { message: "Booking is already cancelled" },
        { status: 400 },
      );
    }

    // Check if the booking is in the past
    const appointmentDate = new Date(
      `${appointmentData.appointment.appointmentDate}T${appointmentData.appointment.startTime}:00`,
    );
    if (appointmentDate < new Date()) {
      return NextResponse.json(
        { message: "Cannot cancel a booking that has already passed" },
        { status: 400 },
      );
    }

    // Check if the booking is within 2 hours
    const now = new Date();
    const diffInHours =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours <= 2) {
      // For bookings within 2 hours, we'll still allow cancellation but mark it for business approval
      // In a real app, you might want to handle this differently
      console.log("Booking is within 2 hours of appointment time");
    }

    // Update the appointment status to cancelled
    await db
      .update(appointments)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id));

    const appointmentForNotification = {
      ...appointmentData.appointment,
      appointmentDate: new Date(appointmentData.appointment.appointmentDate),
    };

    const businessForNotification = {
      ...appointmentData.business,
      slug: appointmentData.business.slug ?? "", // Add a fallback for slug
      userId: appointmentData.business.ownerId, // Assuming ownerId is the userId
    };

    // Send cancellation notifications
    try {
      // Notify the business owner
      await notificationService.sendCancellationNotificationToBusiness(
        appointmentForNotification,
        appointmentData.service,
        businessForNotification,
      );

      // Send cancellation email to the customer
      await notificationService.sendBookingCancellationToCustomer(
        appointmentForNotification,
        appointmentData.service,
        businessForNotification,
      );
    } catch (notificationError) {
      console.error(
        "Error sending cancellation notifications:",
        notificationError,
      );
      // Continue with the cancellation even if notifications fail
    }

    // Check if the request wants a redirect or JSON response
    const redirectUrl = request.nextUrl.searchParams.get("redirect");
    if (redirectUrl === "true") {
      // Create a redirect response to the cancelled page
      return NextResponse.redirect(
        new URL(`/booking/${id}/cancelled`, request.url),
      );
    }

    return NextResponse.json({
      message: "Booking cancelled successfully",
      id: appointmentData.appointment.id,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { message: "Failed to cancel booking" },
      { status: 500 },
    );
  }
}
