/**
 * Geocoding service for address autocomplete and coordinate conversion
 * Now uses the enhanced geocoding service with provider abstraction and fallback support
 *
 * @deprecated This service is maintained for backward compatibility.
 * New code should use enhanced-geocoding-service.ts directly.
 */

import type { Coordinates, Address, AddressValidation } from "@/types/location";
import {
  enhancedGeocodingService,
  geocodeAddress as enhancedGeocodeAddress,
  reverseGeocode as enhancedReverseGeocode,
  getAddressSuggestions as enhancedGetAddressSuggestions,
  validateAddress as enhancedValidateAddress,
  getTimezone as enhancedGetTimezone,
} from "./enhanced-geocoding-service";

/**
 * Geocoding service class - now delegates to enhanced geocoding service
 * @deprecated Use enhanced-geocoding-service.ts directly for new code
 */
export class GeocodingService {
  /**
   * Geocodes an address to coordinates
   */
  async geocodeAddress(address: string): Promise<Coordinates> {
    return enhancedGeocodingService.geocodeAddress(address);
  }

  /**
   * Reverse geocodes coordinates to an address
   */
  async reverseGeocode(coordinates: Coordinates): Promise<Address> {
    return enhancedGeocodingService.reverseGeocode(coordinates);
  }

  /**
   * Gets address autocomplete suggestions
   */
  async getAddressSuggestions(
    input: string,
    sessionToken?: string,
  ): Promise<
    Array<{
      description: string;
      placeId: string;
      mainText: string;
      secondaryText: string;
    }>
  > {
    return enhancedGeocodingService.getAddressSuggestions(input, sessionToken);
  }

  /**
   * Gets place details from a place ID
   */
  async getPlaceDetails(placeId: string): Promise<{
    coordinates: Coordinates;
    formattedAddress: string;
    address: Address;
  }> {
    return enhancedGeocodingService.getPlaceDetails(placeId);
  }

  /**
   * Validates an address and returns detailed information
   */
  async validateAddress(address: string): Promise<AddressValidation> {
    return enhancedGeocodingService.validateAddress(address);
  }

  /**
   * Gets timezone for coordinates
   */
  async getTimezone(coordinates: Coordinates): Promise<string> {
    return enhancedGeocodingService.getTimezone(coordinates);
  }

  /**
   * Clears expired cache entries
   */
  async clearExpiredCache(): Promise<number> {
    return enhancedGeocodingService.clearExpiredCache();
  }

  /**
   * Gets cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
  }> {
    return enhancedGeocodingService.getCacheStats();
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService();

// Export utility functions - now delegate to enhanced service
export async function geocodeAddress(address: string): Promise<Coordinates> {
  return enhancedGeocodeAddress(address);
}

export async function reverseGeocode(
  coordinates: Coordinates,
): Promise<Address> {
  return enhancedReverseGeocode(coordinates);
}

export async function getAddressSuggestions(
  input: string,
  sessionToken?: string,
) {
  return enhancedGetAddressSuggestions(input, sessionToken);
}

export async function validateAddress(
  address: string,
): Promise<AddressValidation> {
  return enhancedValidateAddress(address);
}

export async function getTimezone(coordinates: Coordinates): Promise<string> {
  return enhancedGetTimezone(coordinates);
}
