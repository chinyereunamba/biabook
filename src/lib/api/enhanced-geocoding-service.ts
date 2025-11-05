/**
 * Enhanced geocoding service with provider abstraction and fallback support
 */

import type {
  Coordinates,
  Address,
  AddressValidation,
  LocationErrorCode,
} from "@/types/location";
import { LocationError } from "@/types/location";
import { validateCoordinates } from "@/lib/location-validation";
import { normalizeCoordinates } from "@/lib/coordinate-utils";
import { locationCacheRepository } from "@/server/repositories/location-cache-repository";
import { GeocodingProviderFactory } from "./providers/geocoding-provider-factory";
import type {
  GeocodingProvider,
  AddressSuggestion,
  PlaceDetails,
} from "./providers/geocoding-provider";

/**
 * Enhanced geocoding service with provider abstraction and fallback support
 */
export class EnhancedGeocodingService {
  private readonly cacheExpiryHours = 24; // Cache results for 24 hours

  constructor() {
    if (!GeocodingProviderFactory.hasConfiguredProvider()) {
      console.warn(
        "No geocoding providers configured. Geocoding functionality will be limited.",
      );
    }
  }

  /**
   * Execute a geocoding operation with fallback support
   */
  private async executeWithFallback<T>(
    operation: (provider: GeocodingProvider) => Promise<T>,
    operationName: string,
  ): Promise<T> {
    const primaryProvider = GeocodingProviderFactory.getPrimaryProvider();
    const fallbackProvider = GeocodingProviderFactory.getFallbackProvider();

    if (!primaryProvider) {
      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        "No geocoding providers configured",
        "Please configure at least one geocoding provider",
      );
    }

    // Try primary provider first
    try {
      if (primaryProvider.isConfigured()) {
        return await operation(primaryProvider);
      }
    } catch (error) {
      console.warn(
        `Primary provider (${primaryProvider.name}) failed for ${operationName}:`,
        error instanceof Error ? error.message : error,
      );

      // If primary provider fails and we have a fallback, try it
      if (fallbackProvider && fallbackProvider.isConfigured()) {
        try {
          console.log(
            `Attempting fallback provider (${fallbackProvider.name}) for ${operationName}`,
          );
          return await operation(fallbackProvider);
        } catch (fallbackError) {
          console.warn(
            `Fallback provider (${fallbackProvider.name}) also failed for ${operationName}:`,
            fallbackError instanceof Error
              ? fallbackError.message
              : fallbackError,
          );
          // Throw the original error from primary provider
          throw error;
        }
      }

      // No fallback available, throw the original error
      throw error;
    }

    throw new LocationError(
      "GEOCODING_FAILED" as LocationErrorCode,
      `Primary provider (${primaryProvider.name}) is not configured`,
      "Please check your API key configuration",
    );
  }

  /**
   * Geocodes an address to coordinates
   */
  async geocodeAddress(address: string): Promise<Coordinates> {
    if (!address.trim()) {
      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        "Address cannot be empty",
        "Please provide a valid address",
      );
    }

    // Check cache first
    const cached = await locationCacheRepository.get(address);
    if (cached) {
      return cached.coordinates;
    }

    const coordinates = await this.executeWithFallback(
      (provider) => provider.geocodeAddress(address),
      "geocodeAddress",
    );

    // Validate and normalize coordinates
    const validatedCoordinates = validateCoordinates(coordinates);
    const normalizedCoordinates = normalizeCoordinates(validatedCoordinates);

    // Get timezone for caching
    let timezone = "";
    try {
      timezone = await this.getTimezone(normalizedCoordinates);
    } catch (error) {
      console.warn("Failed to get timezone for caching:", error);
    }

    // Cache the result
    const expiresAt = new Date(
      Date.now() + this.cacheExpiryHours * 60 * 60 * 1000,
    );
    await locationCacheRepository.set(
      address,
      normalizedCoordinates,
      timezone,
      expiresAt,
    );

    return normalizedCoordinates;
  }

  /**
   * Reverse geocodes coordinates to an address
   */
  async reverseGeocode(coordinates: Coordinates): Promise<Address> {
    return this.executeWithFallback(
      (provider) => provider.reverseGeocode(coordinates),
      "reverseGeocode",
    );
  }

  /**
   * Gets address autocomplete suggestions
   */
  async getAddressSuggestions(
    input: string,
    sessionToken?: string,
  ): Promise<AddressSuggestion[]> {
    if (!input.trim() || input.length < 3) {
      return [];
    }

    try {
      return await this.executeWithFallback(
        (provider) => provider.getAddressSuggestions(input, sessionToken),
        "getAddressSuggestions",
      );
    } catch (error) {
      // For autocomplete, we don't want to throw errors, just return empty results
      console.warn("Address autocomplete failed:", error);
      return [];
    }
  }

  /**
   * Gets place details from a place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    return this.executeWithFallback(
      (provider) => provider.getPlaceDetails(placeId),
      "getPlaceDetails",
    );
  }

  /**
   * Validates an address and returns detailed information
   */
  async validateAddress(address: string): Promise<AddressValidation> {
    try {
      return await this.executeWithFallback(
        (provider) => provider.validateAddress(address),
        "validateAddress",
      );
    } catch (error) {
      return {
        isValid: false,
        errors: [
          error instanceof Error ? error.message : "Address validation failed",
        ],
      };
    }
  }

  /**
   * Gets timezone for coordinates
   */
  async getTimezone(coordinates: Coordinates): Promise<string> {
    return this.executeWithFallback(
      (provider) => provider.getTimezone(coordinates),
      "getTimezone",
    );
  }

  /**
   * Clears expired cache entries
   */
  async clearExpiredCache(): Promise<number> {
    return locationCacheRepository.clearExpired();
  }

  /**
   * Gets cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
  }> {
    return locationCacheRepository.getStats();
  }

  /**
   * Get information about configured providers
   */
  getProviderInfo(): {
    primary: string | null;
    fallback: string | null;
    available: string[];
    hasConfigured: boolean;
  } {
    const config = GeocodingProviderFactory.getConfig();
    const primaryProvider = GeocodingProviderFactory.getPrimaryProvider();
    const fallbackProvider = GeocodingProviderFactory.getFallbackProvider();

    return {
      primary: primaryProvider?.name || null,
      fallback: fallbackProvider?.name || null,
      available: GeocodingProviderFactory.getAvailableProviders(),
      hasConfigured: GeocodingProviderFactory.hasConfiguredProvider(),
    };
  }
}

// Export singleton instance
export const enhancedGeocodingService = new EnhancedGeocodingService();

// Export utility functions for backward compatibility
export async function geocodeAddress(address: string): Promise<Coordinates> {
  return enhancedGeocodingService.geocodeAddress(address);
}

export async function reverseGeocode(
  coordinates: Coordinates,
): Promise<Address> {
  return enhancedGeocodingService.reverseGeocode(coordinates);
}

export async function getAddressSuggestions(
  input: string,
  sessionToken?: string,
): Promise<AddressSuggestion[]> {
  return enhancedGeocodingService.getAddressSuggestions(input, sessionToken);
}

export async function validateAddress(
  address: string,
): Promise<AddressValidation> {
  return enhancedGeocodingService.validateAddress(address);
}

export async function getTimezone(coordinates: Coordinates): Promise<string> {
  return enhancedGeocodingService.getTimezone(coordinates);
}
