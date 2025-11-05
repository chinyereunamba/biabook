/**
 * Business location repository for managing business location data in the database
 */

import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { businessLocations } from "@/server/db/schema";
import type { BusinessLocationModel } from "@/types/location";

export interface BusinessLocationData {
  businessId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  serviceRadius?: number;
}

export class BusinessLocationRepository {
  /**
   * Creates or updates a business location
   */
  async upsert(data: BusinessLocationData): Promise<BusinessLocationModel> {
    const now = new Date();

    try {
      // Check if location already exists
      const existing = await this.getByBusinessId(data.businessId);

      if (existing) {
        // Update existing location
        const updated = await db
          .update(businessLocations)
          .set({
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone,
            serviceRadius: data.serviceRadius,
            updatedAt: now,
          })
          .where(eq(businessLocations.businessId, data.businessId))
          .returning();

        if (!updated.length) {
          throw new Error("Failed to update business location");
        }

        return this.mapToModel(updated[0]!);
      } else {
        // Create new location
        const created = await db
          .insert(businessLocations)
          .values({
            businessId: data.businessId,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone,
            serviceRadius: data.serviceRadius,
          })
          .returning();

        if (!created.length) {
          throw new Error("Failed to create business location");
        }

        return this.mapToModel(created[0]!);
      }
    } catch (error) {
      console.error("Failed to upsert business location:", error);
      throw new Error(
        `Failed to save business location: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Gets business location by business ID
   */
  async getByBusinessId(
    businessId: string,
  ): Promise<BusinessLocationModel | null> {
    try {
      const result = await db
        .select()
        .from(businessLocations)
        .where(eq(businessLocations.businessId, businessId))
        .limit(1);

      if (!result.length) {
        return null;
      }

      return this.mapToModel(result[0]!);
    } catch (error) {
      console.error("Failed to get business location:", error);
      return null;
    }
  }

  /**
   * Gets business location by location ID
   */
  async getById(id: string): Promise<BusinessLocationModel | null> {
    try {
      const result = await db
        .select()
        .from(businessLocations)
        .where(eq(businessLocations.id, id))
        .limit(1);

      if (!result.length) {
        return null;
      }

      return this.mapToModel(result[0]!);
    } catch (error) {
      console.error("Failed to get business location by ID:", error);
      return null;
    }
  }

  /**
   * Updates service radius for a business
   */
  async updateServiceRadius(
    businessId: string,
    radius: number | undefined,
  ): Promise<void> {
    try {
      await db
        .update(businessLocations)
        .set({
          serviceRadius: radius,
          updatedAt: new Date(),
        })
        .where(eq(businessLocations.businessId, businessId));
    } catch (error) {
      console.error("Failed to update service radius:", error);
      throw new Error(
        `Failed to update service radius: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Deletes business location
   */
  async delete(businessId: string): Promise<void> {
    try {
      await db
        .delete(businessLocations)
        .where(eq(businessLocations.businessId, businessId));
    } catch (error) {
      console.error("Failed to delete business location:", error);
      throw new Error(
        `Failed to delete business location: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Gets all business locations within a bounding box
   */
  async getWithinBounds(
    northEast: { latitude: number; longitude: number },
    southWest: { latitude: number; longitude: number },
  ): Promise<BusinessLocationModel[]> {
    try {
      const result = await db
        .select()
        .from(businessLocations)
        .where(
          // Simple bounding box query - for production, consider using spatial indexes
          // latitude BETWEEN southWest.latitude AND northEast.latitude
          // AND longitude BETWEEN southWest.longitude AND northEast.longitude
          `latitude BETWEEN ${southWest.latitude} AND ${northEast.latitude} 
           AND longitude BETWEEN ${southWest.longitude} AND ${northEast.longitude}` as any,
        );

      return result.map((row) => this.mapToModel(row));
    } catch (error) {
      console.error("Failed to get business locations within bounds:", error);
      return [];
    }
  }

  /**
   * Gets business locations by ZIP code
   */
  async getByZipCode(zipCode: string): Promise<BusinessLocationModel[]> {
    try {
      const result = await db
        .select()
        .from(businessLocations)
        .where(eq(businessLocations.zipCode, zipCode));

      return result.map((row) => this.mapToModel(row));
    } catch (error) {
      console.error("Failed to get business locations by ZIP code:", error);
      return [];
    }
  }

  /**
   * Gets business locations by city and state
   */
  async getByCityState(
    city: string,
    state: string,
  ): Promise<BusinessLocationModel[]> {
    try {
      const result = await db
        .select()
        .from(businessLocations)
        .where(`city = '${city}' AND state = '${state}'` as any);

      return result.map((row) => this.mapToModel(row));
    } catch (error) {
      console.error("Failed to get business locations by city/state:", error);
      return [];
    }
  }

  /**
   * Maps database row to BusinessLocationModel
   */
  private mapToModel(row: any): BusinessLocationModel {
    return {
      id: row.id,
      businessId: row.businessId,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zipCode,
      country: row.country,
      latitude: row.latitude,
      longitude: row.longitude,
      timezone: row.timezone,
      serviceRadius: row.serviceRadius,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}

// Export singleton instance
export const businessLocationRepository = new BusinessLocationRepository();
