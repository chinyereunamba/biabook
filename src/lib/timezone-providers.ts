/**
 * Timezone provider abstractions for multiple API services
 */

import type { Coordinates } from "@/types/location";
import { LocationError, LocationErrorCode } from "@/types/location";
import {
  validateCoordinates,
  isValidTimezone,
} from "@/lib/location-validation";
import { env } from "@/env";

export interface TimezoneProvider {
  name: string;
  detectTimezone(coordinates: Coordinates): Promise<string>;
  isAvailable(): boolean;
}

/**
 * Google Timezone API Provider
 */
export class GoogleTimezoneProvider implements TimezoneProvider {
  name = "google";
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = env.GOOGLE_MAPS_API_KEY;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

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
          data.error_message || `Google Timezone API error: ${data.status}`,
          "Unable to detect timezone using Google API",
        );
      }

      const timezone = data.timeZoneId;
      if (!isValidTimezone(timezone)) {
        throw new LocationError(
          LocationErrorCode.TIMEZONE_DETECTION_FAILED,
          `Invalid timezone returned by Google API: ${timezone}`,
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
        `Google Timezone API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again or use an alternative provider",
      );
    }
  }
}

/**
 * TimeZoneDB API Provider
 */
export class TimeZoneDBProvider implements TimezoneProvider {
  name = "timezonedb";
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = env.TIMEZONEDB_API_KEY;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async detectTimezone(coordinates: Coordinates): Promise<string> {
    const validatedCoordinates = validateCoordinates(coordinates);

    if (!this.apiKey) {
      throw new LocationError(
        LocationErrorCode.TIMEZONE_DETECTION_FAILED,
        "TimeZoneDB API key not configured",
        "Please configure TIMEZONEDB_API_KEY environment variable",
      );
    }

    try {
      const url = new URL("http://api.timezonedb.com/v2.1/get-time-zone");
      url.searchParams.set("key", this.apiKey);
      url.searchParams.set("format", "json");
      url.searchParams.set("by", "position");
      url.searchParams.set("lat", validatedCoordinates.latitude.toString());
      url.searchParams.set("lng", validatedCoordinates.longitude.toString());

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== "OK") {
        throw new LocationError(
          LocationErrorCode.TIMEZONE_DETECTION_FAILED,
          data.message || `TimeZoneDB API error: ${data.status}`,
          "Unable to detect timezone using TimeZoneDB",
        );
      }

      const timezone = data.zoneName;
      if (!timezone || !isValidTimezone(timezone)) {
        throw new LocationError(
          LocationErrorCode.TIMEZONE_DETECTION_FAILED,
          `Invalid timezone returned by TimeZoneDB: ${timezone}`,
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
        `TimeZoneDB API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again or use an alternative provider",
      );
    }
  }
}

/**
 * WorldTimeAPI Provider (Free, no API key required)
 */
export class WorldTimeAPIProvider implements TimezoneProvider {
  name = "worldtime";

  isAvailable(): boolean {
    return true; // Always available as it's free
  }

  async detectTimezone(coordinates: Coordinates): Promise<string> {
    const validatedCoordinates = validateCoordinates(coordinates);

    try {
      // WorldTimeAPI doesn't have a direct coordinate-to-timezone endpoint
      // We'll use a reverse geocoding approach with their timezone list
      // First, try to get timezone by approximate location mapping
      const timezone =
        await this.getTimezoneByCoordinates(validatedCoordinates);

      if (!isValidTimezone(timezone)) {
        throw new LocationError(
          LocationErrorCode.TIMEZONE_DETECTION_FAILED,
          `Invalid timezone detected: ${timezone}`,
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
        `WorldTimeAPI request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again or use an alternative provider",
      );
    }
  }

  private async getTimezoneByCoordinates(
    coordinates: Coordinates,
  ): Promise<string> {
    // Simple coordinate-to-timezone mapping for major regions
    // This is a simplified approach - in production you might want more sophisticated mapping
    const { latitude, longitude } = coordinates;

    // Rough timezone mapping based on longitude
    // This is approximate and should be improved with a proper timezone boundary database
    let timezone: string;

    if (
      latitude >= 49.0 &&
      latitude <= 83.0 &&
      longitude >= -141.0 &&
      longitude <= -52.0
    ) {
      // Canada/US regions
      if (longitude >= -75.0) timezone = "America/New_York";
      else if (longitude >= -90.0) timezone = "America/Chicago";
      else if (longitude >= -105.0) timezone = "America/Denver";
      else timezone = "America/Los_Angeles";
    } else if (
      latitude >= 25.0 &&
      latitude <= 49.0 &&
      longitude >= -125.0 &&
      longitude <= -66.0
    ) {
      // US regions
      if (longitude >= -75.0) timezone = "America/New_York";
      else if (longitude >= -90.0) timezone = "America/Chicago";
      else if (longitude >= -105.0) timezone = "America/Denver";
      else timezone = "America/Los_Angeles";
    } else if (
      latitude >= 35.0 &&
      latitude <= 71.0 &&
      longitude >= -10.0 &&
      longitude <= 40.0
    ) {
      // Europe
      if (longitude <= 15.0) timezone = "Europe/London";
      else timezone = "Europe/Berlin";
    } else if (
      latitude >= -55.0 &&
      latitude <= -10.0 &&
      longitude >= -75.0 &&
      longitude <= -35.0
    ) {
      // South America
      timezone = "America/Sao_Paulo";
    } else if (
      latitude >= -45.0 &&
      latitude <= -10.0 &&
      longitude >= 110.0 &&
      longitude <= 155.0
    ) {
      // Australia
      if (longitude >= 140.0) timezone = "Australia/Sydney";
      else timezone = "Australia/Adelaide";
    } else if (
      latitude >= 20.0 &&
      latitude <= 50.0 &&
      longitude >= 70.0 &&
      longitude <= 140.0
    ) {
      // Asia
      if (longitude <= 90.0) timezone = "Asia/Kolkata";
      else if (longitude <= 120.0) timezone = "Asia/Shanghai";
      else timezone = "Asia/Tokyo";
    } else {
      // Default to UTC for unknown regions
      timezone = "UTC";
    }

    // Validate the timezone by making a request to WorldTimeAPI
    try {
      const url = `https://worldtimeapi.org/api/timezone/${timezone}`;
      const response = await fetch(url);

      if (!response.ok) {
        // If the specific timezone fails, fall back to UTC
        const utcResponse = await fetch(
          "https://worldtimeapi.org/api/timezone/UTC",
        );
        if (!utcResponse.ok) {
          throw new Error("WorldTimeAPI is not available");
        }
        return "UTC";
      }

      const data = await response.json();
      return data.timezone || timezone;
    } catch (error) {
      // If API is down, return the best guess timezone
      return timezone;
    }
  }
}

/**
 * Provider factory and management
 */
export class TimezoneProviderManager {
  private providers: Map<string, TimezoneProvider> = new Map();

  constructor() {
    this.providers.set("google", new GoogleTimezoneProvider());
    this.providers.set("timezonedb", new TimeZoneDBProvider());
    this.providers.set("worldtime", new WorldTimeAPIProvider());
  }

  getProvider(name: string): TimezoneProvider | undefined {
    return this.providers.get(name);
  }

  getAvailableProviders(): TimezoneProvider[] {
    return Array.from(this.providers.values()).filter((provider) =>
      provider.isAvailable(),
    );
  }

  async detectTimezoneWithFallback(coordinates: Coordinates): Promise<{
    timezone: string;
    provider: string;
  }> {
    const providerOrder = this.getProviderOrder();
    const errors: Array<{ provider: string; error: Error }> = [];

    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);
      if (!provider || !provider.isAvailable()) {
        continue;
      }

      try {
        const timezone = await provider.detectTimezone(coordinates);
        return { timezone, provider: providerName };
      } catch (error) {
        console.warn(`Timezone detection failed with ${providerName}:`, error);
        errors.push({
          provider: providerName,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        continue;
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

  private getProviderOrder(): string[] {
    const configuredProvider = env.TIMEZONE_PROVIDER;

    switch (configuredProvider) {
      case "google":
        return ["google", "timezonedb", "worldtime"];
      case "timezonedb":
        return ["timezonedb", "google", "worldtime"];
      case "worldtime":
        return ["worldtime", "timezonedb", "google"];
      case "auto":
      default:
        // Auto mode: prefer providers with API keys, then free options
        const order: string[] = [];

        if (this.providers.get("google")?.isAvailable()) {
          order.push("google");
        }
        if (this.providers.get("timezonedb")?.isAvailable()) {
          order.push("timezonedb");
        }
        order.push("worldtime"); // Always available as fallback

        return order;
    }
  }
}

// Export singleton instance
export const timezoneProviderManager = new TimezoneProviderManager();
