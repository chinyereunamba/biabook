import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, services, businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { notificationService } from "@/server/notifications/notification-service";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors, toBookingError } from "@/server/errors/booking-errors";
import { bookingLogger } from "@/server/logging/booking-logger";
import { bookingConflictService } from "@/server/services/booking-conflict-service";

// Validation schema for reschedule request
const rescheduleSchema = z.object({
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
  rescheduleReason: z.string().optional(),
});

async function rescheduleBookingHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const startTime = Date.now();
  const { id } = await params;
  const context = {
    operation: "rescheduleBooking",
    path: `/api/bookings/${id}/reschedule`,
    method: "POST",
    appointmentId: id,
  };

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = rescheduleSchema.safeParse(body);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      bookingLogger.logValidationError(
        "reschedule_request",
        body,
        `Validation failed: ${fieldErrors.map((e) => `${e.field}: ${e.message}`).join(", ")}`,
        context,
      );

      throw BookingErrors.validation(
        "Please check your reschedule information",
        "request_body",
        fieldErrors.map((e) => `${e.field}: ${e.message}`),
      );
    }

    const {
      appointmentDate,
      startTime: newStartTime,
      endTime,
      rescheduleReason,
    } = validationResult.data;

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
      bookingLogger.warn("Appointment not found for rescheduling", context);
      throw BookingErrors.appointmentNotFound(id);
    }

    // Check if the booking is cancelled
    if (appointmentData.appointment.status === "cancelled") {
      bookingLogger.warn("Attempt to reschedule cancelled booking", {
        ...context,
        currentStatus: appointmentData.appointment.status,
      });
      throw BookingErrors.validation(
        "Cannot reschedule a cancelled booking",
        "status",
        ["Please create a new booking instead"],
      );
    }

    // Check if the booking is in the past
    const currentAppointmentDate = new Date(
      `${appointmentData.appointment.appointmentDate}T${appointmentData.appointment.startTime}:00`,
    );
    if (currentAppointmentDate < new Date()) {
      bookingLogger.warn("Attempt to reschedule past booking", {
        ...context,
        currentAppointmentDate: currentAppointmentDate.toISOString(),
      });
      throw BookingErrors.pastAppointment();
    }

    // Check if the new appointment time is in the past
    const newAppointmentDate = new Date(
      `${appointmentDate}T${newStartTime}:00`,
    );
    if (newAppointmentDate < new Date()) {
      bookingLogger.warn("Attempt to reschedule to past date", {
        ...context,
        newAppointmentDate: newAppointmentDate.toISOString(),
      });
      throw BookingErrors.pastAppointment();
    }

    // Check if the new appointment time is available
    const conflictValidationResult =
      await bookingConflictService.validateBookingRequest({
        businessId: appointmentData.business.id,
        serviceId: appointmentData.service.id,
        appointmentDate,
        startTime: newStartTime,
        excludeAppointmentId: id, // Exclude current appointment from conflict check
      });

    if (!conflictValidationResult.isAvailable) {
      const suggestions = [];
      if (conflictValidationResult.suggestions?.nextAvailableSlot) {
        suggestions.push(
          `Next available slot: ${conflictValidationResult.suggestions.nextAvailableSlot.date} at ${conflictValidationResult.suggestions.nextAvailableSlot.startTime}`,
        );
      }
      suggestions.push("Please select a different date or time");

      bookingLogger.logConflictDetection(
        "reschedule_conflict",
        false,
        {
          ...context,
          businessId: appointmentData.business.id,
          serviceId: appointmentData.service.id,
          appointmentDate,
          startTime: newStartTime,
        },
        { conflicts: conflictValidationResult.conflicts },
      );

      throw BookingErrors.conflict(
        conflictValidationResult.conflicts.join("; "),
        suggestions,
      );
    }

    // Update the appointment with new date and time
    await db
      .update(appointments)
      .set({
        appointmentDate: appointmentDate,
        startTime: newStartTime,
        endTime,
        notes: rescheduleReason
          ? `${appointmentData.appointment.notes ?? ""}\n\nReschedule reason: ${rescheduleReason}`.trim()
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
        startTime: newStartTime,
        endTime,
      };

      const businessForNotification = {
        ...appointmentData.business,
        slug: appointmentData.business.name.toLowerCase().replace(/\s+/g, "-"),
        userId: appointmentData.business.ownerId,
      };

      // Send notifications asynchronously (don't block the response)
      Promise.allSettled([
        notificationService.sendBookingNotificationToBusiness(
          updatedAppointment,
          appointmentData.service,
          businessForNotification,
        ),
        notificationService.sendBookingRescheduledToCustomer(
          updatedAppointment,
          appointmentData.service,
          businessForNotification,
        ),
      ])
        .then((results) => {
          results.forEach((result, index) => {
            const notificationType = index === 0 ? "business" : "customer";
            if (result.status === "rejected") {
              console.error(
                `Failed to send ${notificationType} notification:`,
                result.reason,
              );
            } else {
              console.log(`${notificationType} notification sent successfully`);
            }
          });
        })
        .catch((error) => {
          console.error("Error in notification promises:", error);
        });

      bookingLogger.info("Reschedule notifications sent successfully", {
        ...context,
        customerEmail: appointmentData.appointment.customerEmail,
        newAppointmentDate: appointmentDate,
        newStartTime,
      });
    } catch (notificationError) {
      bookingLogger.warn(
        "Failed to send reschedule notifications",
        {
          ...context,
          customerEmail: appointmentData.appointment.customerEmail,
        },
        {
          error:
            notificationError instanceof Error
              ? notificationError.message
              : String(notificationError),
        },
      );
      // Continue with the rescheduling even if notifications fail
    }

    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation(
      "rescheduleBooking",
      true,
      duration,
      context,
    );

    return NextResponse.json({
      message: "Booking rescheduled successfully",
      id: appointmentData.appointment.id,
      newDate: appointmentDate,
      newTime: newStartTime,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const bookingError = toBookingError(error);

    bookingLogger.logBookingOperation(
      "rescheduleBooking",
      false,
      duration,
      context,
      bookingError,
    );

    throw bookingError;
  }
}

export const POST = withErrorHandler(rescheduleBookingHandler);
