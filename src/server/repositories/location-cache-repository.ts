/**
 * Location cache repository for managing geocoding cache in the database
 */

import { eq, lt } from "drizzle-orm";
import { db } from "@/server/db";
import { locationCache } from "@/server/db/schema";
import type { LocationCacheModel, Coordinates } from "@/types/location";
import { createHash } from "crypto";

export interface LocationCacheEntry {
  coordinates: Coordinates;
  timezone: string;
  expiresAt: Date;
}

export class LocationCacheRepository {
  /**
   * Creates a hash for an address to use as cache key
   */
  private createAddressHash(address: string): string {
    return createHash("sha256")
      .update(address.toLowerCase().trim())
      .digest("hex");
  }

  /**
   * Gets cached location data for an address
   */
  async get(address: string): Promise<LocationCacheEntry | null> {
    const addressHash = this.createAddressHash(address);

    try {
      const cached = await db
        .select()
        .from(locationCache)
        .where(eq(locationCache.addressHash, addressHash))
        .limit(1);

      if (!cached.length) {
        return null;
      }

      const entry = cached[0]!;

      // Check if entry has expired
      if (entry.expiresAt < new Date()) {
        // Delete expired entry
        await this.delete(address);
        return null;
      }

      return {
        coordinates: {
          latitude: entry.latitude,
          longitude: entry.longitude,
        },
        timezone: entry.timezone,
        expiresAt: entry.expiresAt,
      };
    } catch (error) {
      console.error("Failed to get location cache entry:", error);
      return null;
    }
  }

  /**
   * Sets cached location data for an address
   */
  async set(
    address: string,
    coordinates: Coordinates,
    timezone: string,
    expiresAt: Date,
  ): Promise<void> {
    const addressHash = this.createAddressHash(address);

    try {
      await db
        .insert(locationCache)
        .values({
          addressHash,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          timezone,
          expiresAt,
        })
        .onConflictDoUpdate({
          target: locationCache.addressHash,
          set: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            timezone,
            expiresAt,
          },
        });
    } catch (error) {
      console.error("Failed to set location cache entry:", error);
      // Don't throw error - caching is not critical
    }
  }

  /**
   * Deletes cached location data for an address
   */
  async delete(address: string): Promise<void> {
    const addressHash = this.createAddressHash(address);

    try {
      await db
        .delete(locationCache)
        .where(eq(locationCache.addressHash, addressHash));
    } catch (error) {
      console.error("Failed to delete location cache entry:", error);
    }
  }

  /**
   * Clears all expired cache entries
   */
  async clearExpired(): Promise<number> {
    try {
      const result = await db
        .delete(locationCache)
        .where(lt(locationCache.expiresAt, new Date()));

      return result.rowsAffected || 0;
    } catch (error) {
      console.error("Failed to clear expired location cache entries:", error);
      return 0;
    }
  }

  /**
   * Gets cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
  }> {
    try {
      const [total, expired] = await Promise.all([
        db.select({ count: locationCache.id }).from(locationCache),
        db
          .select({ count: locationCache.id })
          .from(locationCache)
          .where(lt(locationCache.expiresAt, new Date())),
      ]);

      return {
        totalEntries: total.length,
        expiredEntries: expired.length,
      };
    } catch (error) {
      console.error("Failed to get location cache stats:", error);
      return {
        totalEntries: 0,
        expiredEntries: 0,
      };
    }
  }

  /**
   * Clears all cache entries (for testing/maintenance)
   */
  async clearAll(): Promise<void> {
    try {
      await db.delete(locationCache);
    } catch (error) {
      console.error("Failed to clear all location cache entries:", error);
    }
  }
}

// Export singleton instance
export const locationCacheRepository = new LocationCacheRepository();
