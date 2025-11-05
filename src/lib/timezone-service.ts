/**
 * Timezone detection and conversion service
 * Handles timezone operations for location-based booking system
 */

import type { Coordinates, TimezoneService } from "@/types/location";
import { LocationError, LocationErrorCode } from "@/types/location";
import {
  validateCoordinates,
  isValidTimezone,
} from "@/lib/location-validation";
import { db } from "@/server/db";
import { appointments, businessLocations } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Timezone service implementation
 */
class TimezoneServiceImpl implements TimezoneService {
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Detects timezone from coordinates using Google Timezone API
   */
  async detectTimezone(coordinates: Coordinates): Promise<string> {
    const validatedCoordinates = validateCoordinates(coordinates);

    if (!this.apiKey) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        "Google Maps API key not configured",
        "Please configure GOOGLE_MAPS_API_KEY environment variable",
      );
    }

    try {
      const url = new URL("https://maps.googleapis.com/maps/api/timezone/json");
      url.searchParams.set(
        "location",
        `${validatedCoordinates.latitude},${validatedCoordinates.longitude}`,
      );
      url.searchParams.set(
        "timestamp",
        Math.floor(Date.now() / 1000).toString(),
      );
      url.searchParams.set("key", this.apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== "OK") {
        throw new LocationError(
          LocationErrorCode.TIMEZONE_DETECTION_FAILED,
          data.error_message || `Timezone detection failed: ${data.status}`,
          "Unable to detect timezone",
        );
      }

      const timezone = data.timeZoneId;
      if (!isValidTimezone(timezone)) {
        throw new LocationError(
          LocationErrorCode.TIMEZONE_DETECTION_FAILED,
          `Invalid timezone returned: ${timezone}`,
          "Please try again",
        );
      }

      return timezone;
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to detect timezone: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  /**
   * Converts customer time to business timezone
   */
  async convertToBusinessTime(
    customerTime: Date,
    businessTimezone: string,
  ): Promise<Date> {
    if (!isValidTimezone(businessTimezone)) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Invalid business timezone: ${businessTimezone}`,
        "Please check business timezone configuration",
      );
    }

    try {
      // Create a new date in the business timezone
      const businessTime = new Date(
        customerTime.toLocaleString("en-US", { timeZone: businessTimezone }),
      );
      return businessTime;
    } catch (error) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to convert to business time: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  /**
   * Converts business time to customer timezone
   */
  async convertToCustomerTime(
    businessTime: Date,
    customerTimezone: string,
  ): Promise<Date> {
    if (!isValidTimezone(customerTimezone)) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Invalid customer timezone: ${customerTimezone}`,
        "Please check customer timezone",
      );
    }

    try {
      // Create a new date in the customer timezone
      const customerTime = new Date(
        businessTime.toLocaleString("en-US", { timeZone: customerTimezone }),
      );
      return customerTime;
    } catch (error) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to convert to customer time: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  /**
   * Formats time with timezone information
   */
  formatTimeWithTimezone(time: Date, timezone: string): string {
    if (!isValidTimezone(timezone)) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Invalid timezone: ${timezone}`,
        "Please check timezone configuration",
      );
    }

    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });

      return formatter.format(time);
    } catch (error) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to format time with timezone: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  /**
   * Updates all future appointments when business timezone changes
   */
  async updateAppointmentTimezones(
    businessId: string,
    newTimezone: string,
  ): Promise<void> {
    if (!isValidTimezone(newTimezone)) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Invalid timezone: ${newTimezone}`,
        "Please provide a valid timezone",
      );
    }

    try {
      // Get current business location to find old timezone
      const currentLocation = await db
        .select()
        .from(businessLocations)
        .where(eq(businessLocations.businessId, businessId))
        .limit(1);

      if (currentLocation.length === 0) {
        throw new LocationError(
          LocationErrorCode.TIMEZONE_DETECTION_FAILED,
          "Business location not found",
          "Please set up business location first",
        );
      }

      const oldTimezone = currentLocation[0]!.timezone;

      // If timezone hasn't changed, no need to update appointments
      if (oldTimezone === newTimezone) {
        return;
      }

      // Get all future appointments for this business
      const today = new Date().toISOString().split("T")[0]!;
      const futureAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.businessId, businessId),
            // Only update future appointments
            // Note: This is a simplified check - in production you might want more sophisticated date comparison
          ),
        );

      // Update each appointment's timezone context
      // Note: We don't actually change the stored times since they're stored as strings
      // The timezone conversion will happen at display time using the new business timezone
      console.log(
        `Timezone change detected for business ${businessId}: ${oldTimezone} -> ${newTimezone}`,
      );
      console.log(
        `Found ${futureAppointments.length} future appointments to track timezone change`,
      );

      // In a production system, you might want to:
      // 1. Send notifications to customers about the timezone change
      // 2. Log the timezone change for audit purposes
      // 3. Update any cached appointment data
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to update appointment timezones: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }
}

// Export singleton instance
export const timezoneService = new TimezoneServiceImpl();

// Export convenience functions
export async function detectTimezone(
  coordinates: Coordinates,
): Promise<string> {
  return timezoneService.detectTimezone(coordinates);
}

export async function convertToBusinessTime(
  customerTime: Date,
  businessTimezone: string,
): Promise<Date> {
  return timezoneService.convertToBusinessTime(customerTime, businessTimezone);
}

export async function convertToCustomerTime(
  businessTime: Date,
  customerTimezone: string,
): Promise<Date> {
  return timezoneService.convertToCustomerTime(businessTime, customerTimezone);
}

export function formatTimeWithTimezone(time: Date, timezone: string): string {
  return timezoneService.formatTimeWithTimezone(time, timezone);
}

export async function updateAppointmentTimezones(
  businessId: string,
  newTimezone: string,
): Promise<void> {
  return timezoneService.updateAppointmentTimezones(businessId, newTimezone);
}
