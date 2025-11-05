/**
 * Proximity Search Service
 * Handles location-based business search with distance filtering and sorting
 */

import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  businesses,
  businessLocations,
  categories,
  services,
} from "@/server/db/schema";
import {
  calculateDistance,
  calculateDistanceWithTime,
  createBoundingBox,
  sortByDistance,
  filterByRadius,
  validateCoordinates,
  type Coordinates,
  type BoundingBox,
  type DistanceResult,
} from "@/lib/distance-utils";

export interface SearchFilters {
  radius: number; // in miles
  services?: string[];
  categoryId?: string;
  priceRange?: [number, number]; // in cents
  rating?: number;
  sortBy: "distance" | "rating" | "price" | "name";
  limit?: number;
  offset?: number;
}

export interface BusinessSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  categoryId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date | null;
  // Location data
  businessLocation: {
    id: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    serviceRadius: number | null;
  };
  // Category data
  category: {
    id: string;
    name: string;
  };
  // Distance data
  distance: number;
  estimatedTravelTime: number;
  // Service data (optional)
  services?: Array<{
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    category: string | null;
  }>;
}

export interface ProximitySearchOptions {
  includeServices?: boolean;
  validateServiceRadius?: boolean;
}

export class ProximitySearchService {
  /**
   * Search for businesses near a location with filters
   */
  async searchNearby(
    location: Coordinates,
    filters: SearchFilters,
    options: ProximitySearchOptions = {},
  ): Promise<BusinessSearchResult[]> {
    if (!validateCoordinates(location)) {
      throw new Error("Invalid coordinates provided");
    }

    // Create bounding box for initial filtering
    const boundingBox = createBoundingBox(location, filters.radius);

    // Build the base query
    let query = db
      .select({
        // Business fields
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        location: businesses.location,
        phone: businesses.phone,
        email: businesses.email,
        categoryId: businesses.categoryId,
        ownerId: businesses.ownerId,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        // Business location fields
        businessLocation: {
          id: businessLocations.id,
          address: businessLocations.address,
          city: businessLocations.city,
          state: businessLocations.state,
          zipCode: businessLocations.zipCode,
          country: businessLocations.country,
          latitude: businessLocations.latitude,
          longitude: businessLocations.longitude,
          timezone: businessLocations.timezone,
          serviceRadius: businessLocations.serviceRadius,
        },
        // Category fields
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(businesses)
      .innerJoin(
        businessLocations,
        eq(businesses.id, businessLocations.businessId),
      )
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .where(
        and(
          // Bounding box filter for performance
          gte(businessLocations.latitude, boundingBox.south),
          lte(businessLocations.latitude, boundingBox.north),
          gte(businessLocations.longitude, boundingBox.west),
          lte(businessLocations.longitude, boundingBox.east),
          // Category filter
          filters.categoryId
            ? eq(businesses.categoryId, filters.categoryId)
            : undefined,
        ),
      );

    // Execute the query
    const results = await query;

    // Calculate distances and filter by exact radius
    let businessesWithDistance = results
      .map((business) => {
        const businessCoords: Coordinates = {
          latitude: business.businessLocation.latitude,
          longitude: business.businessLocation.longitude,
        };

        const distanceResult = calculateDistanceWithTime(
          location,
          businessCoords,
        );

        return {
          ...business,
          distance: distanceResult.distance,
          estimatedTravelTime: distanceResult.estimatedTravelTime || 0,
          category: business.category || { id: "", name: "Uncategorized" },
        };
      })
      .filter((business) => {
        // Filter by exact radius
        if (business.distance > filters.radius) {
          return false;
        }

        // Validate service radius if requested
        if (
          options.validateServiceRadius &&
          business.businessLocation.serviceRadius
        ) {
          return business.distance <= business.businessLocation.serviceRadius;
        }

        return true;
      });

    // Apply sorting
    businessesWithDistance = this.sortResults(
      businessesWithDistance,
      filters.sortBy,
    );

    // Apply pagination
    if (filters.offset) {
      businessesWithDistance = businessesWithDistance.slice(filters.offset);
    }
    if (filters.limit) {
      businessesWithDistance = businessesWithDistance.slice(0, filters.limit);
    }

    // Include services if requested
    if (options.includeServices) {
      return await this.includeServices(businessesWithDistance);
    }

    return businessesWithDistance;
  }

  /**
   * Get businesses within a specific radius
   */
  async getBusinessesInRadius(
    center: Coordinates,
    radiusMiles: number,
    options: ProximitySearchOptions = {},
  ): Promise<BusinessSearchResult[]> {
    const filters: SearchFilters = {
      radius: radiusMiles,
      sortBy: "distance",
    };

    return this.searchNearby(center, filters, options);
  }

  /**
   * Validate if a customer location is within a business's service area
   */
  async validateServiceArea(
    businessId: string,
    customerLocation: Coordinates,
  ): Promise<{
    isValid: boolean;
    distance: number;
    serviceRadius: number | null;
  }> {
    if (!validateCoordinates(customerLocation)) {
      throw new Error("Invalid customer coordinates provided");
    }

    // Get business location
    const businessLocationResult = await db
      .select({
        latitude: businessLocations.latitude,
        longitude: businessLocations.longitude,
        serviceRadius: businessLocations.serviceRadius,
      })
      .from(businessLocations)
      .where(eq(businessLocations.businessId, businessId))
      .limit(1);

    if (businessLocationResult.length === 0) {
      throw new Error("Business location not found");
    }

    const businessLocation = businessLocationResult[0];
    if (!businessLocation) {
      throw new Error("Business location not found");
    }

    const businessCoords: Coordinates = {
      latitude: businessLocation.latitude,
      longitude: businessLocation.longitude,
    };

    const distance = calculateDistance(customerLocation, businessCoords);

    // If no service radius is set, all locations are valid
    if (!businessLocation.serviceRadius) {
      return {
        isValid: true,
        distance,
        serviceRadius: null,
      };
    }

    return {
      isValid: distance <= businessLocation.serviceRadius,
      distance,
      serviceRadius: businessLocation.serviceRadius,
    };
  }

  /**
   * Find alternative businesses when customer is outside service area
   */
  async findAlternativeBusinesses(
    customerLocation: Coordinates,
    originalBusinessId: string,
    maxRadius: number = 50,
  ): Promise<BusinessSearchResult[]> {
    // Get the original business category to find similar businesses
    const originalBusiness = await db
      .select({
        categoryId: businesses.categoryId,
      })
      .from(businesses)
      .where(eq(businesses.id, originalBusinessId))
      .limit(1);

    if (originalBusiness.length === 0) {
      throw new Error("Original business not found");
    }

    const business = originalBusiness[0];
    if (!business) {
      throw new Error("Original business not found");
    }

    const filters: SearchFilters = {
      radius: maxRadius,
      categoryId: business.categoryId,
      sortBy: "distance",
      limit: 10,
    };

    const alternatives = await this.searchNearby(customerLocation, filters, {
      validateServiceRadius: true,
    });

    // Exclude the original business from alternatives
    return alternatives.filter(
      (business) => business.id !== originalBusinessId,
    );
  }

  /**
   * Search businesses by address or zip code
   */
  async searchByAddress(
    address: string,
    filters: Omit<SearchFilters, "radius"> & { radius?: number },
    options: ProximitySearchOptions = {},
  ): Promise<BusinessSearchResult[]> {
    // This would typically use a geocoding service to convert address to coordinates
    // For now, we'll search by zip code if it looks like one
    const zipCodeMatch = address.match(/\b\d{5}(-\d{4})?\b/);

    if (zipCodeMatch) {
      return this.searchByZipCode(zipCodeMatch[0], filters, options);
    }

    throw new Error(
      "Address geocoding not implemented. Please provide coordinates or zip code.",
    );
  }

  /**
   * Search businesses by zip code
   */
  async searchByZipCode(
    zipCode: string,
    filters: Omit<SearchFilters, "radius"> & { radius?: number },
    options: ProximitySearchOptions = {},
  ): Promise<BusinessSearchResult[]> {
    const radius = filters.radius || 25; // Default 25 mile radius

    // Find businesses in the same zip code first
    const sameZipResults = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        location: businesses.location,
        phone: businesses.phone,
        email: businesses.email,
        categoryId: businesses.categoryId,
        ownerId: businesses.ownerId,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        businessLocation: {
          id: businessLocations.id,
          address: businessLocations.address,
          city: businessLocations.city,
          state: businessLocations.state,
          zipCode: businessLocations.zipCode,
          country: businessLocations.country,
          latitude: businessLocations.latitude,
          longitude: businessLocations.longitude,
          timezone: businessLocations.timezone,
          serviceRadius: businessLocations.serviceRadius,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(businesses)
      .innerJoin(
        businessLocations,
        eq(businesses.id, businessLocations.businessId),
      )
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .where(
        and(
          eq(businessLocations.zipCode, zipCode),
          filters.categoryId
            ? eq(businesses.categoryId, filters.categoryId)
            : undefined,
        ),
      );

    // For zip code searches, we'll use the first business location as reference point
    // or use a zip code centroid lookup service
    if (sameZipResults.length > 0) {
      const firstResult = sameZipResults[0];
      if (!firstResult) {
        return [];
      }

      const referencePoint: Coordinates = {
        latitude: firstResult.businessLocation.latitude,
        longitude: firstResult.businessLocation.longitude,
      };

      // Add distance calculations
      const resultsWithDistance = sameZipResults.map((business) => {
        const businessCoords: Coordinates = {
          latitude: business.businessLocation.latitude,
          longitude: business.businessLocation.longitude,
        };

        const distanceResult = calculateDistanceWithTime(
          referencePoint,
          businessCoords,
        );

        return {
          ...business,
          distance: distanceResult.distance,
          estimatedTravelTime: distanceResult.estimatedTravelTime || 0,
          category: business.category || { id: "", name: "Uncategorized" },
        };
      });

      const sortedResults = this.sortResults(
        resultsWithDistance,
        filters.sortBy,
      );

      if (options.includeServices) {
        return await this.includeServices(sortedResults);
      }

      return sortedResults;
    }

    return [];
  }

  /**
   * Sort search results based on criteria
   */
  private sortResults(
    results: BusinessSearchResult[],
    sortBy: SearchFilters["sortBy"],
  ): BusinessSearchResult[] {
    switch (sortBy) {
      case "distance":
        return results.sort((a, b) => a.distance - b.distance);
      case "name":
        return results.sort((a, b) => a.name.localeCompare(b.name));
      case "rating":
        // TODO: Implement rating sorting when rating system is added
        return results.sort((a, b) => a.distance - b.distance);
      case "price":
        // TODO: Implement price sorting based on average service prices
        return results.sort((a, b) => a.distance - b.distance);
      default:
        return results;
    }
  }

  /**
   * Include services data for businesses
   */
  private async includeServices(
    businesses: BusinessSearchResult[],
  ): Promise<BusinessSearchResult[]> {
    if (businesses.length === 0) {
      return businesses;
    }

    const businessIds = businesses.map((b) => b.id);

    // Get all active services for these businesses
    const businessServices = await db
      .select({
        id: services.id,
        businessId: services.businessId,
        name: services.name,
        description: services.description,
        duration: services.duration,
        price: services.price,
        category: services.category,
      })
      .from(services)
      .where(
        and(
          sql`${services.businessId} IN ${businessIds}`,
          eq(services.isActive, true),
        ),
      );

    // Group services by business ID
    const servicesByBusiness = businessServices.reduce(
      (acc, service) => {
        if (!acc[service.businessId]) {
          acc[service.businessId] = [];
        }
        const businessServices = acc[service.businessId];
        if (businessServices) {
          businessServices.push({
            id: service.id,
            name: service.name,
            description: service.description,
            duration: service.duration,
            price: service.price,
            category: service.category,
          });
        }
        return acc;
      },
      {} as Record<string, BusinessSearchResult["services"]>,
    );

    // Add services to businesses
    return businesses.map((business) => ({
      ...business,
      services: servicesByBusiness[business.id] || [],
    }));
  }
}

// Export singleton instance
export const proximitySearchService = new ProximitySearchService();
