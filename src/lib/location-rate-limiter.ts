/**
 * Rate limiting system for location-based operations
 */

import {
  EnhancedLocationError,
  LocationErrorHandler,
} from "./location-error-handler";

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

/**
 * In-memory rate limiter for location operations
 */
export class LocationRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private config: RateLimitConfig) {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Checks if request is allowed under rate limit
   */
  checkLimit(identifier: string): RateLimitResult {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : identifier;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let entry = this.store.get(key);

    // Create new entry if doesn't exist or window has expired
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      };
      this.store.set(key, entry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    // Increment counter
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Records a request (for tracking purposes)
   */
  recordRequest(identifier: string, success: boolean): void {
    if (
      (success && this.config.skipSuccessfulRequests) ||
      (!success && this.config.skipFailedRequests)
    ) {
      return;
    }

    // Just check limit to record the request
    this.checkLimit(identifier);
  }

  /**
   * Resets rate limit for a specific identifier
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : identifier;
    this.store.delete(key);
  }

  /**
   * Gets current usage for an identifier
   */
  getUsage(
    identifier: string,
  ): { count: number; remaining: number; resetTime: number } | null {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : identifier;
    const entry = this.store.get(key);

    if (!entry || entry.resetTime <= Date.now()) {
      return null;
    }

    return {
      count: entry.count,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  getConfig(): Readonly<RateLimitConfig> {
    return this.config;
  }

  /**
   * Cleans up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroys the rate limiter and cleans up resources
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }

  /**
   * Gets statistics about the rate limiter
   */
  getStats(): {
    totalEntries: number;
    activeEntries: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let activeEntries = 0;

    for (const entry of this.store.values()) {
      if (entry.resetTime > now) {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.store.size,
      activeEntries,
      memoryUsage: this.store.size * 64, // Rough estimate
    };
  }
}

/**
 * Rate limiter manager for different location operations
 */
export class LocationRateLimiterManager {
  private limiters = new Map<string, LocationRateLimiter>();

  constructor() {
    // Initialize rate limiters for different operations
    this.setupDefaultLimiters();
  }

  private setupDefaultLimiters(): void {
    // Geocoding rate limiter (more restrictive)
    this.limiters.set(
      "geocoding",
      new LocationRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10, // 10 requests per minute
        keyGenerator: (ip) => `geocoding:${ip}`,
      }),
    );

    // Search rate limiter (moderate)
    this.limiters.set(
      "search",
      new LocationRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30, // 30 searches per minute
        keyGenerator: (ip) => `search:${ip}`,
      }),
    );

    // General location operations (lenient)
    this.limiters.set(
      "general",
      new LocationRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // 100 requests per minute
        keyGenerator: (ip) => `general:${ip}`,
      }),
    );

    // Business location updates (very restrictive)
    this.limiters.set(
      "business_update",
      new LocationRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 5, // 5 updates per hour
        keyGenerator: (businessId) => `business_update:${businessId}`,
      }),
    );

    // Map loading (moderate)
    this.limiters.set(
      "map",
      new LocationRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 50, // 50 map loads per minute
        keyGenerator: (ip) => `map:${ip}`,
      }),
    );
  }

  /**
   * Checks rate limit for a specific operation
   */
  checkLimit(operation: string, identifier: string): RateLimitResult {
    const limiter = this.limiters.get(operation);
    if (!limiter) {
      // No rate limit configured for this operation
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000,
      };
    }

    return limiter.checkLimit(identifier);
  }

  /**
   * Records a request for tracking
   */
  recordRequest(operation: string, identifier: string, success: boolean): void {
    const limiter = this.limiters.get(operation);
    if (limiter) {
      limiter.recordRequest(identifier, success);
    }
  }

  /**
   * Enforces rate limit and throws error if exceeded
   */
  enforceLimit(operation: string, identifier: string): void {
    const result = this.checkLimit(operation, identifier);

    if (!result.allowed) {
      throw LocationErrorHandler.createError(
        "API_RATE_LIMIT_EXCEEDED" as any,
        `Rate limit exceeded for ${operation}`,
        undefined,
        {
          operation,
          identifier: this.hashIdentifier(identifier),
          retryAfter: result.retryAfter,
          resetTime: result.resetTime,
        },
      );
    }
  }

  /**
   * Gets usage statistics for an operation and identifier
   */
  getUsage(
    operation: string,
    identifier: string,
  ): { count: number; remaining: number; resetTime: number } | null {
    const limiter = this.limiters.get(operation);
    return limiter ? limiter.getUsage(identifier) : null;
  }

  /**
   * Resets rate limit for a specific operation and identifier
   */
  reset(operation: string, identifier: string): void {
    const limiter = this.limiters.get(operation);
    if (limiter) {
      limiter.reset(identifier);
    }
  }

  /**
   * Adds a custom rate limiter
   */
  addLimiter(operation: string, config: RateLimitConfig): void {
    this.limiters.set(operation, new LocationRateLimiter(config));
  }

  getLimiterConfig(operation: string): Readonly<RateLimitConfig> | undefined {
    return this.limiters.get(operation)?.getConfig();
  }

  /**
   * Gets comprehensive statistics
   */
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const [operation, limiter] of this.limiters.entries()) {
      stats[operation] = limiter.getStats();
    }

    return stats;
  }

  /**
   * Hashes identifier for privacy
   */
  private hashIdentifier(identifier: string): string {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `id_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Cleans up all rate limiters
   */
  destroy(): void {
    for (const limiter of this.limiters.values()) {
      limiter.destroy();
    }
    this.limiters.clear();
  }
}

// Export singleton instance
export const locationRateLimiter = new LocationRateLimiterManager();

/**
 * Middleware function for Express.js to enforce rate limits
 */

export function createLocationRateLimitMiddleware(operation: string) {
  return (req: any, res: any, next: any) => {
    try {
      const identifier = req.ip || req.connection?.remoteAddress || "unknown";
      const result = locationRateLimiter.checkLimit(operation, identifier);

      // ✅ Get limiter config safely through the new getter
      const config = locationRateLimiter.getLimiterConfig(operation);

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": config?.maxRequests?.toString() ?? "unknown",
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
      });

      if (!result.allowed) {
        if (result.retryAfter) {
          res.set("Retry-After", result.retryAfter.toString());
        }

        return res.status(429).json({
          error: "Rate limit exceeded",
          message: `Too many ${operation} requests. Please try again later.`,
          retryAfter: result.retryAfter,
        });
      }

      next();
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      next(); // Continue even if rate limiter fails
    }
  };
}

