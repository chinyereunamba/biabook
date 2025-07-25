import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  appointments,
  services,
  availabilityExceptions,
  weeklyAvailability,
} from "@/server/db/schema";
import type {
  Appointment,
  AppointmentDetailWithDate,
  AppointmentWithDetails,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "@/types/booking";
// import { notificationService } from "@/server/notifications/notification-service";
import { notificationScheduler } from "@/server/notifications/notification-scheduler";
import {
  getDayOfWeekFromDate,
  timeStringToMinutes,
  // isValidDateFormat,
} from "./utils/availability-validation";
// import { bookingConflictService } from "@/server/services/booking-conflict-service";
import { BookingErrors } from "@/server/errors/booking-errors";
import { bookingLogger, logExecution } from "@/server/logging/booking-logger";

function toAppointmentWithDetails(
  result: AppointmentDetailWithDate | undefined | null,
): AppointmentWithDetails | null {
  if (!result) {
    return null;
  }

  const { business, service, ...appointment } = result;

  return {
    ...appointment,
    appointmentDate: new Date(appointment.appointmentDate),
    business: {
      ...business,
      slug: business.name.toLowerCase().replace(/ /g, "-"),
      ownerId: business.ownerId,
    },
    service,
  };
}

/**
 * Repository for appointment CRUD operations
 * Handles database interactions for appointments
 */
export class AppointmentRepository {
  /**
   * Create a new appointment
   * @param data Appointment data
   * @returns The created appointment
   */
  @logExecution("create_appointment")
  async create(data: CreateAppointmentInput): Promise<Appointment> {
    // Use a transaction to ensure atomicity and prevent race conditions
    const result = await db.transaction(async (tx) => {
      // Get the service to calculate end time
      const service = await tx.query.services.findFirst({
        where: eq(services.id, data.serviceId),
      });

      if (!service) {
        bookingLogger.error(`Service not found`, undefined, {
          serviceId: data.serviceId,
        });
        throw BookingErrors.serviceNotFound(data.serviceId);
      }

      // Calculate end time based on service duration
      const [hours, minutes] = data.startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);

      const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

      // Check for booking conflicts using Drizzle ORM
      const conflicts = await tx
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.businessId, data.businessId),
            eq(appointments.appointmentDate, data.appointmentDate),
            inArray(appointments.status, ["pending", "confirmed"]),
            sql`(
              (${appointments.startTime} < ${endTime} AND ${appointments.endTime} > ${data.startTime}) OR
              (${appointments.startTime} = ${data.startTime} AND ${appointments.endTime} = ${endTime})
            )`,
          ),
        );

      if (conflicts.length > 0) {
        bookingLogger.logConflictDetection("time_slot_conflict", false, {
          businessId: data.businessId,
          appointmentDate: data.appointmentDate,
          startTime: data.startTime,
        });
        throw BookingErrors.conflict("This time slot is no longer available");
      }

      // Verify the time slot is within business availability
      const dayOfWeek = getDayOfWeekFromDate(data.appointmentDate);
      if (dayOfWeek === -1) {
        bookingLogger.logValidationError(
          "appointmentDate",
          data.appointmentDate,
          "Invalid date format",
        );
        throw BookingErrors.validation(
          "Invalid appointment date",
          "appointmentDate",
        );
      }

      // Check for availability exception
      const exception = await tx.query.availabilityExceptions.findFirst({
        where: and(
          eq(availabilityExceptions.businessId, data.businessId),
          eq(availabilityExceptions.date, data.appointmentDate),
        ),
      });

      // If there's an exception and it's marked as unavailable, reject the booking
      if (exception && !exception.isAvailable) {
        bookingLogger.logConflictDetection("business_unavailable_date", false, {
          businessId: data.businessId,
          appointmentDate: data.appointmentDate,
          reason: exception.reason ?? "Business closed",
        });
        throw BookingErrors.businessUnavailable(
          exception.reason ?? "Business is not available on this date",
        );
      }

      // Check weekly availability if no exception or exception is available
      if (!exception || exception.isAvailable) {
        const weeklyAvail = await tx.query.weeklyAvailability.findFirst({
          where: and(
            eq(weeklyAvailability.businessId, data.businessId),
            eq(weeklyAvailability.dayOfWeek, dayOfWeek),
            eq(weeklyAvailability.isAvailable, true),
          ),
        });

        if (!weeklyAvail) {
          bookingLogger.logConflictDetection(
            "business_unavailable_day",
            false,
            {
              businessId: data.businessId,
              appointmentDate: data.appointmentDate,
              dayOfWeek,
            },
          );
          throw BookingErrors.businessUnavailable(
            `Business is not available on ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek]}`,
          );
        }

        // Check if appointment time is within business hours
        const startTimeMinutes = timeStringToMinutes(data.startTime);
        const endTimeMinutes = timeStringToMinutes(endTime);
        const businessStartMinutes = timeStringToMinutes(weeklyAvail.startTime);
        const businessEndMinutes = timeStringToMinutes(weeklyAvail.endTime);

        if (
          startTimeMinutes < businessStartMinutes ||
          endTimeMinutes > businessEndMinutes
        ) {
          const businessHours = `${weeklyAvail.startTime} - ${weeklyAvail.endTime}`;
          bookingLogger.logConflictDetection("outside_business_hours", false, {
            businessId: data.businessId,
            appointmentDate: data.appointmentDate,
            startTime: data.startTime,
            endTime,
            businessHours,
          });
          throw BookingErrors.outsideBusinessHours(businessHours);
        }
      }

      // Create the appointment
      const [appointment] = await tx
        .insert(appointments)
        .values({
          businessId: data.businessId,
          serviceId: data.serviceId,
          servicePrice: service.price,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          appointmentDate: data.appointmentDate,
          startTime: data.startTime,
          endTime: endTime,
          notes: data.notes ?? null,
          status: "pending",
          version: 1, // Initialize version for optimistic locking
        })
        .returning();

      if (!appointment) {
        bookingLogger.error("Failed to create appointment", undefined, {
          data,
        });
        throw BookingErrors.database("Failed to create appointment");
      }

      return {
        ...appointment,
        appointmentDate: new Date(appointment.appointmentDate),
      };
    });
    return result;
  }

  /**
   * Get an appointment by ID
   * @param id Appointment ID
   * @returns The appointment with business and service details
   */
  async getById(id: string): Promise<AppointmentWithDetails | null> {
    const result = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        business: true,
        service: true,
      },
    });

    return toAppointmentWithDetails(result);
  }

  /**
   * Get an appointment by confirmation number
   * @param confirmationNumber Appointment confirmation number
   * @returns The appointment with business and service details
   */
  async getByConfirmationNumber(
    confirmationNumber: string,
  ): Promise<AppointmentWithDetails | null> {
    const result = await db.query.appointments.findFirst({
      where: eq(appointments.confirmationNumber, confirmationNumber),
      with: {
        business: true,
        service: true,
      },
    });

    return toAppointmentWithDetails(result);
  }

  /**
   * Get appointments for a business with optional filtering
   * @param businessId Business ID
   * @param options Filter options
   * @returns List of appointments with details
   */
  async getByBusiness(
    businessId: string,
    options: {
      status?: Appointment["status"] | Appointment["status"][];
      from?: string;
      to?: string;
      search?: string;
      limit?: number;
      offset?: number;
      sortBy?: "date" | "created";
      sortDirection?: "asc" | "desc";
    } = {},
  ): Promise<{ appointments: AppointmentWithDetails[]; total: number }> {
    const {
      status,
      from,
      to,
      search,
      limit = 20,
      offset = 0,
      sortBy = "date",
      sortDirection = "desc",
    } = options;

    // Build the where conditions
    const whereConditions = [eq(appointments.businessId, businessId)];

    if (status) {
      if (Array.isArray(status)) {
        whereConditions.push(inArray(appointments.status, status));
      } else {
        whereConditions.push(eq(appointments.status, status));
      }
    }

    if (from) {
      whereConditions.push(gte(appointments.appointmentDate, from));
    }

    if (to) {
      whereConditions.push(lt(appointments.appointmentDate, to));
    }

    if (search) {
      whereConditions.push(
        sql`(${appointments.customerName} LIKE ${`%${search}%`} OR 
             ${appointments.customerEmail} LIKE ${`%${search}%`} OR 
             ${appointments.customerPhone} LIKE ${`%${search}%`} OR 
             ${appointments.confirmationNumber} LIKE ${`%${search}%`})`,
      );
    }

    // Count total matching appointments
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(...whereConditions));

    const count = countResult[0]?.count ?? 0;

    // Build the order by clause
    let orderBy;
    if (sortBy === "date") {
      orderBy =
        sortDirection === "asc"
          ? [asc(appointments.appointmentDate), asc(appointments.startTime)]
          : [desc(appointments.appointmentDate), desc(appointments.startTime)];
    } else {
      orderBy =
        sortDirection === "asc"
          ? [asc(appointments.createdAt)]
          : [desc(appointments.createdAt)];
    }

    // Get the appointments with pagination
    const results = await db.query.appointments.findMany({
      where: and(...whereConditions),
      with: {
        business: true,
        service: true,
      },
      limit,
      offset,
      orderBy,
    });

    return {
      appointments: results
        .map(toAppointmentWithDetails)
        .filter(Boolean) as AppointmentWithDetails[],
      total: Number(count),
    };
  }

  /**
   * Get today's appointments for a business
   * @param businessId Business ID
   * @returns List of today's appointments
   */
  async getTodayAppointments(
    businessId: string,
  ): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split("T")[0] ?? ""; // YYYY-MM-DD format

    const results = await db.query.appointments.findMany({
      where: and(
        eq(appointments.businessId, businessId),
        eq(appointments.appointmentDate, today),
        inArray(appointments.status, ["pending", "confirmed"]),
      ),
      with: {
        business: true,
        service: true,
      },
      orderBy: [asc(appointments.startTime)],
    });

    return results
      .map(toAppointmentWithDetails)
      .filter(Boolean) as AppointmentWithDetails[];
  }

  /**
   * Update an appointment
   * @param id Appointment ID
   * @param data Update data
   * @param expectedVersion Optional version for optimistic locking
   * @returns The updated appointment
   */
  async update(
    id: string,
    data: UpdateAppointmentInput,
    expectedVersion?: number,
  ): Promise<Appointment> {
    // Get the appointment with details before updating
    const appointmentWithDetails = await this.getById(id);

    if (!appointmentWithDetails) {
      throw new Error(`Appointment with ID ${id} not found`);
    }

    const appointment = appointmentWithDetails;

    // Implement optimistic locking
    if (
      expectedVersion !== 0 &&
      appointment.version !== expectedVersion
    ) {
      bookingLogger.logConflictDetection("optimistic_lock", false, {
        appointmentId: id,
        expectedVersion,
        actualVersion: appointment.version,
      });
      throw BookingErrors.optimisticLock();
    }

    let endTime = appointment.endTime;
    let isRescheduled = false;

    // If changing date or time, recalculate end time and check for conflicts
    if (data.appointmentDate ?? data.startTime) {
      isRescheduled = true;
      const service = await db.query.services.findFirst({
        where: eq(services.id, appointment.serviceId),
      });

      if (!service) {
        throw new Error(`Service with ID ${appointment.serviceId} not found`);
      }

      const newStartTime = data.startTime ?? appointment.startTime;
      const [hours, minutes] = newStartTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);

      endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

      // Check for booking conflicts (excluding this appointment)
      const conflicts = await this.checkForConflicts(
        appointment.businessId,
        data.appointmentDate?.toString() ?? appointment?.appointmentDate.toString(),
        newStartTime,
        endTime,
        id,
      );

      if (conflicts.length > 0) {
        throw new Error("This time slot is no longer available");
      }
    }

    // Update the appointment with version increment
    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        appointmentDate: data.appointmentDate?.toString() ?? appointment.appointmentDate.toString(),
        startTime: data.startTime ?? appointment.startTime,
        endTime: endTime,
        status: data.status ?? appointment.status,
        notes: data.notes !== undefined ? data.notes : appointment.notes,
        // version: appointment?.version + 1, // Increment version for optimistic locking
        updatedAt: new Date(),
      })
      .where(
        expectedVersion !== undefined
          ? and(
              eq(appointments.id, id),
              eq(appointments.version, expectedVersion),
            )
          : eq(appointments.id, id),
      )
      .returning();

    if (!updatedAppointment) {
      throw new Error("Failed to update appointment");
    }

    const appointmentForScheduler = {
      ...updatedAppointment,
      appointmentDate: new Date(updatedAppointment.appointmentDate),
    };

    // Schedule notifications based on the update
    try {
      // If the appointment was rescheduled, schedule notifications
      if (isRescheduled) {
        await notificationScheduler.scheduleBookingRescheduled(
          appointmentForScheduler,
          appointmentWithDetails.service,
          appointmentWithDetails.business,
        );

        // Also schedule new reminders for the rescheduled appointment
        await notificationScheduler.scheduleBookingReminders(
          appointmentForScheduler,
          appointmentWithDetails.service,
          appointmentWithDetails.business,
        );
      }

      // If status changed to cancelled, schedule cancellation notifications
      if (data.status === "cancelled" && appointment.status !== "cancelled") {
        await notificationScheduler.scheduleBookingCancellation(
          appointmentForScheduler,
          appointmentWithDetails.service,
          appointmentWithDetails.business,
        );
      }
    } catch (error) {
      console.error(
        "Failed to schedule notifications for appointment update:",
        error,
      );
      // Don't fail the update if notification scheduling fails
    }

    return {
      ...updatedAppointment,
      appointmentDate: new Date(updatedAppointment.appointmentDate),
    };
  }

  /**
   * Update appointment status
   * @param id Appointment ID
   * @param status New status
   * @returns The updated appointment
   */
  async updateStatus(
    id: string,
    status: Appointment["status"],
  ): Promise<Appointment> {
    // Get the appointment with details before updating
    const appointmentWithDetails = await this.getById(id);

    if (!appointmentWithDetails) {
      throw new Error(`Appointment with ID ${id} not found`);
    }

    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    if (!updatedAppointment) {
      throw new Error(`Failed to update appointment status`);
    }

    const appointmentForScheduler = {
      ...updatedAppointment,
      appointmentDate: new Date(updatedAppointment.appointmentDate),
    };

    // Schedule notifications based on the status change
    try {
      if (
        status === "cancelled" &&
        appointmentWithDetails.status !== "cancelled"
      ) {
        // Schedule cancellation notifications
        await notificationScheduler.scheduleBookingCancellation(
          appointmentForScheduler,
          appointmentWithDetails.service,
          appointmentWithDetails.business,
        );
      } else if (
        status === "confirmed" &&
        appointmentWithDetails.status === "pending"
      ) {
        // Schedule confirmation and reminder notifications
        await notificationScheduler.scheduleBookingConfirmation(
          appointmentForScheduler,
          appointmentWithDetails.service,
          appointmentWithDetails.business,
        );

        await notificationScheduler.scheduleBookingReminders(
          appointmentForScheduler,
          appointmentWithDetails.service,
          appointmentWithDetails.business,
        );
      }
    } catch (error) {
      console.error(
        "Failed to schedule notifications for status update:",
        error,
      );
      // Don't fail the status update if notification scheduling fails
    }

    return {
      ...updatedAppointment,
      appointmentDate: new Date(updatedAppointment.appointmentDate),
    };
  }

  /**
   * Delete an appointment
   * @param id Appointment ID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(appointments)
      .where(eq(appointments.id, id))
      .returning({ id: appointments.id });

    return result.length > 0;
  }

  /**
   * Check for booking conflicts
   * @param businessId Business ID
   * @param date Appointment date
   * @param startTime Start time
   *.
   * @param endTime End time
   * @param excludeAppointmentId Optional appointment ID to exclude from conflict check
   * @returns List of conflicting appointments
   */
  async checkForConflicts(
    businessId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<Appointment[]> {
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

    const results = await db
      .select()
      .from(appointments)
      .where(and(...whereConditions));

    return results.map((r) => ({ ...r, appointmentDate: new Date(r.appointmentDate) }));
  }

  /**
   * Get upcoming appointments for a customer by email
   * @param email Customer email
   * @returns List of upcoming appointments
   */
  async getUpcomingByCustomerEmail(
    email: string,
  ): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split("T")[0] ?? ""; // YYYY-MM-DD format

    const results = await db.query.appointments.findMany({
      where: and(
        eq(appointments.customerEmail, email),
        gte(appointments.appointmentDate, today),
        inArray(appointments.status, ["pending", "confirmed"]),
      ),
      with: {
        business: true,
        service: true,
      },
      orderBy: [asc(appointments.appointmentDate), asc(appointments.startTime)],
    });

    return results
      .map(toAppointmentWithDetails)
      .filter(Boolean) as AppointmentWithDetails[];
  }

  /**
   * Get appointments statistics for a business
   * @param businessId Business ID
   * @param period Period to get stats for ("today", "week", "month", "all")
   * @returns Appointment statistics
   */
  async getStats(
    businessId: string,
    period: "today" | "week" | "month" | "all" = "all",
  ): Promise<{
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    confirmed: number;
  }> {
    const today = new Date().toISOString().split("T")[0] ?? ""; // YYYY-MM-DD format

    let dateFilter;
    if (period === "today") {
      dateFilter = eq(appointments.appointmentDate, today);
    } else if (period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0] ?? "";
      dateFilter = gte(appointments.appointmentDate, weekAgoStr);
    } else if (period === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthAgoStr = monthAgo.toISOString().split("T")[0] ?? "";
      dateFilter = gte(appointments.appointmentDate, monthAgoStr);
    }

    const whereConditions = [eq(appointments.businessId, businessId)];
    if (dateFilter) {
      whereConditions.push(dateFilter);
    }

    const results = await db
      .select({
        status: appointments.status,
        count: sql<number>`count(*)`,
      })
      .from(appointments)
      .where(and(...whereConditions))
      .groupBy(appointments.status);

    const stats = {
      total: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      confirmed: 0,
    };

    results.forEach((result) => {
      const count = Number(result.count);
      stats.total += count;
      if (result.status) {
        stats[result.status as keyof typeof stats] += count;
      }
    });

    return stats;
  }
}

// Export a singleton instance
export const appointmentRepository = new AppointmentRepository();