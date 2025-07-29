import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingConflictService } from "@/server/services/booking-conflict-service";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors, toBookingError } from "@/server/errors/booking-errors";
import { bookingLogger } from "@/server/logging/booking-logger";

// Validation schema for availability check
const availabilityCheckSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  excludeAppointmentId: z.string().optional(),
});

async function checkAvailabilityHandler(request: NextRequest) {
  const startTime = Date.now();
  const context = {
    operation: "checkAvailability",
    path: "/api/availability/check",
    method: "POST",
  };

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = availabilityCheckSchema.safeParse(body);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      bookingLogger.logValidationError(
        "availability_check_request",
        body,
        `Validation failed: ${fieldErrors.map((e) => `${e.field}: ${e.message}`).join(", ")}`,
        context,
      );

      throw BookingErrors.validation(
        "Please check your availability request",
        "request_body",
        fieldErrors.map((e) => `${e.field}: ${e.message}`),
      );
    }

    const {
      businessId,
      serviceId,
      appointmentDate,
      startTime: requestedStartTime,
      excludeAppointmentId,
    } = validationResult.data;

    // Check availability using the booking conflict service
    const availabilityResult =
      await bookingConflictService.validateBookingRequest({
        businessId,
        serviceId,
        appointmentDate,
        startTime: requestedStartTime,
        excludeAppointmentId,
      });

    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation("checkAvailability", true, duration, {
      ...context,
      businessId,
      serviceId,
      appointmentDate,
      startTime: requestedStartTime,
      available: availabilityResult.isAvailable,
    });

    const response = {
      available: availabilityResult.isAvailable,
      conflicts: availabilityResult.conflicts,
      suggestions: availabilityResult.suggestions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;
    const bookingError = toBookingError(error);

    bookingLogger.logBookingOperation(
      "checkAvailability",
      false,
      duration,
      context,
      bookingError,
    );

    throw bookingError;
  }
}

async function checkAvailabilityGetHandler(request: NextRequest) {
  const startTime = Date.now();
  const context = {
    operation: "checkAvailability",
    path: "/api/availability/check",
    method: "GET",
  };

  try {
    const { searchParams } = new URL(request.url);

    const queryData = {
      businessId: searchParams.get("businessId") ?? "",
      serviceId: searchParams.get("serviceId") ?? "",
      appointmentDate: searchParams.get("appointmentDate") ?? "",
      startTime: searchParams.get("startTime") ?? "",
      excludeAppointmentId:
        searchParams.get("excludeAppointmentId") ?? undefined,
    };

    // Validate query parameters
    const validationResult = availabilityCheckSchema.safeParse(queryData);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      bookingLogger.logValidationError(
        "availability_check_query",
        queryData,
        `Validation failed: ${fieldErrors.map((e) => `${e.field}: ${e.message}`).join(", ")}`,
        context,
      );

      throw BookingErrors.validation(
        "Please check your availability request parameters",
        "query_params",
        fieldErrors.map((e) => `${e.field}: ${e.message}`),
      );
    }

    const {
      businessId,
      serviceId,
      appointmentDate,
      startTime: requestedStartTime,
      excludeAppointmentId,
    } = validationResult.data;

    // Check availability using the booking conflict service
    const availabilityResult =
      await bookingConflictService.validateBookingRequest({
        businessId,
        serviceId,
        appointmentDate,
        startTime: requestedStartTime,
        excludeAppointmentId,
      });

    const duration = Date.now() - startTime;
    bookingLogger.logBookingOperation("checkAvailability", true, duration, {
      ...context,
      businessId,
      serviceId,
      appointmentDate,
      startTime: requestedStartTime,
      available: availabilityResult.isAvailable,
    });

    const response = {
      available: availabilityResult.isAvailable,
      conflicts: availabilityResult.conflicts,
      suggestions: availabilityResult.suggestions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;
    const bookingError = toBookingError(error);

    bookingLogger.logBookingOperation(
      "checkAvailability",
      false,
      duration,
      context,
      bookingError,
    );

    throw bookingError;
  }
}

export const POST = withErrorHandler(checkAvailabilityHandler);
export const GET = withErrorHandler(checkAvailabilityGetHandler);
