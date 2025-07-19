import { and, asc, desc, eq, gte, inArray, like, lt, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { appointments, services, businesses } from "@/server/db/schema";
import type {
  Appointment,
  AppointmentWithDetails,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "@/types/booking";

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
  async create(data: CreateAppointmentInput): Promise<Appointment> {
    // Get the service to calculate end time
    const service = await db.query.services.findFirst({
      where: eq(services.id, data.serviceId),
    });

    if (!service) {
      throw new Error(`Service with ID ${data.serviceId} not found`);
    }

    // Calculate end time based on service duration
    const [hours, minutes] = data.startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours || 0, minutes || 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + service.duration);

    const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

    // Check for booking conflicts
    const conflicts = await this.checkForConflicts(
      data.businessId,
      data.appointmentDate,
      data.startTime,
      endTime,
    );

    if (conflicts.length > 0) {
      throw new Error("This time slot is no longer available");
    }

    // Create the appointment
    const [appointment] = await db
      .insert(appointments)
      .values({
        businessId: data.businessId,
        serviceId: data.serviceId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        endTime: endTime,
        notes: data.notes || null,
        status: "pending",
      })
      .returning();

    if (!appointment) {
      throw new Error("Failed to create appointment");
    }

    return appointment;
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

    return result as AppointmentWithDetails | null;
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

    return result as AppointmentWithDetails | null;
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
      appointments: results as AppointmentWithDetails[],
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
    const today = new Date().toISOString().split("T")[0] || ""; // YYYY-MM-DD format

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

    return results as AppointmentWithDetails[];
  }

  /**
   * Update an appointment
   * @param id Appointment ID
   * @param data Update data
   * @returns The updated appointment
   */
  async update(id: string, data: UpdateAppointmentInput): Promise<Appointment> {
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
    });

    if (!appointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }

    let endTime = appointment.endTime;

    // If changing date or time, recalculate end time and check for conflicts
    if (data.appointmentDate || data.startTime) {
      const service = await db.query.services.findFirst({
        where: eq(services.id, appointment.serviceId),
      });

      if (!service) {
        throw new Error(`Service with ID ${appointment.serviceId} not found`);
      }

      const newStartTime = data.startTime || appointment.startTime;
      const [hours, minutes] = newStartTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours || 0, minutes || 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);

      endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

      // Check for booking conflicts (excluding this appointment)
      const conflicts = await this.checkForConflicts(
        appointment.businessId,
        data.appointmentDate || appointment.appointmentDate,
        newStartTime,
        endTime,
        id,
      );

      if (conflicts.length > 0) {
        throw new Error("This time slot is no longer available");
      }
    }

    // Update the appointment
    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        appointmentDate: data.appointmentDate || appointment.appointmentDate,
        startTime: data.startTime || appointment.startTime,
        endTime: endTime,
        status: data.status || appointment.status,
        notes: data.notes !== undefined ? data.notes : appointment.notes,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    if (!updatedAppointment) {
      throw new Error("Failed to update appointment");
    }

    return updatedAppointment;
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
    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    if (!updatedAppointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }

    return updatedAppointment;
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

    return results;
  }

  /**
   * Get upcoming appointments for a customer by email
   * @param email Customer email
   * @returns List of upcoming appointments
   */
  async getUpcomingByCustomerEmail(
    email: string,
  ): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split("T")[0] || ""; // YYYY-MM-DD format

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

    return results as AppointmentWithDetails[];
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
    const today = new Date().toISOString().split("T")[0] || ""; // YYYY-MM-DD format

    let dateFilter;
    if (period === "today") {
      dateFilter = eq(appointments.appointmentDate, today);
    } else if (period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0] || "";
      dateFilter = gte(appointments.appointmentDate, weekAgoStr);
    } else if (period === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthAgoStr = monthAgo.toISOString().split("T")[0] || "";
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
