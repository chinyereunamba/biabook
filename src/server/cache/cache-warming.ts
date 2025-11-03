import { availabilityCalculationEngine } from "@/server/repositories/availability-calculation";
import { db } from "@/server/db";
import { businesses, services } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Cache warming utility for pre-populating availability cache
 * Helps improve performance by calculating and caching availability data
 * for active businesses during off-peak hours
 */
export class CacheWarmingService {
  private isWarming = false;
  private lastWarmingTime = 0;
  private readonly WARMING_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

  /**
   * Warm cache for all active businesses
   */
  async warmAllBusinesses(): Promise<{
    success: boolean;
    businessesWarmed: number;
    errors: string[];
    duration: number;
  }> {
    if (this.isWarming) {
      return {
        success: false,
        businessesWarmed: 0,
        errors: ["Cache warming already in progress"],
        duration: 0,
      };
    }

    const startTime = Date.now();
    this.isWarming = true;
    const errors: string[] = [];
    let businessesWarmed = 0;

    try {
      console.log("Starting cache warming for all businesses...");

      // Get all active businesses
      const activeBusinesses = await db.query.businesses.findMany({
        columns: { id: true, name: true },
      });

      console.log(`Found ${activeBusinesses.length} businesses to warm`);

      // Warm cache for each business (with concurrency limit)
      const batchSize = 3; // Process 3 businesses at a time
      for (let i = 0; i < activeBusinesses.length; i += batchSize) {
        const batch = activeBusinesses.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(async (business) => {
            try {
              await this.warmBusinessCache(business.id);
              businessesWarmed++;
              console.log(
                `Cache warmed for business: ${business.name} (${business.id})`,
              );
            } catch (error) {
              const errorMsg = `Failed to warm cache for business ${business.id}: ${
                error instanceof Error ? error.message : String(error)
              }`;
              errors.push(errorMsg);
              console.error(errorMsg);
            }
          }),
        );

        // Small delay between batches to avoid overwhelming the system
        if (i + batchSize < activeBusinesses.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      this.lastWarmingTime = Date.now();
      console.log(
        `Cache warming completed. Warmed ${businessesWarmed} businesses with ${errors.length} errors`,
      );

      return {
        success: errors.length === 0,
        businessesWarmed,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMsg = `Cache warming failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
      errors.push(errorMsg);
      console.error(errorMsg);

      return {
        success: false,
        businessesWarmed,
        errors,
        duration: Date.now() - startTime,
      };
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Warm cache for a specific business
   */
  async warmBusinessCache(businessId: string): Promise<void> {
    try {
      // Use the availability engine's warm up method
      await availabilityCalculationEngine.warmUpCache(businessId);
    } catch (error) {
      console.error(`Failed to warm cache for business ${businessId}:`, error);
      throw error;
    }
  }

  /**
   * Warm cache for businesses with recent activity
   */
  async warmActiveBusinesses(hoursBack: number = 24): Promise<{
    success: boolean;
    businessesWarmed: number;
    errors: string[];
    duration: number;
  }> {
    const startTime = Date.now();
    const errors: string[] = [];
    let businessesWarmed = 0;

    try {
      // Get businesses with recent appointments
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hoursBack);
      const cutoffDateStr = cutoffDate.toISOString().split("T")[0]!;

      const { appointments } = await import("@/server/db/schema");
      const { gte } = await import("drizzle-orm");

      const activeBusinessIds = await db
        .selectDistinct({ businessId: appointments.businessId })
        .from(appointments)
        .where(gte(appointments.appointmentDate, cutoffDateStr));

      console.log(
        `Found ${activeBusinessIds.length} businesses with recent activity`,
      );

      // Warm cache for each active business
      for (const { businessId } of activeBusinessIds) {
        try {
          await this.warmBusinessCache(businessId);
          businessesWarmed++;
        } catch (error) {
          const errorMsg = `Failed to warm cache for business ${businessId}: ${
            error instanceof Error ? error.message : String(error)
          }`;
          errors.push(errorMsg);
        }
      }

      return {
        success: errors.length === 0,
        businessesWarmed,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMsg = `Failed to warm active businesses cache: ${
        error instanceof Error ? error.message : String(error)
      }`;
      errors.push(errorMsg);

      return {
        success: false,
        businessesWarmed,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Schedule automatic cache warming
   */
  startAutomaticWarming(): void {
    // Warm cache every 4 hours
    setInterval(async () => {
      try {
        console.log("Starting automatic cache warming...");
        const result = await this.warmActiveBusinesses(48); // Warm businesses with activity in last 48 hours
        console.log("Automatic cache warming completed:", result);
      } catch (error) {
        console.error("Automatic cache warming failed:", error);
      }
    }, this.WARMING_INTERVAL);

    console.log("Automatic cache warming scheduled every 4 hours");
  }

  /**
   * Check if cache warming is needed
   */
  shouldWarmCache(): boolean {
    const timeSinceLastWarming = Date.now() - this.lastWarmingTime;
    return timeSinceLastWarming > this.WARMING_INTERVAL;
  }

  /**
   * Get cache warming status
   */
  getStatus(): {
    isWarming: boolean;
    lastWarmingTime: number | null;
    nextWarmingTime: number | null;
  } {
    return {
      isWarming: this.isWarming,
      lastWarmingTime: this.lastWarmingTime || null,
      nextWarmingTime: this.lastWarmingTime
        ? this.lastWarmingTime + this.WARMING_INTERVAL
        : null,
    };
  }
}

// Export singleton instance
export const cacheWarmingService = new CacheWarmingService();
