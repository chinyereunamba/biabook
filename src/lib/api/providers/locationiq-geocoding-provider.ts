/**
 * LocationIQ geocoding provider implementation
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

// LocationIQ API response types
interface LocationIQGeocodingResponse {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: string[];
}

interface LocationIQAutocompleteResponse {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

interface LocationIQTimezoneResponse {
  timezone: {
    name: string;
    offset_STD: string;
    offset_STD_seconds: number;
    offset_DST: string;
    offset_DST_seconds: number;
    country_code: string;
    is_dst: boolean;
    requested_location: {
      lat: string;
      lon: string;
    };
  };
}

export class LocationIQGeocodingProvider implements GeocodingProvider {
  readonly name = "locationiq";
  private readonly apiKey: string;
  private readonly baseUrl = "https://us1.locationiq.com/v1";

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
        "LocationIQ API key not configured",
        "Please configure LOCATIONIQ_API_KEY environment variable",
      );
    }

    try {
      const url = new URL(`${this.baseUrl}/search.php`);
      url.searchParams.set("key", this.apiKey);
      url.searchParams.set("q", address);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "us"); // Focus on US addresses

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        throw new LocationError(
          "GEOCODING_FAILED" as LocationErrorCode,
          `LocationIQ API error: ${response.status} - ${errorText}`,
          "Please check the address and try again",
        );
      }

      const data: LocationIQGeocodingResponse[] = await response.json();

      if (!data.length) {
        throw new LocationError(
          "GEOCODING_FAILED" as LocationErrorCode,
          "No results found for the provided address",
          "Please check the address and try again",
        );
      }

      const result = data[0]!;
      const coordinates: Coordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
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
        "LocationIQ API key not configured",
        "Please configure LOCATIONIQ_API_KEY environment variable",
      );
    }

    try {
      const url = new URL(`${this.baseUrl}/reverse.php`);
      url.searchParams.set("key", this.apiKey);
      url.searchParams.set("lat", validatedCoordinates.latitude.toString());
      url.searchParams.set("lon", validatedCoordinates.longitude.toString());
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        throw new LocationError(
          "GEOCODING_FAILED" as LocationErrorCode,
          `LocationIQ reverse geocoding error: ${response.status} - ${errorText}`,
          "Unable to determine address from coordinates",
        );
      }

      const data: LocationIQGeocodingResponse = await response.json();
      return this.parseLocationIQAddress(data);
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
        "LocationIQ API key not configured. Address autocomplete unavailable.",
      );
      return [];
    }

    try {
      const url = new URL(`${this.baseUrl}/autocomplete.php`);
      url.searchParams.set("key", this.apiKey);
      url.searchParams.set("q", input);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "5");
      url.searchParams.set("countrycodes", "us"); // Focus on US addresses
      url.searchParams.set("tag", "place:house,place:building,highway");

      const response = await fetch(url.toString());

      if (!response.ok) {
        console.warn(`LocationIQ autocomplete failed: ${response.status}`);
        return [];
      }

      const data: LocationIQAutocompleteResponse[] = await response.json();

      return data.map((item) => {
        const address = item.address || {};
        const mainText = this.formatMainText(address);
        const secondaryText = this.formatSecondaryText(address);

        return {
          description: item.display_name,
          placeId: item.place_id,
          mainText,
          secondaryText,
        };
      });
    } catch (error) {
      console.warn("LocationIQ address autocomplete failed:", error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.isConfigured()) {
      throw new LocationError(
        "GEOCODING_FAILED" as LocationErrorCode,
        "LocationIQ API key not configured",
        "Please configure LOCATIONIQ_API_KEY environment variable",
      );
    }

    try {
      const url = new URL(`${this.baseUrl}/details.php`);
      url.searchParams.set("key", this.apiKey);
      url.searchParams.set("place_id", placeId);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        throw new LocationError(
          "GEOCODING_FAILED" as LocationErrorCode,
          `LocationIQ place details error: ${response.status} - ${errorText}`,
          "Unable to get place details",
        );
      }

      const data: LocationIQGeocodingResponse = await response.json();

      const coordinates: Coordinates = {
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon),
      };

      const validatedCoordinates = validateCoordinates(coordinates);
      const normalizedCoordinates = normalizeCoordinates(validatedCoordinates);
      const address = this.parseLocationIQAddress(data);

      return {
        coordinates: normalizedCoordinates,
        formattedAddress: data.display_name,
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
        "LocationIQ API key not configured",
        "Please configure LOCATIONIQ_API_KEY environment variable",
      );
    }

    try {
      const url = new URL(`${this.baseUrl}/timezone.php`);
      url.searchParams.set("key", this.apiKey);
      url.searchParams.set("lat", validatedCoordinates.latitude.toString());
      url.searchParams.set("lon", validatedCoordinates.longitude.toString());
      url.searchParams.set("format", "json");

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        throw new LocationError(
          "TIMEZONE_DETECTION_FAILED" as LocationErrorCode,
          `LocationIQ timezone error: ${response.status} - ${errorText}`,
          "Unable to detect timezone",
        );
      }

      const data: LocationIQTimezoneResponse = await response.json();
      return data.timezone.name;
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

  private parseLocationIQAddress(data: LocationIQGeocodingResponse): Address {
    const address = data.address || {};

    // Build street address from components
    const streetParts = [];
    if (address.house_number) streetParts.push(address.house_number);
    if (address.road) streetParts.push(address.road);

    return {
      address: streetParts.join(" ") || "",
      city: address.city || address.suburb || address.neighbourhood || "",
      state: address.state || "",
      zipCode: address.postcode || "",
      country: address.country_code?.toUpperCase() || "US",
    };
  }

  private formatMainText(address: any): string {
    const parts = [];
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    return parts.join(" ") || address.city || address.suburb || "";
  }

  private formatSecondaryText(address: any): string {
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postcode) parts.push(address.postcode);
    return parts.join(", ");
  }
}
