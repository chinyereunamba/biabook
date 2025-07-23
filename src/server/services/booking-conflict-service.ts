import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  appointments,
  services,
  weeklyAvailability,
  availabilityExceptions,
} from "@/server/db/schema";
import {
  getDayOfWeekFromDate,
  timeStringToMinutes,
  isValidDateFormat,
  isValidTimeFormat,
} from "@/server/repositories/utils/availability-validation";
import { BookingErrors, toBookingError } from "@/server/errors/booking-errors";
import { bookingLogger, logExecution } from "@/server/logging/booking-logger";

export interface ConflictCheckResult {
  isAvailable: boolean;
  conflicts: string[];
  suggestions?: {
    nextAvailableSlot?: {
      date: string;
      startTime: string;
      endTime: string;
    };
  };
}

export interface BookingValidationInput {
  businessId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  excludeAppointmentId?: string;
}

/**
 * Service for handling booking conflicts and real-time availability validation
 */
export class BookingConflictService {
  /**
   * Comprehensive validation of a booking request
   */
  @logExecution("validateBookingRequest")
  async validateBookingRequest(
    input: BookingValidationInput,
  ): Promise<ConflictCheckResult> {
    const context = {
      businessId: input.businessId,
      serviceId: input.serviceId,
      appointmentDate: input.appointmentDate,
      startTime: input.startTime
    };

    const conflicts: string[] = [];
    try {

      // Basic input validation
      if (!input.businessId?.trim()) {
        bookingLogger.logValidationError("businessId", input.businessId, "Business ID is required", context);
        conflicts.push("Business ID is required");
      }

      if (!input.serviceId?.trim()) {
        bookingLogger.logValidationError("serviceId", input.serviceId, "Service ID is required", context);
        conflicts.push("Service ID is required");
      }

      if (!isValidDateFormat(input.appointmentDate)) {
        bookingLogger.logValidationError("appointmentDate", input.appointmentDate, "Invalid date format", context);
        conflicts.push("Invalid appointment date format");
      }

      if (!isValidTimeFormat(input.startTime)) {
        bookingLogger.logValidationError("startTime", input.startTime, "Invalid time format", context);
        conflicts.push("Invalid start time format");
      }

      if (conflicts.length > 0) {
        bookingLogger.warn("Booking validation failed due to input errors", context, { conflicts });
        return { isAvailable: false, conflicts };
      }
    } catch (error: unknown) {
      bookingLogger.error("Error validating booking request", error instanceof Error ? error : new Error(String(error)), context);
      throw toBookingError(error);
    }

    // Get service details
    const service = await db.query.services.findFirst({
      where: and(
        eq(services.id, input.serviceId),
        eq(services.businessId, input.businessId),
        eq(services.isActive, true),
      ),
    });

    if (!service) {
      conflicts.push("Service not found or inactive");
      return { isAvailable: false, conflicts };
    }

    // Calculate end time
    const [hours, minutes] = input.startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + service.duration);
    const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

    // Check if appointment is in the past
    const appointmentDateTime = new Date(
      `${input.appointmentDate}T${input.startTime}:00`,
    );
    const now = new Date();
    if (appointmentDateTime <= now) {
      conflicts.push("Cannot book appointments in the past");
    }

    // Check business availability
    const availabilityCheck = await this.checkBusinessAvailability(
      input.businessId,
      input.appointmentDate,
      input.startTime,
      endTime,
    );

    if (!availabilityCheck.isAvailable) {
      conflicts.push(...availabilityCheck.conflicts);
    }

    // Check for appointment conflicts
    const conflictCheck = await this.checkAppointmentConflicts(
      input.businessId,
      input.appointmentDate,
      input.startTime,
      endTime,
      input.excludeAppointmentId,
    );

    if (!conflictCheck.isAvailable) {
      conflicts.push(...conflictCheck.conflicts);
    }

    // If there are conflicts, try to find next available slot
    let suggestions;
    if (conflicts.length > 0) {
      suggestions = await this.findNextAvailableSlot(
        input.businessId,
        input.serviceId,
        input.appointmentDate,
      );
    }

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
      suggestions,
    };
  }

  /**
   * Check if business is available at the specified time
   */
  private async checkBusinessAvailability(
    businessId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<ConflictCheckResult> {
    const conflicts: string[] = [];
    const dayOfWeek = getDayOfWeekFromDate(date);

    if (dayOfWeek === -1) {
      conflicts.push("Invalid appointment date");
      return { isAvailable: false, conflicts };
    }

    // Check for availability exception
    const exception = await db.query.availabilityExceptions.findFirst({
      where: and(
        eq(availabilityExceptions.businessId, businessId),
        eq(availabilityExceptions.date, date),
      ),
    });

    // If there's an exception and it's marked as unavailable
    if (exception && !exception.isAvailable) {
      conflicts.push("Business is closed on this date");
      return { isAvailable: false, conflicts };
    }

    // If there's an exception with specific hours, check against those
    if (
      exception &&
      exception.isAvailable &&
      exception.startTime &&
      exception.endTime
    ) {
      const startTimeMinutes = timeStringToMinutes(startTime);
      const endTimeMinutes = timeStringToMinutes(endTime);
      const exceptionStartMinutes = timeStringToMinutes(exception.startTime);
      const exceptionEndMinutes = timeStringToMinutes(exception.endTime);

      if (
        startTimeMinutes < exceptionStartMinutes ||
        endTimeMinutes > exceptionEndMinutes
      ) {
        conflicts.push("Requested time is outside of business's special hours");
        return { isAvailable: false, conflicts };
      }
    } else {
      // Check weekly availability
      const weeklyAvail = await db.query.weeklyAvailability.findFirst({
        where: and(
          eq(weeklyAvailability.businessId, businessId),
          eq(weeklyAvailability.dayOfWeek, dayOfWeek),
          eq(weeklyAvailability.isAvailable, true),
        ),
      });

      if (!weeklyAvail) {
        conflicts.push("Business is not available on this day of the week");
      } else {
        // Check if appointment time is within business hours
        const startTimeMinutes = timeStringToMinutes(startTime);
        const endTimeMinutes = timeStringToMinutes(endTime);
        const businessStartMinutes = timeStringToMinutes(weeklyAvail.startTime);
        const businessEndMinutes = timeStringToMinutes(weeklyAvail.endTime);

        if (
          startTimeMinutes < businessStartMinutes ||
          endTimeMinutes > businessEndMinutes
        ) {
          conflicts.push(
            `Business hours are ${weeklyAvail.startTime} to ${weeklyAvail.endTime} on this day`,
          );
        }
      }
    }

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
    };
  }

  /**
   * Check for conflicts with existing appointments
   */
  private async checkAppointmentConflicts(
    businessId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<ConflictCheckResult> {
    const conflicts: string[] = [];

    const whereConditions = [
      eq(appointments.businessId, businessId),
      eq(appointments.appointmentDate, date),
      inArray(appointments.status, ["pending", "confirmed"]),
      sql`(
        (${appointments.startTime} < ${endTime} AND ${appointments.endTime} > ${startTime}) OR
        (${appointments.startTime} = ${startTime} AND ${appointments.endTime} = ${endTime})
      )`,
    ];

    if (excludeAppointmentId) {
      whereConditions.push(sql`${appointments.id} != ${excludeAppointmentId}`);
    }

    const conflictingAppointments = await db
      .select({
        id: appointments.id,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        customerName: appointments.customerName,
      })
      .from(appointments)
      .where(and(...whereConditions));

    if (conflictingAppointments.length > 0) {
      conflicts.push("This time slot conflicts with existing appointments");
    }

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
    };
  }

  /**
   * Find the next available slot for a service
   */
  private async findNextAvailableSlot(
    businessId: string,
    serviceId: string,
    fromDate: string,
  ): Promise<{
    nextAvailableSlot?: { date: string; startTime: string; endTime: string };
  }> {
    // This is a simplified implementation - in a real system you'd want to use
    // the availability calculation engine to find the next slot
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return {};
    }

    // Get weekly availability for the business
    const weeklyAvail = await db.query.weeklyAvailability.findMany({
      where: and(
        eq(weeklyAvailability.businessId, businessId),
        eq(weeklyAvailability.isAvailable, true),
      ),
      orderBy: [weeklyAvailability.dayOfWeek],
    });

    if (weeklyAvail.length === 0) {
      return {};
    }

    // Simple logic to find next available day (this could be enhanced)
    const startDate = new Date(fromDate);
    for (let i = 0; i < 30; i++) {
      // Check next 30 days
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + i);
      const dateStr = checkDate.toISOString().split("T")[0];
      const dayOfWeek = checkDate.getDay();

      const dayAvail = weeklyAvail.find((w) => w.dayOfWeek === dayOfWeek);
      if (dayAvail && dateStr) {
        // Check if this day has any appointments
        const existingAppointments = await db
          .select({
            startTime: appointments.startTime,
            endTime: appointments.endTime,
          })
          .from(appointments)
          .where(
            and(
              eq(appointments.businessId, businessId),
              eq(appointments.appointmentDate, dateStr),
              inArray(appointments.status, ["pending", "confirmed"]),
            ),
          );

        // Find first available slot (simplified logic)
        const businessStart = timeStringToMinutes(dayAvail.startTime);
        const businessEnd = timeStringToMinutes(dayAvail.endTime);

        for (
          let time = businessStart;
          time + service.duration <= businessEnd;
          time += 30
        ) {
          const slotStart = `${Math.floor(time / 60)
            .toString()
            .padStart(2, "0")}:${(time % 60).toString().padStart(2, "0")}`;
          const slotEnd = `${Math.floor((time + service.duration) / 60)
            .toString()
            .padStart(
              2,
              "0",
            )}:${((time + service.duration) % 60).toString().padStart(2, "0")}`;

          // Check if this slot conflicts with existing appointments
          const hasConflict = existingAppointments.some((apt) => {
            const aptStart = timeStringToMinutes(apt.startTime);
            const aptEnd = timeStringToMinutes(apt.endTime);
            return time < aptEnd && time + service.duration > aptStart;
          });

          if (!hasConflict) {
            return {
              nextAvailableSlot: {
                date: dateStr,
                startTime: slotStart,
                endTime: slotEnd,
              },
            };
          }
        }
      }
    }

    return {};
  }

  /**
   * Real-time availability check for a specific time slot
   */
  async isTimeSlotAvailable(
    businessId: string,
    serviceId: string,
    appointmentDate: string,
    startTime: string,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const result = await this.validateBookingRequest({
      businessId,
      serviceId,
      appointmentDate,
      startTime,
      excludeAppointmentId,
    });

    return result.isAvailable;
  }

  /**
   * Get all conflicts for a time slot without suggestions
   */
  async getConflicts(
    businessId: string,
    serviceId: string,
    appointmentDate: string,
    startTime: string,
    excludeAppointmentId?: string,
  ): Promise<string[]> {
    const result = await this.validateBookingRequest({
      businessId,
      serviceId,
      appointmentDate,
      startTime,
      excludeAppointmentId,
    });

    return result.conflicts;
  }
}

// Export singleton instance
export const bookingConflictService = new BookingConflictService();
