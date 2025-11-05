/**
 * Business location service for managing business location data
 */

import type {
  BusinessLocationService,
  BusinessLocationModel,
  LocationInput,
  AddressValidation,
  Coordinates,
  LocationError,
  LocationErrorCode,
} from "@/types/location";
import { geocodingService } from "./geocoding-service";
import { businessLocationRepository } from "@/server/repositories/business-location-repository";
import { timezoneService } from "@/lib/timezone-service";
import { timezoneRepository } from "@/server/repositories/timezone-repository";
import {
  validateLocationInput,
  validateServiceRadius,
} from "@/lib/location-validation";
import { normalizeCoordinates } from "@/lib/coordinate-utils";

/**
 * Implementation of BusinessLocationService
 */
export class BusinessLocationServiceImpl implements BusinessLocationService {
  /**
   * Updates business location data
   */
  async updateLocation(
    businessId: string,
    locationData: LocationInput,
  ): Promise<BusinessLocationModel> {
    // Validate input data
    const validatedInput = validateLocationInput(locationData);

    let coordinates: Coordinates;
    let timezone: string;

    // Get coordinates - either from input or geocode the address
    if (validatedInput.coordinates) {
      coordinates = normalizeCoordinates(validatedInput.coordinates);
    } else {
      const fullAddress = `${validatedInput.address}, ${validatedInput.city}, ${validatedInput.state} ${validatedInput.zipCode}`;
      coordinates = await geocodingService.geocodeAddress(fullAddress);
    }

    // Get timezone for the coordinates
    try {
      timezone = await timezoneService.detectTimezone(coordinates);
    } catch (error) {
      console.warn("Failed to detect timezone, using default:", error);
      timezone = "America/New_York"; // Default fallback
    }

    // Create business location data
    const businessLocationData = {
      businessId,
      address: validatedInput.address,
      city: validatedInput.city,
      state: validatedInput.state,
      zipCode: validatedInput.zipCode,
      country: validatedInput.country,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      timezone,
    };

    // Check if timezone is changing for existing business
    const existingLocation =
      await businessLocationRepository.getByBusinessId(businessId);
    const timezoneChanged =
      existingLocation && existingLocation.timezone !== timezone;

    // Save to database
    const result =
      await businessLocationRepository.upsert(businessLocationData);

    // If timezone changed, update appointment timezones
    if (timezoneChanged) {
      try {
        await timezoneService.updateAppointmentTimezones(businessId, timezone);

        // Log the timezone change
        const futureAppointments =
          await timezoneRepository.getFutureAppointments(businessId);
        await timezoneRepository.logTimezoneChange(
          businessId,
          existingLocation!.timezone,
          timezone,
          futureAppointments.length,
        );
      } catch (error) {
        console.error(
          "Failed to update appointment timezones after location update:",
          error,
        );
        // Don't fail the location update if appointment timezone update fails
      }
    }

    return result;
  }

  /**
   * Validates an address and returns detailed information
   */
  async validateAddress(address: string): Promise<AddressValidation> {
    return geocodingService.validateAddress(address);
  }

  /**
   * Gets coordinates for an address
   */
  async getCoordinates(address: string): Promise<Coordinates> {
    return geocodingService.geocodeAddress(address);
  }

  /**
   * Sets service radius for a business
   */
  async setServiceRadius(businessId: string, radius: number): Promise<void> {
    const validatedRadius = validateServiceRadius(radius);
    await businessLocationRepository.updateServiceRadius(
      businessId,
      validatedRadius,
    );
  }

  /**
   * Gets business location data
   */
  async getBusinessLocation(
    businessId: string,
  ): Promise<BusinessLocationModel | null> {
    return businessLocationRepository.getByBusinessId(businessId);
  }

  /**
   * Gets address autocomplete suggestions
   */
  async getAddressSuggestions(input: string, sessionToken?: string) {
    return geocodingService.getAddressSuggestions(input, sessionToken);
  }

  /**
   * Gets place details from a place ID
   */
  async getPlaceDetails(placeId: string) {
    return geocodingService.getPlaceDetails(placeId);
  }

  /**
   * Gets timezone for coordinates
   */
  async getTimezone(coordinates: Coordinates): Promise<string> {
    return timezoneService.detectTimezone(coordinates);
  }

  /**
   * Updates business timezone and handles appointment updates
   */
  async updateBusinessTimezone(
    businessId: string,
    timezone: string,
  ): Promise<void> {
    await timezoneRepository.updateBusinessTimezone(businessId, timezone);
    await timezoneService.updateAppointmentTimezones(businessId, timezone);
  }

  /**
   * Gets business timezone
   */
  async getBusinessTimezone(businessId: string): Promise<string | null> {
    return timezoneRepository.getBusinessTimezone(businessId);
  }
}

// Export singleton instance
export const businessLocationService = new BusinessLocationServiceImpl();

// Export utility functions
export async function updateBusinessLocation(
  businessId: string,
  locationData: LocationInput,
): Promise<BusinessLocationModel> {
  return businessLocationService.updateLocation(businessId, locationData);
}

export async function validateBusinessAddress(
  address: string,
): Promise<AddressValidation> {
  return businessLocationService.validateAddress(address);
}

export async function getBusinessCoordinates(
  address: string,
): Promise<Coordinates> {
  return businessLocationService.getCoordinates(address);
}

export async function setBusinessServiceRadius(
  businessId: string,
  radius: number,
): Promise<void> {
  return businessLocationService.setServiceRadius(businessId, radius);
}

export async function getBusinessLocation(
  businessId: string,
): Promise<BusinessLocationModel | null> {
  return businessLocationService.getBusinessLocation(businessId);
}

export async function updateBusinessTimezone(
  businessId: string,
  timezone: string,
): Promise<void> {
  return businessLocationService.updateBusinessTimezone(businessId, timezone);
}

export async function getBusinessTimezone(
  businessId: string,
): Promise<string | null> {
  return businessLocationService.getBusinessTimezone(businessId);
}
