/**
 * Repository for timezone-related database operations
 */

import { db } from "@/server/db";
import { businessLocations, appointments } from "@/server/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { isValidTimezone } from "@/lib/location-validation";
import { LocationError, LocationErrorCode } from "@/types/location";

/**
 * Business timezone information
 */
export interface BusinessTimezone {
  businessId: string;
  timezone: string;
  updatedAt: Date;
}

/**
 * Appointment timezone update result
 */
export interface AppointmentTimezoneUpdate {
  appointmentId: string;
  oldTimezone: string;
  newTimezone: string;
  updatedAt: Date;
}

/**
 * Repository for timezone operations
 */
export class TimezoneRepository {
  /**
   * Gets business timezone
   */
  async getBusinessTimezone(businessId: string): Promise<string | null> {
    try {
      const result = await db
        .select({ timezone: businessLocations.timezone })
        .from(businessLocations)
        .where(eq(businessLocations.businessId, businessId))
        .limit(1);

      return result[0]?.timezone || null;
    } catch (error) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to get business timezone: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  /**
   * Updates business timezone
   */
  async updateBusinessTimezone(
    businessId: string,
    timezone: string,
  ): Promise<BusinessTimezone> {
    if (!isValidTimezone(timezone)) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Invalid timezone: ${timezone}`,
        "Please provide a valid timezone",
      );
    }

    try {
      const now = new Date();

      await db
        .update(businessLocations)
        .set({
          timezone,
          updatedAt: now,
        })
        .where(eq(businessLocations.businessId, businessId));

      return {
        businessId,
        timezone,
        updatedAt: now,
      };
    } catch (error) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to update business timezone: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  /**
   * Gets all future appointments for a business
   */
  async getFutureAppointments(businessId: string): Promise<
    Array<{
      id: string;
      appointmentDate: string;
      startTime: string;
      endTime: string;
      customerName: string;
      customerEmail: string;
      status: string;
    }>
  > {
    try {
      const today = new Date().toISOString().split("T")[0]!;

      const result = await db
        .select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          customerName: appointments.customerName,
          customerEmail: appointments.customerEmail,
          status: appointments.status,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.businessId, businessId),
            gte(appointments.appointmentDate, today),
            // Only get non-cancelled appointments
            eq(appointments.status, "pending") ||
              eq(appointments.status, "confirmed"),
          ),
        );

      return result;
    } catch (error) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to get future appointments: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  /**
   * Logs timezone change for audit purposes
   */
  async logTimezoneChange(
    businessId: string,
    oldTimezone: string,
    newTimezone: string,
    affectedAppointments: number,
  ): Promise<void> {
    try {
      // In a production system, you might want to store this in a dedicated audit log table
      console.log(`Timezone change logged:`, {
        businessId,
        oldTimezone,
        newTimezone,
        affectedAppointments,
        timestamp: new Date().toISOString(),
      });

      // For now, we'll just log to console
      // In production, you might want to:
      // 1. Store in an audit log table
      // 2. Send notifications to affected customers
      // 3. Update any cached data
      // 4. Trigger webhook notifications
    } catch (error) {
      // Don't throw errors for logging failures
      console.error("Failed to log timezone change:", error);
    }
  }

  /**
   * Gets businesses that need timezone updates (have null or invalid timezones)
   */
  async getBusinessesNeedingTimezoneUpdate(): Promise<
    Array<{
      businessId: string;
      latitude: number;
      longitude: number;
      currentTimezone: string | null;
    }>
  > {
    try {
      const result = await db
        .select({
          businessId: businessLocations.businessId,
          latitude: businessLocations.latitude,
          longitude: businessLocations.longitude,
          currentTimezone: businessLocations.timezone,
        })
        .from(businessLocations);

      // Filter for businesses with invalid or missing timezones
      return result.filter(
        (business) =>
          !business.currentTimezone ||
          !isValidTimezone(business.currentTimezone),
      );
    } catch (error) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to get businesses needing timezone update: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  /**
   * Bulk update timezones for multiple businesses
   */
  async bulkUpdateTimezones(
    updates: Array<{ businessId: string; timezone: string }>,
  ): Promise<number> {
    let updatedCount = 0;

    try {
      for (const update of updates) {
        if (!isValidTimezone(update.timezone)) {
          console.warn(
            `Skipping invalid timezone for business ${update.businessId}: ${update.timezone}`,
          );
          continue;
        }

        await this.updateBusinessTimezone(update.businessId, update.timezone);
        updatedCount++;
      }

      return updatedCount;
    } catch (error) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to bulk update timezones: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  /**
   * Validates all business timezones in the database
   */
  async validateAllBusinessTimezones(): Promise<{
    valid: number;
    invalid: Array<{ businessId: string; timezone: string }>;
  }> {
    try {
      const allBusinesses = await db
        .select({
          businessId: businessLocations.businessId,
          timezone: businessLocations.timezone,
        })
        .from(businessLocations);

      const invalid: Array<{ businessId: string; timezone: string }> = [];
      let valid = 0;

      for (const business of allBusinesses) {
        if (isValidTimezone(business.timezone)) {
          valid++;
        } else {
          invalid.push({
            businessId: business.businessId,
            timezone: business.timezone,
          });
        }
      }

      return { valid, invalid };
    } catch (error) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to validate business timezones: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }
}

// Export singleton instance
export const timezoneRepository = new TimezoneRepository();
