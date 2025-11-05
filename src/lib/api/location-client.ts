/**
 * Client-side utilities for location API requests
 */

import type { Coordinates, Address, AddressValidation } from "@/types/location";

// API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any[];
}

interface AddressSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

interface PlaceDetails {
  coordinates: Coordinates;
  formattedAddress: string;
  address: Address;
}

/**
 * Geocodes an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<Coordinates> {
  const response = await fetch("/api/location/geocode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  const result: ApiResponse<{ coordinates: Coordinates; address: string }> =
    await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to geocode address");
  }

  return result.data.coordinates;
}

/**
 * Reverse geocodes coordinates to an address
 */
export async function reverseGeocode(
  coordinates: Coordinates,
): Promise<Address> {
  const response = await fetch("/api/location/geocode", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(coordinates),
  });

  const result: ApiResponse<{ address: Address; coordinates: Coordinates }> =
    await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to reverse geocode coordinates");
  }

  return result.data.address;
}

/**
 * Gets address autocomplete suggestions
 */
export async function getAddressSuggestions(
  input: string,
  sessionToken?: string,
): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({ input });
  if (sessionToken) {
    params.set("sessionToken", sessionToken);
  }

  const response = await fetch(
    `/api/location/autocomplete?${params.toString()}`,
  );

  const result: ApiResponse<{
    suggestions: AddressSuggestion[];
    input: string;
  }> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to get address suggestions");
  }

  return result.data.suggestions;
}

/**
 * Gets place details from a place ID
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const response = await fetch(
    `/api/location/place-details?placeId=${encodeURIComponent(placeId)}`,
  );

  const result: ApiResponse<PlaceDetails> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to get place details");
  }

  return result.data;
}

/**
 * Validates an address
 */
export async function validateAddress(
  address: string,
): Promise<AddressValidation> {
  const response = await fetch("/api/location/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  const result: ApiResponse<AddressValidation> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to validate address");
  }

  return result.data;
}

/**
 * Gets current location using browser geolocation API
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = "Failed to get current location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  });
}

/**
 * Requests location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (!navigator.permissions) {
    // Fallback: try to get location directly
    try {
      await getCurrentLocation();
      return true;
    } catch {
      return false;
    }
  }

  try {
    const permission = await navigator.permissions.query({
      name: "geolocation",
    });
    return permission.state === "granted";
  } catch {
    return false;
  }
}

/**
 * Generates a session token for Places API requests
 */
export function generateSessionToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Utility class for managing address autocomplete with session tokens
 */
export class AddressAutocomplete {
  private sessionToken: string;

  constructor() {
    this.sessionToken = generateSessionToken();
  }

  /**
   * Gets address suggestions using the session token
   */
  async getSuggestions(input: string): Promise<AddressSuggestion[]> {
    return getAddressSuggestions(input, this.sessionToken);
  }

  /**
   * Gets place details and resets the session token
   */
  async selectPlace(placeId: string): Promise<PlaceDetails> {
    try {
      const details = await getPlaceDetails(placeId);
      this.resetSession();
      return details;
    } catch (error) {
      this.resetSession();
      throw error;
    }
  }

  /**
   * Resets the session token
   */
  resetSession(): void {
    this.sessionToken = generateSessionToken();
  }

  /**
   * Gets the current session token
   */
  getSessionToken(): string {
    return this.sessionToken;
  }
}
