/**
 * Geocoding provider interface for abstracting different geocoding services
 */

import type { Coordinates, Address, AddressValidation } from "@/types/location";

export interface AddressSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  coordinates: Coordinates;
  formattedAddress: string;
  address: Address;
}

/**
 * Abstract interface for geocoding providers
 */
export interface GeocodingProvider {
  /**
   * Provider name for identification
   */
  readonly name: string;

  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean;

  /**
   * Geocodes an address to coordinates
   */
  geocodeAddress(address: string): Promise<Coordinates>;

  /**
   * Reverse geocodes coordinates to an address
   */
  reverseGeocode(coordinates: Coordinates): Promise<Address>;

  /**
   * Gets address autocomplete suggestions
   */
  getAddressSuggestions(
    input: string,
    sessionToken?: string,
  ): Promise<AddressSuggestion[]>;

  /**
   * Gets place details from a place ID
   */
  getPlaceDetails(placeId: string): Promise<PlaceDetails>;

  /**
   * Validates an address and returns detailed information
   */
  validateAddress(address: string): Promise<AddressValidation>;

  /**
   * Gets timezone for coordinates
   */
  getTimezone(coordinates: Coordinates): Promise<string>;
}

/**
 * Configuration for geocoding providers
 */
export interface GeocodingProviderConfig {
  primary: string;
  fallback?: string;
  providers: {
    google?: {
      apiKey: string;
    };
    locationiq?: {
      apiKey: string;
    };
  };
}
