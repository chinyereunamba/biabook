import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, services, businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { notificationService } from "@/server/notifications/notification-service";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors, toBookingError } from "@/server/errors/booking-errors";
import { bookingLogger } from "@/server/logging/booking-logger";

async function cancelBookingHandler(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json();
  const { id } = body;

  const context = {
    operation: "cancelBooking",
    path: `/api/bookings/cancel-booking`,
    method: "POST",
    appointmentId: id,
  };

  try {
    if (!id) {
      throw BookingErrors.validation("Appointment ID is required", "id");
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
      bookingLogger.warn("Appointment not found for cancellation", {
        ...context,
        appointmentId: id,
      });
      throw BookingErrors.appointmentNotFound(id);
    }

    // Check if appointment is already cancelled
    if (appointmentData.appointment.status === "cancelled") {
      return NextResponse.json({
        message: "Appointment is already cancelled",
        id: appointmentData.appointment.id,
      });
    }

    // Update appointment status to cancelled
    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    if (!updatedAppointment) {
      throw BookingErrors.database("Failed to cancel appointment");
    }

    bookingLogger.info("Appointment cancelled successfully", {
      ...context,
      customerEmail: appointmentData.appointment.customerEmail,
    });

    // Cancel all pending reminder notifications for this appointment
    try {
      const { notificationQueueService } = await import(
        "@/server/notifications/notification-queue"
      );
      const cancelledCount =
        await notificationQueueService.cancelNotificationsForAppointment(id);
      bookingLogger.info(
        `Cancelled ${cancelledCount} pending notification(s) for appointment`,
        {
          ...context,
          cancelledNotifications: cancelledCount,
        },
      );
    } catch (error) {
      bookingLogger.warn(
        "Failed to cancel pending notifications",
        { ...context },
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
      // Don't fail the cancellation if notification cleanup fails
    }

    // Prepare data for notifications
    const appointmentForNotification = {
      ...appointmentData.appointment,
      appointmentDate: new Date(appointmentData.appointment.appointmentDate),
      status: "cancelled" as const,
    };

    const businessForNotification = {
      ...appointmentData.business,
      slug: appointmentData.business.name.toLowerCase().replace(/\s+/g, "-"),
      userId: appointmentData.business.ownerId,
    };

    // Send cancellation notifications asynchronously (don't block the response)
    Promise.allSettled([
      notificationService.sendCancellationNotificationToBusiness(
        appointmentForNotification,
        appointmentData.service,
        businessForNotification,
      ),
      notificationService.sendBookingCancellationToCustomer(
        appointmentForNotification,
        appointmentData.service,
        businessForNotification,
      ),
    ])
      .then((results) => {
        results.forEach((result, index) => {
          const notificationType = index === 0 ? "business" : "customer";
          if (result.status === "rejected") {
            console.error(
              `Failed to send ${notificationType} cancellation notification:`,
              result.reason,
            );
          } else {
            console.log(
              `${notificationType} cancellation notification sent successfully`,
            );
          }
        });

        bookingLogger.info("Cancellation notifications processed", {
          ...context,
          customerEmail: appointmentData.appointment.customerEmail,
        });
      })
      .catch((error) => {
        bookingLogger.warn(
          "Error processing cancellation notifications",
          {
            ...context,
            customerEmail: appointmentData.appointment.customerEmail,
          },
          {
            error: error instanceof Error ? error.message : String(error),
          },
        );
      });

    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation("cancelBooking", true, duration, context);

    return NextResponse.json({
      message: "Booking cancelled successfully",
      id: appointmentData.appointment.id,
      status: "cancelled",
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const bookingError = toBookingError(error);

    bookingLogger.logBookingOperation(
      "cancelBooking",
      false,
      duration,
      context,
      bookingError,
    );

    throw bookingError;
  }
}

export const POST = withErrorHandler(cancelBookingHandler);
