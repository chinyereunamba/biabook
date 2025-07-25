import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, businesses, services } from "@/server/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { notificationScheduler } from "@/server/notifications/notification-scheduler";
import { bookingConflictService } from "@/server/services/booking-conflict-service";

import { bookingLogger } from "@/server/logging/booking-logger";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors, toBookingError } from "@/server/errors/booking-errors";

// Validation schema for booking creation
const createBookingSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  customerName: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  customerEmail: z
    .string()
    .email("Valid email is required")
    .max(255, "Email is too long"),
  customerPhone: z
    .string()
    .min(1, "Phone number is required")
    .max(50, "Phone number is too long"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
  notes: z.string().optional(),
});

async function createBookingHandler(request: NextRequest) {
  const startTime = Date.now();
  const context = {
    operation: "createBooking",
    path: "/api/bookings",
    method: "POST",
  };

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      bookingLogger.logValidationError(
        "request_body",
        body,
        `Validation failed: ${fieldErrors.map((e) => `${e.field}: ${e.message}`).join(", ")}`,
        context,
      );

      throw BookingErrors.validation(
        "Please check your booking information",
        "request_body",
        fieldErrors.map((e) => `${e.field}: ${e.message}`),
      );
    }

    const {
      businessId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      notes,
    } = validationResult.data;

    // Verify business exists
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
    });

    if (!business) {
      bookingLogger.warn("Business not found", { ...context, businessId });
      throw BookingErrors.businessNotFound(businessId);
    }

    // Verify service exists and belongs to business
    const service = await db.query.services.findFirst({
      where: and(
        eq(services.id, serviceId),
        eq(services.businessId, businessId),
        eq(services.isActive, true),
      ),
    });

    if (!service) {
      bookingLogger.warn("Service not found or inactive", {
        ...context,
        serviceId,
        businessId,
      });
      throw BookingErrors.serviceNotFound(serviceId);
    }

    // Use the booking conflict service for comprehensive validation
    const conflictValidationResult =
      await bookingConflictService.validateBookingRequest({
        businessId,
        serviceId,
        appointmentDate,
        startTime: appointmentStartTime,
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
        "booking_conflict",
        false,
        {
          ...context,
          businessId,
          serviceId,
          appointmentDate,
          startTime: appointmentStartTime,
        },
        { conflicts: conflictValidationResult.conflicts },
      );

      throw BookingErrors.conflict(
        conflictValidationResult.conflicts.join("; "),
        suggestions,
      );
    }

    // Normalize phone number (basic formatting)
    const normalizedPhone = customerPhone.replace(/\D/g, "");

    // Validate phone number length (US format)
    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      bookingLogger.logValidationError(
        "customerPhone",
        customerPhone,
        "Invalid phone number format",
        { ...context, normalizedPhone },
      );
      throw BookingErrors.validation(
        "Invalid phone number format",
        "customerPhone",
        [
          "Phone number must be between 10-15 digits",
          "Example: (555) 123-4567 or +1 555 123 4567",
        ],
      );
    }

    // Create the appointment within a transaction to prevent race conditions
    const [newAppointment] = await db.transaction(async (tx) => {
      // Double-check for conflicts within the transaction
      const conflictingAppointments = await tx
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.businessId, businessId),
            eq(appointments.appointmentDate, appointmentDate),
            inArray(appointments.status, ["pending", "confirmed"]),
            sql`(
              (${appointments.startTime} < ${appointmentEndTime} AND ${appointments.endTime} > ${appointmentStartTime}) OR
              (${appointments.startTime} = ${appointmentStartTime} AND ${appointments.endTime} = ${appointmentEndTime})
            )`,
          ),
        );

      if (conflictingAppointments.length > 0) {
        bookingLogger.logConflictDetection(
          "race_condition_conflict",
          false,
          {
            ...context,
            businessId,
            appointmentDate,
            startTime: appointmentStartTime,
            endTime: appointmentEndTime,
          },
          { conflictingAppointments: conflictingAppointments.length },
        );
        throw BookingErrors.conflict("Time slot is no longer available", [
          "Please refresh the page and select a different time",
          "This can happen when multiple people book at the same time",
        ]);
      }

      // Create the appointment
      return await tx
        .insert(appointments)
        .values({
          businessId,
          serviceId,
          customerName: customerName.trim(),
          customerEmail: customerEmail.toLowerCase().trim(),
          customerPhone: normalizedPhone,
          appointmentDate,
          startTime: appointmentStartTime,
          endTime: appointmentEndTime,
          status: "confirmed",
          notes: notes?.trim(),
          servicePrice: service.price,
        })
        .returning();
    });

    if (!newAppointment) {
      bookingLogger.error(
        "Failed to create appointment - no result from database",
        undefined,
        { ...context, businessId, serviceId },
      );
      throw BookingErrors.database("Failed to create appointment");
    }

    const appointmentForScheduler = {
      ...newAppointment,
      appointmentDate: new Date(newAppointment.appointmentDate),
    };

    const businessForScheduler = {
      ...business,
      slug: business.name.toLowerCase().replace(/ /g, "-"),
      ownerId: business.ownerId,
      description: business.description,
      phone: business.phone,
    };

    // Schedule notifications for the new booking
    try {
      // Schedule confirmation notifications
      await notificationScheduler.scheduleBookingConfirmation(
        appointmentForScheduler,
        service,
        businessForScheduler,
      );

      // Schedule reminder notifications
      await notificationScheduler.scheduleBookingReminders(
        appointmentForScheduler,
        service,
        businessForScheduler,
      );
    } catch (error) {
      bookingLogger.warn(
        "Failed to schedule booking notifications",
        { ...context, appointmentId: newAppointment.id },
        { error: error instanceof Error ? error.message : String(error) },
      );
      // Don't fail the booking creation if notification scheduling fails
    }

    // Return the created appointment with business and service details
    const appointmentWithDetails = {
      ...newAppointment,
      confirmationNumber: newAppointment.confirmationNumber,
      business: {
        id: business.id,
        name: business.name,
        phone: business.phone,
        email: business.email,
        location: business.location,
      },
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
      },
    };

    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation("createBooking", true, duration, {
      ...context,
      appointmentId: newAppointment.id,
    });

    return NextResponse.json(
      {
        appointment: appointmentWithDetails,
        message: "Appointment booked successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const bookingError = toBookingError(error);

    bookingLogger.logBookingOperation(
      "createBooking",
      false,
      duration,
      context,
      bookingError,
    );

    throw bookingError;
  }
}

export const POST = withErrorHandler(createBookingHandler);
