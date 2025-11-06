import {
  customerLocationRepository,
  type CustomerLocationData,
} from "@/server/repositories/customer-location-repository";
import { businessLocationRepository } from "@/server/repositories/business-location-repository";
import { calculateDistance } from "@/lib/distance-utils";

export interface LocationTrackingOptions {
  /**
   * Whether the customer has consented to location tracking
   */
  hasConsent: boolean;

  /**
   * Customer's coordinates (if available and consented)
   */
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  /**
   * Customer's zip code (fallback if coordinates not available)
   */
  zipCode?: string;

  /**
   * Whether to calculate distance to business
   */
  calculateDistance?: boolean;
}

export interface LocationTrackingResult {
  success: boolean;
  locationId?: string;
  distance?: number;
  message?: string;
}

export class CustomerLocationService {
  /**
   * Track customer location for an appointment (with privacy compliance)
   */
  async trackCustomerLocation(
    appointmentId: string,
    businessId: string,
    options: LocationTrackingOptions,
  ): Promise<LocationTrackingResult> {
    try {
      // Only proceed if customer has given consent
      if (!options.hasConsent) {
        return {
          success: true,
          message: "Location tracking skipped - no consent provided",
        };
      }

      // Prepare location data
      const locationData: CustomerLocationData = {
        appointmentId,
      };

      // Add coordinates if available
      if (options.coordinates) {
        locationData.latitude = options.coordinates.latitude;
        locationData.longitude = options.coordinates.longitude;
      }

      // Add zip code if available
      if (options.zipCode) {
        locationData.zipCode = options.zipCode;
      }

      // Calculate distance to business if requested and coordinates are available
      if (options.calculateDistance && options.coordinates) {
        try {
          const businessLocation =
            await businessLocationRepository.getByBusinessId(businessId);

          if (businessLocation) {
            const distance = calculateDistance(
              {
                latitude: options.coordinates.latitude,
                longitude: options.coordinates.longitude,
              },
              {
                latitude: businessLocation.latitude,
                longitude: businessLocation.longitude,
              },
            );

            locationData.distanceToBusiness = Math.round(distance * 100) / 100; // Round to 2 decimal places
          }
        } catch (error) {
          // Don't fail location tracking if distance calculation fails
          console.warn("Failed to calculate distance to business:", error);
        }
      }

      // Only create record if we have meaningful location data
      if (
        locationData.latitude ||
        locationData.longitude ||
        locationData.zipCode
      ) {
        const result = await customerLocationRepository.create(locationData);

        return {
          success: true,
          locationId: result?.id || "",
          distance: locationData.distanceToBusiness,
          message: "Location tracked successfully",
        };
      }

      return {
        success: true,
        message: "No location data to track",
      };
    } catch (error) {
      console.error("Failed to track customer location:", error);

      return {
        success: false,
        message: "Failed to track location",
      };
    }
  }

  /**
   * Get location analytics for a business
   */
  async getBusinessLocationAnalytics(businessId: string) {
    try {
      return await customerLocationRepository.getLocationAnalytics(businessId);
    } catch (error) {
      console.error("Failed to get location analytics:", error);
      throw new Error("Failed to retrieve location analytics");
    }
  }

  /**
   * Get heat map data for a business (privacy-compliant)
   */
  async getBusinessHeatMapData(businessId: string) {
    try {
      return await customerLocationRepository.getHeatMapData(businessId);
    } catch (error) {
      console.error("Failed to get heat map data:", error);
      throw new Error("Failed to retrieve heat map data");
    }
  }

  /**
   * Extract zip code from customer location or address
   */
  extractZipCode(
    address?: string,
    coordinates?: { latitude: number; longitude: number },
  ): string | undefined {
    if (address) {
      // Simple regex to extract US zip codes (5 digits or 5+4 format)
      const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/);
      return zipMatch ? zipMatch[0] : undefined;
    }

    // For coordinates, we would need reverse geocoding to get zip code
    // This would be implemented in a separate service
    return undefined;
  }

  /**
   * Validate location consent and data
   */
  validateLocationTracking(options: LocationTrackingOptions): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if coordinates are valid
    if (options.coordinates) {
      const { latitude, longitude } = options.coordinates;

      if (latitude < -90 || latitude > 90) {
        errors.push("Invalid latitude: must be between -90 and 90");
      }

      if (longitude < -180 || longitude > 180) {
        errors.push("Invalid longitude: must be between -180 and 180");
      }
    }

    // Check zip code format (US format)
    if (options.zipCode && !/^\d{5}(?:-\d{4})?$/.test(options.zipCode)) {
      errors.push("Invalid zip code format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const customerLocationService = new CustomerLocationService();
