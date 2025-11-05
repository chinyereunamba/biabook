/**
 * Google Maps geocoding provider implementation
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
import type {
  GeocodingProvider,
  AddressSuggestion,
  PlaceDetails,
} from "./geocoding-provider";

// Google Maps API response types
interface GoogleGeocodingResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    place_id: string;
  }>;
  status: string;
  error_message?: string;
}

interface GooglePlacesAutocompleteResponse {
  predictions: Array<{
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
    terms: Array<{
      offset: number;
      value: string;
    }>;
  }>;
  status: string;
  error_message?: string;
}

interface GoogleTimezoneResponse {
  dstOffset: number;
  rawOffset: number;
  status: string;
  timeZoneId: string;
  timeZoneName: string;
  error_message?: string;
}

export class GoogleGeocodingProvider implements GeocodingProvider {
  readonly name = "google";
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async geocodeAddress(address: string): Promise<Coordinates> {
    if (!address.trim()) {
      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        "Address cannot be empty",
        "Please provide a valid address",
      );
    }

    if (!this.isConfigured()) {
      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        "Google Maps API key not configured",
        "Please configure GOOGLE_MAPS_API_KEY environment variable",
      );
    }

    try {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("address", address);
      url.searchParams.set("key", this.apiKey);

      const response = await fetch(url.toString());
      const data: GoogleGeocodingResponse = await response.json();

      if (data.status !== "OK" || !data.results.length) {
        throw new LocationError(
          "GEOCODING_FAILED" as LocationErrorCode,
          data.error_message || `Geocoding failed: ${data.status}`,
          "Please check the address and try again",
        );
      }

      const result = data.results[0]!;
      const coordinates: Coordinates = {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      };

      const validatedCoordinates = validateCoordinates(coordinates);
      return normalizeCoordinates(validatedCoordinates);
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        `Failed to geocode address: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please check your internet connection and try again",
      );
    }
  }

  async reverseGeocode(coordinates: Coordinates): Promise<Address> {
    const validatedCoordinates = validateCoordinates(coordinates);

    if (!this.isConfigured()) {
      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        "Google Maps API key not configured",
        "Please configure GOOGLE_MAPS_API_KEY environment variable",
      );
    }

    try {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set(
        "latlng",
        `${validatedCoordinates.latitude},${validatedCoordinates.longitude}`,
      );
      url.searchParams.set("key", this.apiKey);

      const response = await fetch(url.toString());
      const data: GoogleGeocodingResponse = await response.json();

      if (data.status !== "OK" || !data.results.length) {
        throw new LocationError(
          "GEOCODING_FAILED" as LocationErrorCode,
          data.error_message || `Reverse geocoding failed: ${data.status}`,
          "Unable to determine address from coordinates",
        );
      }

      const result = data.results[0]!;
      return this.parseAddressComponents(
        result.address_components,
        result.formatted_address,
      );
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        `Failed to reverse geocode coordinates: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please check your internet connection and try again",
      );
    }
  }

  async getAddressSuggestions(
    input: string,
    sessionToken?: string,
  ): Promise<AddressSuggestion[]> {
    if (!input.trim() || input.length < 3) {
      return [];
    }

    if (!this.isConfigured()) {
      console.warn(
        "Google Maps API key not configured. Address autocomplete unavailable.",
      );
      return [];
    }

    try {
      const url = new URL(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      );
      url.searchParams.set("input", input);
      url.searchParams.set("key", this.apiKey);
      url.searchParams.set("types", "address");

      if (sessionToken) {
        url.searchParams.set("sessiontoken", sessionToken);
      }

      const response = await fetch(url.toString());
      const data: GooglePlacesAutocompleteResponse = await response.json();

      if (data.status !== "OK") {
        console.warn(
          `Places autocomplete failed: ${data.status}`,
          data.error_message,
        );
        return [];
      }

      return data.predictions.map((prediction) => ({
        description: prediction.description,
        placeId: prediction.place_id,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
      }));
    } catch (error) {
      console.warn("Address autocomplete failed:", error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.isConfigured()) {
      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        "Google Maps API key not configured",
        "Please configure GOOGLE_MAPS_API_KEY environment variable",
      );
    }

    try {
      const url = new URL(
        "https://maps.googleapis.com/maps/api/place/details/json",
      );
      url.searchParams.set("place_id", placeId);
      url.searchParams.set(
        "fields",
        "formatted_address,geometry,address_components",
      );
      url.searchParams.set("key", this.apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== "OK" || !data.result) {
        throw new LocationError(
          "GEOCODING_FAILED" as LocationErrorCode,
          data.error_message || `Place details failed: ${data.status}`,
          "Unable to get place details",
        );
      }

      const result = data.result;
      const coordinates: Coordinates = {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      };

      const validatedCoordinates = validateCoordinates(coordinates);
      const normalizedCoordinates = normalizeCoordinates(validatedCoordinates);
      const address = this.parseAddressComponents(
        result.address_components,
        result.formatted_address,
      );

      return {
        coordinates: normalizedCoordinates,
        formattedAddress: result.formatted_address,
        address,
      };
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        `Failed to get place details: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  async validateAddress(address: string): Promise<AddressValidation> {
    try {
      const coordinates = await this.geocodeAddress(address);
      const reverseGeocoded = await this.reverseGeocode(coordinates);

      return {
        isValid: true,
        formattedAddress: `${reverseGeocoded.address}, ${reverseGeocoded.city}, ${reverseGeocoded.state} ${reverseGeocoded.zipCode}`,
        coordinates,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          error instanceof Error ? error.message : "Address validation failed",
        ],
      };
    }
  }

  async getTimezone(coordinates: Coordinates): Promise<string> {
    const validatedCoordinates = validateCoordinates(coordinates);

    if (!this.isConfigured()) {
      throw new LocationError(
        "TIMEZONE_DETECTION_FAILED" as LocationErrorCode,
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
      const data: GoogleTimezoneResponse = await response.json();

      if (data.status !== "OK") {
        throw new LocationError(
          "TIMEZONE_DETECTION_FAILED" as LocationErrorCode,
          data.error_message || `Timezone detection failed: ${data.status}`,
          "Unable to detect timezone",
        );
      }

      return data.timeZoneId;
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }

      throw new LocationError(
        "TIMEZONE_DETECTION_FAILED" as LocationErrorCode,
        `Failed to detect timezone: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Please try again",
      );
    }
  }

  private parseAddressComponents(
    components: any[],
    formattedAddress: string,
  ): Address {
    const addressData: Partial<Address> = {
      country: "US", // Default to US
    };

    for (const component of components) {
      const types = component.types;

      if (types.includes("street_number")) {
        addressData.address =
          component.long_name +
          (addressData.address ? ` ${addressData.address}` : "");
      } else if (types.includes("route")) {
        addressData.address =
          (addressData.address ? `${addressData.address} ` : "") +
          component.long_name;
      } else if (types.includes("locality")) {
        addressData.city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        addressData.state = component.short_name;
      } else if (types.includes("postal_code")) {
        addressData.zipCode = component.long_name;
      } else if (types.includes("country")) {
        addressData.country = component.short_name;
      }
    }

    // Fallback to parsing formatted address if components are missing
    if (
      !addressData.address ||
      !addressData.city ||
      !addressData.state ||
      !addressData.zipCode
    ) {
      const parts = formattedAddress.split(", ");
      if (parts.length >= 3) {
        if (!addressData.address) addressData.address = parts[0] || "";
        if (!addressData.city) addressData.city = parts[parts.length - 3] || "";

        const stateZip = parts[parts.length - 2]?.split(" ") || [];
        if (!addressData.state && stateZip.length >= 1)
          addressData.state = stateZip[0] || "";
        if (!addressData.zipCode && stateZip.length >= 2)
          addressData.zipCode = stateZip.slice(1).join(" ");
      }
    }

    return {
      address: addressData.address || "",
      city: addressData.city || "",
      state: addressData.state || "",
      zipCode: addressData.zipCode || "",
      country: addressData.country || "US",
    };
  }
}
