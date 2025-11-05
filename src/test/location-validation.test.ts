/**
 * Tests for location validation utilities
 */

import { describe, it, expect } from "vitest";
import {
  validateCoordinates,
  validateAddress,
  validateLocationInput,
  validateSearchFilters,
  validateServiceRadius,
  isValidCoordinates,
  isValidZipCode,
  normalizeZipCode,
  isValidTimezone,
  isValidDistance,
  sanitizeAddress,
  sanitizeCity,
  sanitizeState,
  LocationValidationError,
  validateLocationInputWithErrors,
} from "@/lib/location-validation";

import {
  calculateDistance,
  createBoundingBox,
  isWithinRadius,
  formatCoordinates,
  parseCoordinateString,
  validateCoordinateBounds,
  normalizeCoordinates,
  areCoordinatesEqual,
} from "@/lib/coordinate-utils";

describe("Location Validation", () => {
  describe("validateCoordinates", () => {
    it("should validate correct coordinates", () => {
      const coords = { latitude: 40.7128, longitude: -74.006 };
      expect(() => validateCoordinates(coords)).not.toThrow();
    });

    it("should reject invalid latitude", () => {
      const coords = { latitude: 91, longitude: -74.006 };
      expect(() => validateCoordinates(coords)).toThrow();
    });

    it("should reject invalid longitude", () => {
      const coords = { latitude: 40.7128, longitude: 181 };
      expect(() => validateCoordinates(coords)).toThrow();
    });
  });

  describe("validateAddress", () => {
    it("should validate correct address", () => {
      const address = {
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "US",
      };
      expect(() => validateAddress(address)).not.toThrow();
    });

    it("should reject empty address", () => {
      const address = {
        address: "",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "US",
      };
      expect(() => validateAddress(address)).toThrow();
    });

    it("should reject invalid zip code", () => {
      const address = {
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "abc",
        country: "US",
      };
      expect(() => validateAddress(address)).toThrow();
    });
  });

  describe("validateSearchFilters", () => {
    it("should validate correct search filters", () => {
      const filters = {
        radius: 25,
        sortBy: "distance" as const,
      };
      expect(() => validateSearchFilters(filters)).not.toThrow();
    });

    it("should reject negative radius", () => {
      const filters = {
        radius: -5,
        sortBy: "distance" as const,
      };
      expect(() => validateSearchFilters(filters)).toThrow();
    });

    it("should reject invalid sort option", () => {
      const filters = {
        radius: 25,
        sortBy: "invalid",
      };
      expect(() => validateSearchFilters(filters)).toThrow();
    });
  });

  describe("isValidCoordinates", () => {
    it("should return true for valid coordinates", () => {
      expect(isValidCoordinates(40.7128, -74.006)).toBe(true);
    });

    it("should return false for invalid latitude", () => {
      expect(isValidCoordinates(91, -74.006)).toBe(false);
    });

    it("should return false for invalid longitude", () => {
      expect(isValidCoordinates(40.7128, 181)).toBe(false);
    });
  });

  describe("isValidZipCode", () => {
    it("should validate 5-digit zip codes", () => {
      expect(isValidZipCode("12345")).toBe(true);
    });

    it("should validate ZIP+4 format", () => {
      expect(isValidZipCode("12345-6789")).toBe(true);
    });

    it("should validate ZIP+4 with space", () => {
      expect(isValidZipCode("12345 6789")).toBe(true);
    });

    it("should reject invalid formats", () => {
      expect(isValidZipCode("abc")).toBe(false);
      expect(isValidZipCode("123")).toBe(false);
    });
  });

  describe("normalizeZipCode", () => {
    it("should remove spaces", () => {
      expect(normalizeZipCode("12345 6789")).toBe("12345-6789");
    });

    it("should preserve hyphens", () => {
      expect(normalizeZipCode("12345-6789")).toBe("12345-6789");
    });
  });

  describe("isValidTimezone", () => {
    it("should validate correct timezones", () => {
      expect(isValidTimezone("America/New_York")).toBe(true);
      expect(isValidTimezone("UTC")).toBe(true);
    });

    it("should reject invalid timezones", () => {
      expect(isValidTimezone("Invalid/Timezone")).toBe(false);
    });
  });

  describe("sanitization functions", () => {
    it("should sanitize address", () => {
      expect(sanitizeAddress("  123   Main   St  ")).toBe("123 Main St");
    });

    it("should sanitize city", () => {
      expect(sanitizeCity("  New   York  ")).toBe("New York");
    });

    it("should sanitize state", () => {
      expect(sanitizeState("  ny  ")).toBe("NY");
    });
  });

  describe("validateLocationInputWithErrors", () => {
    it("should return valid result for correct input", () => {
      const input = {
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "US",
      };

      const result = validateLocationInputWithErrors(input);
      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it("should return errors for invalid input", () => {
      const input = {
        address: "",
        city: "New York",
        state: "NY",
        zipCode: "invalid",
        country: "US",
      };

      const result = validateLocationInputWithErrors(input);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe("Coordinate Utils", () => {
  describe("calculateDistance", () => {
    it("should calculate distance between NYC and LA", () => {
      const nyc = { latitude: 40.7128, longitude: -74.006 };
      const la = { latitude: 34.0522, longitude: -118.2437 };

      const distance = calculateDistance(nyc, la);
      expect(distance).toBeGreaterThan(2400); // Approximately 2445 miles
      expect(distance).toBeLessThan(2500);
    });

    it("should return 0 for same coordinates", () => {
      const coord = { latitude: 40.7128, longitude: -74.006 };
      const distance = calculateDistance(coord, coord);
      expect(distance).toBeCloseTo(0, 5);
    });
  });

  describe("createBoundingBox", () => {
    it("should create correct bounding box", () => {
      const center = { latitude: 40.7128, longitude: -74.006 };
      const radius = 10; // 10 miles

      const bbox = createBoundingBox(center, radius);

      expect(bbox.northeast.latitude).toBeGreaterThan(center.latitude);
      expect(bbox.northeast.longitude).toBeGreaterThan(center.longitude);
      expect(bbox.southwest.latitude).toBeLessThan(center.latitude);
      expect(bbox.southwest.longitude).toBeLessThan(center.longitude);
    });
  });

  describe("isWithinRadius", () => {
    it("should correctly identify points within radius", () => {
      const center = { latitude: 40.7128, longitude: -74.006 };
      const nearby = { latitude: 40.7589, longitude: -73.9851 }; // Times Square

      expect(isWithinRadius(nearby, center, 10)).toBe(true);
      expect(isWithinRadius(nearby, center, 1)).toBe(false);
    });
  });

  describe("formatCoordinates", () => {
    it("should format coordinates correctly", () => {
      const coords = { latitude: 40.7128, longitude: -74.006 };
      expect(formatCoordinates(coords, 4)).toBe("40.7128, -74.0060");
    });
  });

  describe("parseCoordinateString", () => {
    it("should parse comma-separated coordinates", () => {
      const result = parseCoordinateString("40.7128, -74.0060");
      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
    });

    it("should parse space-separated coordinates", () => {
      const result = parseCoordinateString("40.7128 -74.0060");
      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
    });

    it("should throw for invalid format", () => {
      expect(() => parseCoordinateString("invalid")).toThrow();
    });
  });

  describe("normalizeCoordinates", () => {
    it("should normalize to 6 decimal places", () => {
      const coords = {
        latitude: 40.71280123456789,
        longitude: -74.00600987654321,
      };
      const normalized = normalizeCoordinates(coords);

      expect(normalized.latitude).toBe(40.712801);
      expect(normalized.longitude).toBe(-74.00601);
    });
  });

  describe("areCoordinatesEqual", () => {
    it("should identify equal coordinates", () => {
      const coord1 = { latitude: 40.7128, longitude: -74.006 };
      const coord2 = { latitude: 40.7128, longitude: -74.006 };

      expect(areCoordinatesEqual(coord1, coord2)).toBe(true);
    });

    it("should identify different coordinates", () => {
      const coord1 = { latitude: 40.7128, longitude: -74.006 };
      const coord2 = { latitude: 40.7589, longitude: -73.9851 };

      expect(areCoordinatesEqual(coord1, coord2)).toBe(false);
    });
  });

  describe("validateCoordinateBounds", () => {
    it("should not throw for valid coordinates", () => {
      expect(() => validateCoordinateBounds(40.7128, -74.006)).not.toThrow();
    });

    it("should throw for invalid latitude", () => {
      expect(() => validateCoordinateBounds(91, -74.006)).toThrow(
        LocationValidationError,
      );
    });

    it("should throw for invalid longitude", () => {
      expect(() => validateCoordinateBounds(40.7128, 181)).toThrow(
        LocationValidationError,
      );
    });
  });
});
