/**
 * Location data validation utilities
 */

import { z } from "zod";
import type {
  Coordinates,
  LocationInput,
  BusinessLocationModel,
  CustomerLocationModel,
  SearchFilters,
} from "@/types/location";

// Coordinate validation schema
export const coordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  accuracy: z.number().positive().optional(),
});

// Address validation schema
export const addressSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must be less than 255 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be less than 50 characters"),
  zipCode: z
    .string()
    .min(5, "ZIP code must be at least 5 characters")
    .max(10, "ZIP code must be less than 10 characters")
    .regex(
      /^[0-9-\s]+$/,
      "ZIP code must contain only numbers, hyphens, and spaces",
    ),
  country: z
    .string()
    .min(2, "Country code must be at least 2 characters")
    .max(3, "Country code must be less than 3 characters")
    .default("US"),
});

// Location input validation schema
export const locationInputSchema = addressSchema.extend({
  coordinates: coordinatesSchema.optional(),
});

// Business location validation schema
export const businessLocationSchema = locationInputSchema.extend({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1, "Timezone is required"),
  serviceRadius: z
    .number()
    .positive("Service radius must be positive")
    .max(500, "Service radius cannot exceed 500 miles")
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Customer location validation schema
export const customerLocationSchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  zipCode: z
    .string()
    .min(5)
    .max(10)
    .regex(/^[0-9-\s]+$/)
    .optional(),
  distanceToBusiness: z.number().positive().optional(),
  createdAt: z.date(),
});

// Search filters validation schema
export const searchFiltersSchema = z.object({
  radius: z
    .number()
    .positive("Radius must be positive")
    .max(500, "Radius cannot exceed 500 miles"),
  services: z.array(z.string()).optional(),
  priceRange: z.tuple([z.number().min(0), z.number().min(0)]).optional(),
  rating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(["distance", "rating", "price"]).default("distance"),
});

// Service radius validation schema
export const serviceRadiusSchema = z
  .number()
  .positive("Service radius must be positive")
  .max(500, "Service radius cannot exceed 500 miles")
  .optional();

/**
 * Validates coordinate values
 */
export function validateCoordinates(coordinates: unknown): Coordinates {
  return coordinatesSchema.parse(coordinates);
}

/**
 * Validates address data
 */
export function validateAddress(address: unknown) {
  return addressSchema.parse(address);
}

/**
 * Validates location input data
 */
export function validateLocationInput(locationInput: unknown): LocationInput {
  return locationInputSchema.parse(locationInput);
}

/**
 * Validates business location data
 */
export function validateBusinessLocation(
  businessLocation: unknown,
): BusinessLocationModel {
  return businessLocationSchema.parse(businessLocation);
}

/**
 * Validates customer location data
 */
export function validateCustomerLocation(
  customerLocation: unknown,
): CustomerLocationModel {
  return customerLocationSchema.parse(customerLocation);
}

/**
 * Validates search filters
 */
export function validateSearchFilters(filters: unknown): SearchFilters {
  return searchFiltersSchema.parse(filters);
}

/**
 * Validates service radius
 */
export function validateServiceRadius(radius: unknown): number | undefined {
  return serviceRadiusSchema.parse(radius);
}

/**
 * Checks if coordinates are within valid bounds
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Checks if a ZIP code format is valid (US format)
 */
export function isValidZipCode(zipCode: string): boolean {
  // Supports formats: 12345, 12345-6789, 12345 6789
  const zipRegex = /^\d{5}(-?\s?\d{4})?$/;
  return zipRegex.test(zipCode.trim());
}

/**
 * Normalizes ZIP code to standard format (removes spaces, keeps hyphens)
 */
export function normalizeZipCode(zipCode: string): string {
  // Remove all spaces and trim
  const cleaned = zipCode.replace(/\s+/g, "").trim();

  // If it's a 9-digit ZIP without hyphen, add hyphen after 5th digit
  if (cleaned.length === 9 && !cleaned.includes("-")) {
    return cleaned.slice(0, 5) + "-" + cleaned.slice(5);
  }

  // If it has spaces instead of hyphen, replace with hyphen
  const spaceFormatted = zipCode.trim().replace(/\s+/g, "-");
  if (spaceFormatted.match(/^\d{5}-\d{4}$/)) {
    return spaceFormatted;
  }

  return cleaned;
}

/**
 * Validates timezone string format
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    // Test if timezone is valid by creating a date with it
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that a distance is within reasonable bounds
 */
export function isValidDistance(distance: number): boolean {
  return distance >= 0 && distance <= 25000; // Max ~25,000 miles (around Earth)
}

/**
 * Validates business ID format
 */
export function isValidBusinessId(businessId: string): boolean {
  // Check if it's a valid UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(businessId);
}

/**
 * Validates appointment ID format
 */
export function isValidAppointmentId(appointmentId: string): boolean {
  // Check if it's a valid UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(appointmentId);
}

/**
 * Sanitizes address input by trimming and normalizing
 */
export function sanitizeAddress(address: string): string {
  return address.trim().replace(/\s+/g, " ");
}

/**
 * Sanitizes city input
 */
export function sanitizeCity(city: string): string {
  return city.trim().replace(/\s+/g, " ");
}

/**
 * Sanitizes state input
 */
export function sanitizeState(state: string): string {
  return state.trim().toUpperCase();
}

/**
 * Creates a validation error with location context
 */
export class LocationValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown,
  ) {
    super(`Location validation error for ${field}: ${message}`);
    this.name = "LocationValidationError";
  }
}

/**
 * Comprehensive location input validation with detailed error reporting
 */
export function validateLocationInputWithErrors(input: unknown): {
  isValid: boolean;
  data?: LocationInput;
  errors: Array<{ field: string; message: string; value: unknown }>;
} {
  const errors: Array<{ field: string; message: string; value: unknown }> = [];

  try {
    const data = validateLocationInput(input);
    return { isValid: true, data, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        errors.push({
          field: issue.path.join("."),
          message: issue.message,
          value: issue.path.reduce((obj: any, key) => obj?.[key], input),
        });
      }
    } else {
      errors.push({
        field: "unknown",
        message: error instanceof Error ? error.message : "Unknown error",
        value: input,
      });
    }

    return { isValid: false, errors };
  }
}
