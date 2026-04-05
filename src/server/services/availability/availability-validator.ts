import {
  getDayOfWeekFromDate,
  timeStringToMinutes,
} from "../../repositories/utils/availability-validation";
import { BookingErrors } from "../../errors/booking-errors";
import { bookingLogger } from "../../logging/booking-logger";

export interface ValidationContext {
  businessId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  conflictingAppointmentsCount: number;
  exception: {
    isAvailable: boolean;
    reason?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  } | null | undefined;
  weeklyAvail: { startTime: string; endTime: string } | null | undefined;
}

/**
 * Pure-ish business logic for validating whether a booking time slot is valid
 * decoupled from database or repository data-fetching implementation details.
 */
export function validateAppointmentAvailability(ctx: ValidationContext): void {
  // Check for booking conflicts
  if (ctx.conflictingAppointmentsCount > 0) {
    bookingLogger.logConflictDetection("time_slot_conflict", false, {
      businessId: ctx.businessId,
      appointmentDate: ctx.appointmentDate,
      startTime: ctx.startTime,
    });
    throw BookingErrors.conflict("This time slot is no longer available");
  }

  // Verify the time slot is within business availability limits (valid string format)
  const dayOfWeek = getDayOfWeekFromDate(ctx.appointmentDate);
  if (dayOfWeek === -1) {
    bookingLogger.logValidationError(
      "appointmentDate",
      ctx.appointmentDate,
      "Invalid date format"
    );
    throw BookingErrors.validation(
      "Invalid appointment date",
      "appointmentDate"
    );
  }

  // If there's an exception and it's marked as totally unavailable, reject the booking
  if (ctx.exception && !ctx.exception.isAvailable) {
    bookingLogger.logConflictDetection("business_unavailable_date", false, {
      businessId: ctx.businessId,
      appointmentDate: ctx.appointmentDate,
      reason: ctx.exception.reason ?? "Business closed",
    });
    throw BookingErrors.businessUnavailable(
      ctx.exception.reason ?? "Business is not available on this date"
    );
  }

  // Check weekly availability if no exception or exception is available
  if (!ctx.exception || ctx.exception.isAvailable) {
    if (!ctx.weeklyAvail) {
      bookingLogger.logConflictDetection("business_unavailable_day", false, {
        businessId: ctx.businessId,
        appointmentDate: ctx.appointmentDate,
        dayOfWeek,
      });
      throw BookingErrors.businessUnavailable(
        `Business is not available on ${
          ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
            dayOfWeek
          ]
        }`
      );
    }

    // Check if appointment time is within business hours
    const startTimeMinutes = timeStringToMinutes(ctx.startTime);
    const endTimeMinutes = timeStringToMinutes(ctx.endTime);

    // If exception has specific hours, use those instead of weekly avail
    const activeStartTime = ctx.exception?.startTime ?? ctx.weeklyAvail.startTime;
    const activeEndTime = ctx.exception?.endTime ?? ctx.weeklyAvail.endTime;

    const businessStartMinutes = timeStringToMinutes(activeStartTime);
    const businessEndMinutes = timeStringToMinutes(activeEndTime);

    if (
      startTimeMinutes < businessStartMinutes ||
      endTimeMinutes > businessEndMinutes
    ) {
      const businessHours = `${activeStartTime} - ${activeEndTime}`;
      bookingLogger.logConflictDetection("outside_business_hours", false, {
        businessId: ctx.businessId,
        appointmentDate: ctx.appointmentDate,
        startTime: ctx.startTime,
        endTime: ctx.endTime,
        businessHours,
      });
      throw BookingErrors.outsideBusinessHours(businessHours);
    }
  }
}
