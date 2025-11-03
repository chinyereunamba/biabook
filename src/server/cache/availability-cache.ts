import { revalidateTag, unstable_cache } from "next/cache";
import type {
  AvailabilitySlot,
  AvailabilityOptions,
} from "@/server/repositories/availability-calculation";

export interface CacheKey {
  businessId: string;
  serviceId?: string;
  startDate: string;
  days: number;
  slotDuration: number;
  bufferTime: number;
}

export interface CachedAvailability {
  data: AvailabilitySlot[];
  cachedAt: number;
  expiresAt: number;
}

/**
 * Availability caching service for improved performance
 * Caches calculated time slots and provides cache invalidation
 */
export class AvailabilityCacheService {
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly CACHE_KEY_PREFIX = "availability";

  /**
   * Generate a cache key for availability data
   */
  private generateCacheKey(key: CacheKey): string {
    const parts = [
      this.CACHE_KEY_PREFIX,
      key.businessId,
      key.serviceId || "all",
      key.startDate,
      key.days.toString(),
      key.slotDuration.toString(),
      key.bufferTime.toString(),
    ];
    return parts.join(":");
  }

  /**
   * Generate cache tags for invalidation
   */
  private generateCacheTags(businessId: string, serviceId?: string): string[] {
    const tags = [`availability:${businessId}`, `business:${businessId}`];

    if (serviceId) {
      tags.push(`service:${serviceId}`);
    }

    return tags;
  }

  /**
   * Get cached availability with Next.js cache
   */
  getCachedAvailability = unstable_cache(
    async (
      businessId: string,
      serviceId: string | undefined,
      options: AvailabilityOptions,
      calculationFn: () => Promise<AvailabilitySlot[]>,
    ): Promise<AvailabilitySlot[]> => {
      // Execute the calculation function
      return await calculationFn();
    },
    [this.CACHE_KEY_PREFIX], // cache key prefix
    {
      revalidate: 300, // 5 minutes
      tags: [], // will be set dynamically
    },
  );

  /**
   * Create a cached version of the availability calculation
   */
  createCachedCalculation(
    calculationFn: (
      businessId: string,
      serviceId?: string,
      options?: AvailabilityOptions,
    ) => Promise<AvailabilitySlot[]>,
  ) {
    return async (
      businessId: string,
      serviceId?: string,
      options: AvailabilityOptions = {},
    ): Promise<AvailabilitySlot[]> => {
      // Generate cache key components
      const cacheKey: CacheKey = {
        businessId,
        serviceId,
        startDate: options.startDate || this.getTodayString(),
        days: options.days || 7,
        slotDuration: options.slotDuration || 60,
        bufferTime: options.bufferTime || 0,
      };

      // Generate cache tags for invalidation
      const tags = this.generateCacheTags(businessId, serviceId);

      // Create a cached version with dynamic tags
      const cachedFn = unstable_cache(
        async () => {
          console.time(`availability-calculation-${businessId}`);
          const result = await calculationFn(businessId, serviceId, options);
          console.timeEnd(`availability-calculation-${businessId}`);
          return result;
        },
        [this.generateCacheKey(cacheKey)],
        {
          revalidate: 300, // 5 minutes
          tags,
        },
      );

      return await cachedFn();
    };
  }

  /**
   * Invalidate cache for a specific business
   */
  async invalidateBusinessCache(businessId: string): Promise<void> {
    try {
      revalidateTag(`availability:${businessId}`);
      revalidateTag(`business:${businessId}`);
      console.log(`Cache invalidated for business: ${businessId}`);
    } catch (error) {
      console.error(
        `Failed to invalidate cache for business ${businessId}:`,
        error,
      );
    }
  }

  /**
   * Invalidate cache for a specific service
   */
  async invalidateServiceCache(
    serviceId: string,
    businessId: string,
  ): Promise<void> {
    try {
      revalidateTag(`service:${serviceId}`);
      revalidateTag(`availability:${businessId}`);
      revalidateTag(`business:${businessId}`);
      console.log(`Cache invalidated for service: ${serviceId}`);
    } catch (error) {
      console.error(
        `Failed to invalidate cache for service ${serviceId}:`,
        error,
      );
    }
  }

  /**
   * Invalidate all availability cache
   */
  async invalidateAllCache(): Promise<void> {
    try {
      revalidateTag(this.CACHE_KEY_PREFIX);
      console.log("All availability cache invalidated");
    } catch (error) {
      console.error("Failed to invalidate all availability cache:", error);
    }
  }

  /**
   * Warm up cache for a business
   * Pre-calculates and caches availability for common scenarios
   */
  async warmUpCache(
    businessId: string,
    calculationFn: (
      businessId: string,
      serviceId?: string,
      options?: AvailabilityOptions,
    ) => Promise<AvailabilitySlot[]>,
  ): Promise<void> {
    try {
      console.log(`Warming up cache for business: ${businessId}`);

      // Get business services for cache warming
      const { db } = await import("@/server/db");
      const { services } = await import("@/server/db/schema");
      const { eq } = await import("drizzle-orm");

      const businessServices = await db.query.services.findMany({
        where: eq(services.businessId, businessId),
        columns: { id: true, duration: true, bufferTime: true },
      });

      // Common cache scenarios to warm up
      const scenarios: Array<{ serviceId: string | undefined; days: number }> =
        [
          // General availability (no specific service)
          { serviceId: undefined, days: 7 },
          { serviceId: undefined, days: 14 },
          { serviceId: undefined, days: 30 },
        ];

      // Add service-specific scenarios
      businessServices.forEach((service) => {
        scenarios.push(
          { serviceId: service.id, days: 7 },
          { serviceId: service.id, days: 14 },
        );
      });

      // Execute cache warming in parallel (but limit concurrency)
      const batchSize = 3;
      for (let i = 0; i < scenarios.length; i += batchSize) {
        const batch = scenarios.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (scenario) => {
            try {
              const options: AvailabilityOptions = {
                days: scenario.days,
                startDate: this.getTodayString(),
              };

              if (scenario.serviceId) {
                const service = businessServices.find(
                  (s) => s.id === scenario.serviceId,
                );
                if (service) {
                  options.slotDuration = service.duration;
                  options.bufferTime = service.bufferTime || 0;
                }
              }

              await calculationFn(businessId, scenario.serviceId, options);
            } catch (error) {
              console.error(
                `Failed to warm cache for scenario:`,
                scenario,
                error,
              );
            }
          }),
        );
      }

      console.log(`Cache warmed up for business: ${businessId}`);
    } catch (error) {
      console.error(
        `Failed to warm up cache for business ${businessId}:`,
        error,
      );
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(businessId: string): Promise<{
    businessId: string;
    cacheHits: number;
    cacheMisses: number;
    lastInvalidation: number | null;
  }> {
    // This is a placeholder for cache statistics
    // In a production environment, you might want to use Redis or another cache store
    // that provides detailed statistics
    return {
      businessId,
      cacheHits: 0, // Would be tracked by cache implementation
      cacheMisses: 0, // Would be tracked by cache implementation
      lastInvalidation: null, // Would be tracked by cache implementation
    };
  }

  /**
   * Get today's date string
   */
  private getTodayString(): string {
    return new Date().toISOString().split("T")[0]!;
  }

  /**
   * Check if cache should be bypassed (for debugging/testing)
   */
  private shouldBypassCache(): boolean {
    return process.env.BYPASS_AVAILABILITY_CACHE === "true";
  }
}

// Export singleton instance
export const availabilityCacheService = new AvailabilityCacheService();
