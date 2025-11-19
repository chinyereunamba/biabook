/**
 * Service Radius Validation Service
 * Handles validation of customer locations against business service areas
 */

import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { businesses, businessLocations } from "@/server/db/schema";
import {
  calculateDistance,
  validateCoordinateBounds,
  type Coordinates,
} from "@/lib/coordinate-utils";

// Wrapper for backward compatibility
function validateCoordinates(coordinates: Coordinates): boolean {
  try {
    validateCoordinateBounds(coordinates.latitude, coordinates.longitude);
    return true;
  } catch {
    return false;
  }
}
import { proximitySearchService } from "./proximity-search-service";

export interface ServiceAreaValidationResult {
  isValid: boolean;
  distance: number;
  serviceRadius: number | null;
  businessName: string;
  businessLocation: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  alternatives?: Array<{
    id: string;
    name: string;
    distance: number;
    estimatedTravelTime: number;
  }>;
}

export interface ValidationOptions {
  includeAlternatives?: boolean;
  maxAlternativeRadius?: number;
  maxAlternatives?: number;
}

export class ServiceRadiusValidationService {
  /**
   * Validate if a customer location is within a business's service area
   * and optionally provide alternative businesses
   */
  async validateBookingLocation(
    businessId: string,
    customerLocation: Coordinates,
    options: ValidationOptions = {},
  ): Promise<ServiceAreaValidationResult> {
    if (!validateCoordinates(customerLocation)) {
      throw new Error("Invalid customer coordinates provided");
    }

    // Get business and location information
    const businessData = await db
      .select({
        businessId: businesses.id,
        businessName: businesses.name,
        address: businessLocations.address,
        city: businessLocations.city,
        state: businessLocations.state,
        zipCode: businessLocations.zipCode,
        latitude: businessLocations.latitude,
        longitude: businessLocations.longitude,
        serviceRadius: businessLocations.serviceRadius,
      })
      .from(businesses)
      .innerJoin(
        businessLocations,
        eq(businesses.id, businessLocations.businessId),
      )
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (businessData.length === 0) {
      throw new Error("Business not found or location not configured");
    }

    const business = businessData[0];
    if (!business) {
      throw new Error("Business not found or location not configured");
    }

    const businessCoords: Coordinates = {
      latitude: business.latitude,
      longitude: business.longitude,
    };

    const distance = calculateDistance(customerLocation, businessCoords);

    // Check if customer is within service radius
    const isValid =
      business.serviceRadius === null || distance <= business.serviceRadius;

    const result: ServiceAreaValidationResult = {
      isValid,
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      serviceRadius: business.serviceRadius,
      businessName: business.businessName,
      businessLocation: {
        address: business.address,
        city: business.city,
        state: business.state,
        zipCode: business.zipCode,
      },
    };

    // Include alternatives if requested and customer is outside service area
    if (options.includeAlternatives && !isValid) {
      const alternatives = await this.findAlternativeBusinesses(
        customerLocation,
        businessId,
        options.maxAlternativeRadius || 50,
        options.maxAlternatives || 5,
      );

      result.alternatives = alternatives.map((alt) => ({
        id: alt.id,
        name: alt.name,
        distance: alt.distance,
        estimatedTravelTime: alt.estimatedTravelTime,
      }));
    }

    return result;
  }

  /**
   * Validate service area before appointment creation
   */
  async validateBeforeBooking(
    businessId: string,
    customerLocation: Coordinates,
  ): Promise<{
    canBook: boolean;
    message: string;
    distance: number;
    serviceRadius: number | null;
  }> {
    const validation = await this.validateBookingLocation(
      businessId,
      customerLocation,
    );

    if (validation.isValid) {
      return {
        canBook: true,
        message: `You are ${validation.distance} miles from ${validation.businessName}`,
        distance: validation.distance,
        serviceRadius: validation.serviceRadius,
      };
    }

    const radiusText = validation.serviceRadius
      ? `${validation.serviceRadius} miles`
      : "unlimited";

    return {
      canBook: false,
      message: `You are ${validation.distance} miles from ${validation.businessName}, which is outside their ${radiusText} service area.`,
      distance: validation.distance,
      serviceRadius: validation.serviceRadius,
    };
  }

  /**
   * Check multiple businesses for service area coverage
   */
  async validateMultipleBusinesses(
    businessIds: string[],
    customerLocation: Coordinates,
  ): Promise<Record<string, ServiceAreaValidationResult>> {
    const results: Record<string, ServiceAreaValidationResult> = {};

    // Process validations in parallel
    const validationPromises = businessIds.map(async (businessId) => {
      try {
        const result = await this.validateBookingLocation(
          businessId,
          customerLocation,
        );
        return { businessId, result };
      } catch (error) {
        return {
          businessId,
          result: {
            isValid: false,
            distance: 0,
            serviceRadius: null,
            businessName: "Unknown",
            businessLocation: {
              address: "",
              city: "",
              state: "",
              zipCode: "",
            },
          } as ServiceAreaValidationResult,
        };
      }
    });

    const validationResults = await Promise.all(validationPromises);

    validationResults.forEach(({ businessId, result }) => {
      results[businessId] = result;
    });

    return results;
  }

  /**
   * Find alternative businesses when customer is outside service area
   */
  private async findAlternativeBusinesses(
    customerLocation: Coordinates,
    originalBusinessId: string,
    maxRadius: number,
    maxResults: number,
  ) {
    try {
      const alternatives =
        await proximitySearchService.findAlternativeBusinesses(
          customerLocation,
          originalBusinessId,
          maxRadius,
        );

      return alternatives.slice(0, maxResults);
    } catch (error) {
      console.error("Error finding alternative businesses:", error);
      return [];
    }
  }

  /**
   * Get service area coverage statistics for a business
   */
  async getServiceAreaStats(businessId: string): Promise<{
    serviceRadius: number | null;
    hasUnlimitedRadius: boolean;
    coverageArea: number; // in square miles
    businessLocation: {
      latitude: number;
      longitude: number;
      address: string;
      city: string;
      state: string;
    };
  }> {
    const businessData = await db
      .select({
        address: businessLocations.address,
        city: businessLocations.city,
        state: businessLocations.state,
        latitude: businessLocations.latitude,
        longitude: businessLocations.longitude,
        serviceRadius: businessLocations.serviceRadius,
      })
      .from(businessLocations)
      .where(eq(businessLocations.businessId, businessId))
      .limit(1);

    if (businessData.length === 0) {
      throw new Error("Business location not found");
    }

    const business = businessData[0];
    if (!business) {
      throw new Error("Business location not found");
    }

    const hasUnlimitedRadius = business.serviceRadius === null;
    const coverageArea = hasUnlimitedRadius
      ? Infinity
      : Math.PI * Math.pow(business.serviceRadius!, 2);

    return {
      serviceRadius: business.serviceRadius,
      hasUnlimitedRadius,
      coverageArea,
      businessLocation: {
        latitude: business.latitude,
        longitude: business.longitude,
        address: business.address,
        city: business.city,
        state: business.state,
      },
    };
  }

  /**
   * Update business service radius
   */
  async updateServiceRadius(
    businessId: string,
    serviceRadius: number | null,
  ): Promise<void> {
    await db
      .update(businessLocations)
      .set({
        serviceRadius,
        updatedAt: new Date(),
      })
      .where(eq(businessLocations.businessId, businessId));
  }

  /**
   * Validate service radius value
   */
  validateServiceRadiusValue(radius: number | null): {
    isValid: boolean;
    message?: string;
  } {
    if (radius === null) {
      return { isValid: true }; // Unlimited radius is valid
    }

    if (typeof radius !== "number" || isNaN(radius)) {
      return {
        isValid: false,
        message: "Service radius must be a number or null for unlimited",
      };
    }

    if (radius < 0) {
      return {
        isValid: false,
        message: "Service radius cannot be negative",
      };
    }

    if (radius > 500) {
      return {
        isValid: false,
        message: "Service radius cannot exceed 500 miles",
      };
    }

    return { isValid: true };
  }

  /**
   * Get businesses that can serve a specific location
   */
  async getBusinessesServingLocation(
    location: Coordinates,
    categoryId?: string,
    maxRadius: number = 100,
  ) {
    const searchResults = await proximitySearchService.searchNearby(
      location,
      {
        radius: maxRadius,
        categoryId,
        sortBy: "distance",
      },
      {
        validateServiceRadius: true,
      },
    );

    return searchResults.filter((business) => {
      // If business has no service radius, it serves all locations
      if (!business.businessLocation.serviceRadius) {
        return true;
      }
      // Otherwise, check if location is within service radius
      return business.distance <= business.businessLocation.serviceRadius;
    });
  }
}

// Export singleton instance
export const serviceRadiusValidationService =
  new ServiceRadiusValidationService();
