/**
 * Client-safe timezone provider that uses API routes instead of direct environment variables
 */

import type { Coordinates } from "@/types/location";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";
import {
  validateCoordinates,
  isValidTimezone,
} from "@/lib/location-validation";

export interface ClientTimezoneProvider {
  name: string;
  detectTimezone(coordinates: Coordinates): Promise<string>;
}

/**
 * Client-side timezone provider that uses API routes
 */
export class APITimezoneProvider implements ClientTimezoneProvider {
  name = "api";

  async detectTimezone(coordinates: Coordinates): Promise<string> {
    const validatedCoordinates = validateCoordinates(coordinates);

    try {
      const response = await fetch("/api/timezone/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: validatedCoordinates.latitude,
          longitude: validatedCoordinates.longitude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new LocationError(
          LocationErrorCode.TIMEZONE_DETECTION_FAILED,
          errorData.error || `API request failed: ${response.status}`,
          "Unable to detect timezone",
        );
      }

      const data = await response.json();
      const timezone = data.timezone;

      if (!timezone || !isValidTimezone(timezone)) {
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
        `Timezone detection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }
}

/**
 * Browser-based timezone detection (fallback)
 */
export class BrowserTimezoneProvider implements ClientTimezoneProvider {
  name = "browser";

  async detectTimezone(): Promise<string> {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (!timezone || !isValidTimezone(timezone)) {
        throw new LocationError(
          LocationErrorCode.TIMEZONE_DETECTION_FAILED,
          `Invalid browser timezone: ${timezone}`,
          "Browser timezone detection failed",
        );
      }

      return timezone;
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        `Browser timezone detection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Unable to detect timezone from browser",
      );
    }
  }
}

/**
 * Client-side timezone provider manager
 */
export class ClientTimezoneProviderManager {
  private providers: Map<string, ClientTimezoneProvider> = new Map();

  constructor() {
    this.providers.set("api", new APITimezoneProvider());
    this.providers.set("browser", new BrowserTimezoneProvider());
  }

  async detectTimezoneWithFallback(coordinates?: Coordinates): Promise<{
    timezone: string;
    provider: string;
  }> {
    const errors: Array<{ provider: string; error: Error }> = [];

    // Try API-based detection first if coordinates are provided
    if (coordinates) {
      const apiProvider = this.providers.get("api");
      if (apiProvider) {
        try {
          const timezone = await apiProvider.detectTimezone(coordinates);
          return { timezone, provider: "api" };
        } catch (error) {
          console.warn("API timezone detection failed:", error);
          errors.push({
            provider: "api",
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    }

    // Fall back to browser detection
    const browserProvider = this.providers.get("browser");
    if (browserProvider) {
      try {
        const timezone = await browserProvider.detectTimezone(
          coordinates || { latitude: 0, longitude: 0 },
        );
        return { timezone, provider: "browser" };
      } catch (error) {
        console.warn("Browser timezone detection failed:", error);
        errors.push({
          provider: "browser",
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    // If all providers failed, throw the most relevant error
    const lastError = errors[errors.length - 1];
    throw new LocationError(
      LocationErrorCode.TIMEZONE_DETECTION_FAILED,
      `All timezone providers failed. Last error: ${lastError?.error.message || "Unknown error"}`,
      "Please try again later or contact support",
    );
  }
}

// Export singleton instance
export const clientTimezoneProviderManager =
  new ClientTimezoneProviderManager();
