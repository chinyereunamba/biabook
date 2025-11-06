/**
 * Client-safe timezone service that doesn't access server environment variables
 */

import type { Coordinates } from "@/types/location";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";
import { isValidTimezone } from "@/lib/location-validation";
import { clientTimezoneProviderManager } from "@/lib/timezone-providers-client";

/**
 * Client-safe timezone service implementation
 */
class ClientTimezoneServiceImpl {
  /**
   * Detects timezone from coordinates using API or browser fallback
   */
  async detectTimezone(coordinates?: Coordinates): Promise<string> {
    try {
      const result =
        await clientTimezoneProviderManager.detectTimezoneWithFallback(
          coordinates,
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
   * Gets browser timezone as fallback
   */
  getBrowserTimezone(): string {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (!timezone || !isValidTimezone(timezone)) {
        return "UTC"; // Safe fallback
      }

      return timezone;
    } catch (error) {
      console.warn("Failed to get browser timezone:", error);
      return "UTC"; // Safe fallback
    }
  }

  /**
   * Formats time with timezone information
   */
  formatTimeWithTimezone(time: Date, timezone: string): string {
    if (!isValidTimezone(timezone)) {
      console.warn(`Invalid timezone: ${timezone}, using UTC`);
      timezone = "UTC";
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
      console.warn(`Failed to format time with timezone ${timezone}:`, error);
      // Fallback to basic formatting
      return time.toLocaleString();
    }
  }

  /**
   * Formats time for display in a specific timezone
   */
  formatTimeInTimezone(
    time: Date,
    timezone: string,
    options?: Intl.DateTimeFormatOptions,
  ): string {
    if (!isValidTimezone(timezone)) {
      console.warn(`Invalid timezone: ${timezone}, using browser timezone`);
      timezone = this.getBrowserTimezone();
    }

    try {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };

      const formatter = new Intl.DateTimeFormat("en-US", {
        ...defaultOptions,
        ...options,
      });

      return formatter.format(time);
    } catch (error) {
      console.warn(`Failed to format time in timezone ${timezone}:`, error);
      // Fallback to basic formatting
      return time.toLocaleTimeString();
    }
  }

  /**
   * Gets timezone offset in minutes
   */
  getTimezoneOffset(timezone: string): number {
    if (!isValidTimezone(timezone)) {
      console.warn(`Invalid timezone: ${timezone}, using UTC`);
      return 0;
    }

    try {
      const now = new Date();
      const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const targetTime = new Date(
        utc.toLocaleString("en-US", { timeZone: timezone }),
      );
      return (targetTime.getTime() - utc.getTime()) / 60000;
    } catch (error) {
      console.warn(`Failed to get timezone offset for ${timezone}:`, error);
      return 0;
    }
  }

  /**
   * Checks if two timezones are the same
   */
  isSameTimezone(timezone1: string, timezone2: string): boolean {
    if (!isValidTimezone(timezone1) || !isValidTimezone(timezone2)) {
      return false;
    }

    try {
      const now = new Date();
      const time1 = new Date(
        now.toLocaleString("en-US", { timeZone: timezone1 }),
      );
      const time2 = new Date(
        now.toLocaleString("en-US", { timeZone: timezone2 }),
      );
      return time1.getTime() === time2.getTime();
    } catch (error) {
      console.warn(
        `Failed to compare timezones ${timezone1} and ${timezone2}:`,
        error,
      );
      return timezone1 === timezone2;
    }
  }
}

// Export singleton instance
export const clientTimezoneService = new ClientTimezoneServiceImpl();

// Export convenience functions
export async function detectTimezone(
  coordinates?: Coordinates,
): Promise<string> {
  return clientTimezoneService.detectTimezone(coordinates);
}

export function getBrowserTimezone(): string {
  return clientTimezoneService.getBrowserTimezone();
}

export function formatTimeWithTimezone(time: Date, timezone: string): string {
  return clientTimezoneService.formatTimeWithTimezone(time, timezone);
}

export function formatTimeInTimezone(
  time: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return clientTimezoneService.formatTimeInTimezone(time, timezone, options);
}

export function getTimezoneOffset(timezone: string): number {
  return clientTimezoneService.getTimezoneOffset(timezone);
}

export function isSameTimezone(timezone1: string, timezone2: string): boolean {
  return clientTimezoneService.isSameTimezone(timezone1, timezone2);
}
