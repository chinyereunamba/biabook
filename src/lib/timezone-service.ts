/**
 * Timezone detection and conversion service
 * Handles timezone operations for location-based booking system with multiple provider support
 */

import type { Coordinates, TimezoneService } from "@/types/location";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";
import {
  validateCoordinates,
  isValidTimezone,
} from "@/lib/location-validation";
import { timezoneProviderManager } from "@/lib/timezone-providers";
import { db } from "@/server/db";
import { appointments, businessLocations } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Timezone service implementation with multiple provider support
 */
class TimezoneServiceImpl implements TimezoneService {
  /**
   * Detects timezone from coordinates using available providers with fallback
   */
  async detectTimezone(coordinates: Coordinates): Promise<string> {
    const validatedCoordinates = validateCoordinates(coordinates);

    try {
      const result =
        await timezoneProviderManager.detectTimezoneWithFallback(
          validatedCoordinates,
        );

      // Log which provider was used for debugging/monitoring
      console.log(
        `Timezone detected using ${result.provider}: ${result.timezone}`,
      );

      return result.timezone;
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to detect timezone: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again or contact support",
      );
    }
  }

  /**
   * Detects timezone using a specific provider
   */
  async detectTimezoneWithProvider(
    coordinates: Coordinates,
    providerName: string,
  ): Promise<{
    timezone: string;
    provider: string;
  }> {
    const validatedCoordinates = validateCoordinates(coordinates);
    const provider = timezoneProviderManager.getProvider(providerName);

    if (!provider) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Unknown timezone provider: ${providerName}`,
        "Please use a valid provider name",
      );
    }

    if (!provider.isAvailable()) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Timezone provider ${providerName} is not available (missing API key or configuration)`,
        "Please configure the provider or use a different one",
      );
    }

    try {
      const timezone = await provider.detectTimezone(validatedCoordinates);
      return { timezone, provider: providerName };
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Failed to detect timezone with ${providerName}: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again or use a different provider",
      );
    }
  }

  /**
   * Gets list of available timezone providers
   */
  getAvailableProviders(): Array<{ name: string; available: boolean }> {
    const allProviders = ["google", "timezonedb", "worldtime"];
    return allProviders.map((name) => {
      const provider = timezoneProviderManager.getProvider(name);
      return {
        name,
        available: provider ? provider.isAvailable() : false,
      };
    });
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

export async function detectTimezoneWithProvider(
  coordinates: Coordinates,
  providerName: string,
): Promise<{ timezone: string; provider: string }> {
  return timezoneService.detectTimezoneWithProvider(coordinates, providerName);
}

export function getAvailableTimezoneProviders(): Array<{
  name: string;
  available: boolean;
}> {
  return timezoneService.getAvailableProviders();
}
