/**
 * Security-focused validation for location data with sanitization and threat detection
 */

import { z } from "zod";
import {
  EnhancedLocationError,
  LocationErrorHandler,
} from "./location-error-handler";
import type {
  Coordinates,
  LocationInput,
  SearchFilters,
} from "@/types/location";

// Security configuration
const SECURITY_CONFIG = {
  maxAddressLength: 500,
  maxCityLength: 100,
  maxStateLength: 50,
  maxZipLength: 20,
  maxSearchRadius: 500, // miles
  maxSearchResults: 100,
  allowedCountries: ["US", "CA", "MX"], // Configurable based on business needs
  suspiciousPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /data:text\/html/gi, // Data URLs
    /vbscript:/gi, // VBScript protocol
  ],
  rateLimitPatterns: [
    /(.)\1{50,}/, // Repeated characters (potential DoS)
    /[^\x20-\x7E]{20,}/, // Long non-ASCII sequences
  ],
};

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: Array<{
    field: string;
    code: string;
    message: string;
    severity: "low" | "medium" | "high";
  }>;
  securityFlags: string[];
}

export interface SecurityContext {
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  requestId?: string;
}

/**
 * Security-focused location data validator
 */
export class LocationSecurityValidator {
  /**
   * Detects suspicious patterns in input strings
   */
  private static detectSuspiciousPatterns(input: string): string[] {
    const flags: string[] = [];

    // Check for XSS patterns
    for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
      if (pattern.test(input)) {
        flags.push("xss_pattern_detected");
        break;
      }
    }

    // Check for potential DoS patterns
    for (const pattern of SECURITY_CONFIG.rateLimitPatterns) {
      if (pattern.test(input)) {
        flags.push("dos_pattern_detected");
        break;
      }
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        flags.push("sql_injection_pattern");
        break;
      }
    }

    return flags;
  }

  /**
   * Sanitizes string input by removing dangerous characters
   */
  private static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>'"]/g, "") // Remove potentially dangerous characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .substring(0, SECURITY_CONFIG.maxAddressLength); // Truncate to max length
  }

  /**
   * Validates and sanitizes coordinates with bounds checking
   */
  static validateCoordinates(
    coordinates: unknown,
    context?: SecurityContext,
  ): ValidationResult<Coordinates> {
    const errors: ValidationResult<Coordinates>["errors"] = [];
    const securityFlags: string[] = [];

    try {
      // Basic type validation
      if (typeof coordinates !== "object" || coordinates === null) {
        errors.push({
          field: "coordinates",
          code: "INVALID_TYPE",
          message: "Coordinates must be an object",
          severity: "high",
        });
        return { isValid: false, errors, securityFlags };
      }

      const coord = coordinates as any;

      // Validate latitude
      if (typeof coord.latitude !== "number" || isNaN(coord.latitude)) {
        errors.push({
          field: "latitude",
          code: "INVALID_LATITUDE_TYPE",
          message: "Latitude must be a valid number",
          severity: "high",
        });
      } else if (coord.latitude < -90 || coord.latitude > 90) {
        errors.push({
          field: "latitude",
          code: "LATITUDE_OUT_OF_BOUNDS",
          message: "Latitude must be between -90 and 90",
          severity: "high",
        });
        securityFlags.push("coordinate_bounds_violation");
      }

      // Validate longitude
      if (typeof coord.longitude !== "number" || isNaN(coord.longitude)) {
        errors.push({
          field: "longitude",
          code: "INVALID_LONGITUDE_TYPE",
          message: "Longitude must be a valid number",
          severity: "high",
        });
      } else if (coord.longitude < -180 || coord.longitude > 180) {
        errors.push({
          field: "longitude",
          code: "LONGITUDE_OUT_OF_BOUNDS",
          message: "Longitude must be between -180 and 180",
          severity: "high",
        });
        securityFlags.push("coordinate_bounds_violation");
      }

      // Check for suspicious precision (potential fingerprinting)
      if (
        typeof coord.latitude === "number" &&
        typeof coord.longitude === "number"
      ) {
        const latPrecision =
          coord.latitude.toString().split(".")[1]?.length || 0;
        const lngPrecision =
          coord.longitude.toString().split(".")[1]?.length || 0;

        if (latPrecision > 10 || lngPrecision > 10) {
          securityFlags.push("excessive_precision");
        }
      }

      // Validate accuracy if provided
      if (coord.accuracy !== undefined) {
        if (typeof coord.accuracy !== "number" || coord.accuracy < 0) {
          errors.push({
            field: "accuracy",
            code: "INVALID_ACCURACY",
            message: "Accuracy must be a positive number",
            severity: "medium",
          });
        } else if (coord.accuracy > 100000) {
          // 100km seems excessive
          securityFlags.push("suspicious_accuracy");
        }
      }

      if (errors.length > 0) {
        return { isValid: false, errors, securityFlags };
      }

      return {
        isValid: true,
        data: {
          latitude: coord.latitude,
          longitude: coord.longitude,
          accuracy: coord.accuracy,
        },
        errors: [],
        securityFlags,
      };
    } catch (error) {
      errors.push({
        field: "coordinates",
        code: "VALIDATION_ERROR",
        message: "Failed to validate coordinates",
        severity: "high",
      });
      return { isValid: false, errors, securityFlags };
    }
  }

  /**
   * Validates and sanitizes location input with security checks
   */
  static validateLocationInput(
    input: unknown,
    context?: SecurityContext,
  ): ValidationResult<LocationInput> {
    const errors: ValidationResult<LocationInput>["errors"] = [];
    const securityFlags: string[] = [];

    try {
      if (typeof input !== "object" || input === null) {
        errors.push({
          field: "input",
          code: "INVALID_TYPE",
          message: "Location input must be an object",
          severity: "high",
        });
        return { isValid: false, errors, securityFlags };
      }

      const location = input as any;
      const sanitizedLocation: Partial<LocationInput> = {};

      // Validate and sanitize address
      if (typeof location.address === "string") {
        const addressFlags = this.detectSuspiciousPatterns(location.address);
        securityFlags.push(...addressFlags);

        if (location.address.length > SECURITY_CONFIG.maxAddressLength) {
          errors.push({
            field: "address",
            code: "ADDRESS_TOO_LONG",
            message: `Address must be less than ${SECURITY_CONFIG.maxAddressLength} characters`,
            severity: "medium",
          });
        }

        sanitizedLocation.address = this.sanitizeString(location.address);
      } else {
        errors.push({
          field: "address",
          code: "MISSING_ADDRESS",
          message: "Address is required",
          severity: "high",
        });
      }

      // Validate and sanitize city
      if (typeof location.city === "string") {
        const cityFlags = this.detectSuspiciousPatterns(location.city);
        securityFlags.push(...cityFlags);

        if (location.city.length > SECURITY_CONFIG.maxCityLength) {
          errors.push({
            field: "city",
            code: "CITY_TOO_LONG",
            message: `City must be less than ${SECURITY_CONFIG.maxCityLength} characters`,
            severity: "medium",
          });
        }

        sanitizedLocation.city = this.sanitizeString(location.city);
      } else {
        errors.push({
          field: "city",
          code: "MISSING_CITY",
          message: "City is required",
          severity: "high",
        });
      }

      // Validate and sanitize state
      if (typeof location.state === "string") {
        const stateFlags = this.detectSuspiciousPatterns(location.state);
        securityFlags.push(...stateFlags);

        if (location.state.length > SECURITY_CONFIG.maxStateLength) {
          errors.push({
            field: "state",
            code: "STATE_TOO_LONG",
            message: `State must be less than ${SECURITY_CONFIG.maxStateLength} characters`,
            severity: "medium",
          });
        }

        sanitizedLocation.state = this.sanitizeString(
          location.state,
        ).toUpperCase();
      } else {
        errors.push({
          field: "state",
          code: "MISSING_STATE",
          message: "State is required",
          severity: "high",
        });
      }

      // Validate and sanitize ZIP code
      if (typeof location.zipCode === "string") {
        const zipFlags = this.detectSuspiciousPatterns(location.zipCode);
        securityFlags.push(...zipFlags);

        if (location.zipCode.length > SECURITY_CONFIG.maxZipLength) {
          errors.push({
            field: "zipCode",
            code: "ZIP_TOO_LONG",
            message: `ZIP code must be less than ${SECURITY_CONFIG.maxZipLength} characters`,
            severity: "medium",
          });
        }

        // ZIP code specific validation
        const zipPattern = /^[0-9A-Za-z\s\-]+$/;
        if (!zipPattern.test(location.zipCode)) {
          errors.push({
            field: "zipCode",
            code: "INVALID_ZIP_FORMAT",
            message: "ZIP code contains invalid characters",
            severity: "medium",
          });
        }

        sanitizedLocation.zipCode = location.zipCode.trim().replace(/\s+/g, "");
      } else {
        errors.push({
          field: "zipCode",
          code: "MISSING_ZIP",
          message: "ZIP code is required",
          severity: "high",
        });
      }

      // Validate country
      if (typeof location.country === "string") {
        const countryCode = location.country.toUpperCase();
        if (!SECURITY_CONFIG.allowedCountries.includes(countryCode)) {
          errors.push({
            field: "country",
            code: "UNSUPPORTED_COUNTRY",
            message: "Country not supported",
            severity: "medium",
          });
          securityFlags.push("unsupported_country");
        }
        sanitizedLocation.country = countryCode;
      } else {
        sanitizedLocation.country = "US"; // Default
      }

      // Validate coordinates if provided
      if (location.coordinates) {
        const coordResult = this.validateCoordinates(
          location.coordinates,
          context,
        );
        if (!coordResult.isValid) {
          errors.push(...coordResult.errors);
        } else {
          sanitizedLocation.coordinates = coordResult.data;
        }
        securityFlags.push(...coordResult.securityFlags);
      }

      if (errors.length > 0) {
        return { isValid: false, errors, securityFlags };
      }

      return {
        isValid: true,
        data: sanitizedLocation as LocationInput,
        errors: [],
        securityFlags,
      };
    } catch (error) {
      errors.push({
        field: "input",
        code: "VALIDATION_ERROR",
        message: "Failed to validate location input",
        severity: "high",
      });
      return { isValid: false, errors, securityFlags };
    }
  }

  /**
   * Validates search filters with security constraints
   */
  static validateSearchFilters(
    filters: unknown,
    context?: SecurityContext,
  ): ValidationResult<SearchFilters> {
    const errors: ValidationResult<SearchFilters>["errors"] = [];
    const securityFlags: string[] = [];

    try {
      if (typeof filters !== "object" || filters === null) {
        errors.push({
          field: "filters",
          code: "INVALID_TYPE",
          message: "Search filters must be an object",
          severity: "high",
        });
        return { isValid: false, errors, securityFlags };
      }

      const filter = filters as any;
      const sanitizedFilters: Partial<SearchFilters> = {};

      // Validate radius
      if (typeof filter.radius === "number") {
        if (filter.radius <= 0) {
          errors.push({
            field: "radius",
            code: "INVALID_RADIUS",
            message: "Radius must be positive",
            severity: "medium",
          });
        } else if (filter.radius > SECURITY_CONFIG.maxSearchRadius) {
          errors.push({
            field: "radius",
            code: "RADIUS_TOO_LARGE",
            message: `Radius cannot exceed ${SECURITY_CONFIG.maxSearchRadius} miles`,
            severity: "medium",
          });
          securityFlags.push("excessive_search_radius");
        } else {
          sanitizedFilters.radius = filter.radius;
        }
      } else {
        errors.push({
          field: "radius",
          code: "MISSING_RADIUS",
          message: "Radius is required",
          severity: "high",
        });
      }

      // Validate services array
      if (filter.services !== undefined) {
        if (Array.isArray(filter.services)) {
          if (filter.services.length > 50) {
            // Reasonable limit
            securityFlags.push("excessive_service_filters");
          }

          const sanitizedServices = filter.services
            .filter((service: any) => typeof service === "string")
            .map((service: string) => this.sanitizeString(service))
            .slice(0, 50); // Limit to prevent DoS

          sanitizedFilters.services = sanitizedServices;
        } else {
          errors.push({
            field: "services",
            code: "INVALID_SERVICES_TYPE",
            message: "Services must be an array",
            severity: "medium",
          });
        }
      }

      // Validate price range
      if (filter.priceRange !== undefined) {
        if (
          Array.isArray(filter.priceRange) &&
          filter.priceRange.length === 2
        ) {
          const [min, max] = filter.priceRange;
          if (typeof min === "number" && typeof max === "number") {
            if (min < 0 || max < 0) {
              errors.push({
                field: "priceRange",
                code: "NEGATIVE_PRICE",
                message: "Price range cannot be negative",
                severity: "medium",
              });
            } else if (min > max) {
              errors.push({
                field: "priceRange",
                code: "INVALID_PRICE_RANGE",
                message: "Minimum price cannot be greater than maximum",
                severity: "medium",
              });
            } else if (max > 10000) {
              // Reasonable upper limit
              securityFlags.push("excessive_price_range");
            } else {
              sanitizedFilters.priceRange = [min, max];
            }
          } else {
            errors.push({
              field: "priceRange",
              code: "INVALID_PRICE_TYPE",
              message: "Price range must contain numbers",
              severity: "medium",
            });
          }
        } else {
          errors.push({
            field: "priceRange",
            code: "INVALID_PRICE_RANGE_FORMAT",
            message: "Price range must be an array of two numbers",
            severity: "medium",
          });
        }
      }

      // Validate rating
      if (filter.rating !== undefined) {
        if (typeof filter.rating === "number") {
          if (filter.rating < 0 || filter.rating > 5) {
            errors.push({
              field: "rating",
              code: "INVALID_RATING",
              message: "Rating must be between 0 and 5",
              severity: "medium",
            });
          } else {
            sanitizedFilters.rating = filter.rating;
          }
        } else {
          errors.push({
            field: "rating",
            code: "INVALID_RATING_TYPE",
            message: "Rating must be a number",
            severity: "medium",
          });
        }
      }

      // Validate sort by
      const allowedSortBy = ["distance", "rating", "price"];
      if (filter.sortBy !== undefined) {
        if (
          typeof filter.sortBy === "string" &&
          allowedSortBy.includes(filter.sortBy)
        ) {
          sanitizedFilters.sortBy = filter.sortBy as
            | "distance"
            | "rating"
            | "price";
        } else {
          errors.push({
            field: "sortBy",
            code: "INVALID_SORT_BY",
            message: `Sort by must be one of: ${allowedSortBy.join(", ")}`,
            severity: "medium",
          });
        }
      } else {
        sanitizedFilters.sortBy = "distance"; // Default
      }

      if (errors.length > 0) {
        return { isValid: false, errors, securityFlags };
      }

      return {
        isValid: true,
        data: sanitizedFilters as SearchFilters,
        errors: [],
        securityFlags,
      };
    } catch (error) {
      errors.push({
        field: "filters",
        code: "VALIDATION_ERROR",
        message: "Failed to validate search filters",
        severity: "high",
      });
      return { isValid: false, errors, securityFlags };
    }
  }

  /**
   * Logs security events for monitoring
   */
  static logSecurityEvent(
    event: string,
    severity: "low" | "medium" | "high",
    context?: SecurityContext,
    details?: Record<string, unknown>,
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      context: {
        userAgent: context?.userAgent,
        ipAddress: context?.ipAddress
          ? this.hashIP(context.ipAddress)
          : undefined,
        sessionId: context?.sessionId,
        requestId: context?.requestId,
      },
      details,
    };

    // In production, this would go to a security monitoring system
    if (severity === "high") {
      console.error("SECURITY ALERT:", logEntry);
    } else if (severity === "medium") {
      console.warn("SECURITY WARNING:", logEntry);
    } else {
      console.log("SECURITY INFO:", logEntry);
    }
  }

  /**
   * Hashes IP address for privacy-compliant logging
   */
  private static hashIP(ip: string): string {
    // Simple hash for demo - use proper crypto in production
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `ip_${Math.abs(hash).toString(16)}`;
  }
}
