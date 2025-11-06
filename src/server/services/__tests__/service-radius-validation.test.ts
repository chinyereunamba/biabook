import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "@/server/db";
import {
  businesses,
  businessLocations,
  categories,
  users,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { serviceRadiusValidationService } from "../service-radius-validation";
import type { Coordinates } from "@/lib/distance-utils";

describe("ServiceRadiusValidationService", () => {
  const testBusinessId = "test-business-id";
  const testCategoryId = "test-category";
  const testOwnerId = "test-owner";
  const testCustomerLocation: Coordinates = {
    latitude: 40.7128,
    longitude: -74.006, // NYC coordinates
  };

  beforeEach(async () => {
    // Clean up test data in correct order (child tables first)
    await db.delete(businessLocations);
    await db.delete(businesses);
    await db.delete(categories);
    await db.delete(users);

    // Insert test user (owner)
    await db.insert(users).values({
      id: testOwnerId,
      name: "Test Owner",
      email: "owner@test.com",
      role: "user",
      isOnboarded: true,
    });

    // Insert test category
    await db.insert(categories).values({
      id: testCategoryId,
      name: "Test Category",
    });

    // Insert test business
    await db.insert(businesses).values({
      id: testBusinessId,
      name: "Test Business",
      slug: "test-business",
      categoryId: testCategoryId,
      ownerId: testOwnerId,
      createdAt: new Date(),
    });

    // Insert test business location
    await db.insert(businessLocations).values({
      id: "test-location-id",
      businessId: testBusinessId,
      address: "123 Test St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
      latitude: 40.7589, // Slightly north of customer location
      longitude: -73.9851,
      timezone: "America/New_York",
      serviceRadius: 10, // 10 mile radius
      createdAt: new Date(),
    });
  });

  afterEach(async () => {
    // Clean up test data in correct order (child tables first)
    await db.delete(businessLocations);
    await db.delete(businesses);
    await db.delete(categories);
    await db.delete(users);
  });

  describe("validateBookingLocation", () => {
    it("should validate customer within service radius", async () => {
      const result =
        await serviceRadiusValidationService.validateBookingLocation(
          testBusinessId,
          testCustomerLocation,
        );

      expect(result.isValid).toBe(true);
      expect(result.distance).toBeGreaterThan(0);
      expect(result.distance).toBeLessThan(10); // Within 10 mile radius
      expect(result.serviceRadius).toBe(10);
      expect(result.businessName).toBe("Test Business");
      expect(result.businessLocation.city).toBe("New York");
    });

    it("should invalidate customer outside service radius", async () => {
      // Update business location to have smaller radius
      await db
        .update(businessLocations)
        .set({ serviceRadius: 1 }) // 1 mile radius
        .where(eq(businessLocations.businessId, testBusinessId));

      const result =
        await serviceRadiusValidationService.validateBookingLocation(
          testBusinessId,
          testCustomerLocation,
        );

      expect(result.isValid).toBe(false);
      expect(result.distance).toBeGreaterThan(1);
      expect(result.serviceRadius).toBe(1);
    });

    it("should validate customer when service radius is unlimited", async () => {
      // Update business location to have unlimited radius
      await db
        .update(businessLocations)
        .set({ serviceRadius: null })
        .where(eq(businessLocations.businessId, testBusinessId));

      const farAwayLocation: Coordinates = {
        latitude: 34.0522, // Los Angeles
        longitude: -118.2437,
      };

      const result =
        await serviceRadiusValidationService.validateBookingLocation(
          testBusinessId,
          farAwayLocation,
        );

      expect(result.isValid).toBe(true);
      expect(result.serviceRadius).toBe(null);
      expect(result.distance).toBeGreaterThan(100); // Very far away
    });

    it("should throw error for invalid coordinates", async () => {
      const invalidLocation: Coordinates = {
        latitude: 91, // Invalid latitude
        longitude: -74.006,
      };

      await expect(
        serviceRadiusValidationService.validateBookingLocation(
          testBusinessId,
          invalidLocation,
        ),
      ).rejects.toThrow("Invalid customer coordinates provided");
    });

    it("should throw error for non-existent business", async () => {
      await expect(
        serviceRadiusValidationService.validateBookingLocation(
          "non-existent-business",
          testCustomerLocation,
        ),
      ).rejects.toThrow("Business not found or location not configured");
    });
  });

  describe("validateBeforeBooking", () => {
    it("should return can book true when within service area", async () => {
      const result = await serviceRadiusValidationService.validateBeforeBooking(
        testBusinessId,
        testCustomerLocation,
      );

      expect(result.canBook).toBe(true);
      expect(result.message).toContain("miles from Test Business");
      expect(result.distance).toBeGreaterThan(0);
      expect(result.serviceRadius).toBe(10);
    });

    it("should return can book false when outside service area", async () => {
      // Update business location to have smaller radius
      await db
        .update(businessLocations)
        .set({ serviceRadius: 1 })
        .where(eq(businessLocations.businessId, testBusinessId));

      const result = await serviceRadiusValidationService.validateBeforeBooking(
        testBusinessId,
        testCustomerLocation,
      );

      expect(result.canBook).toBe(false);
      expect(result.message).toContain("outside their");
      expect(result.message).toContain("1 miles service area");
    });
  });

  describe("validateServiceRadiusValue", () => {
    it("should validate valid radius values", async () => {
      expect(
        serviceRadiusValidationService.validateServiceRadiusValue(10),
      ).toEqual({
        isValid: true,
      });

      expect(
        serviceRadiusValidationService.validateServiceRadiusValue(null),
      ).toEqual({
        isValid: true,
      });

      expect(
        serviceRadiusValidationService.validateServiceRadiusValue(0),
      ).toEqual({
        isValid: true,
      });
    });

    it("should invalidate negative radius", async () => {
      const result =
        serviceRadiusValidationService.validateServiceRadiusValue(-5);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("cannot be negative");
    });

    it("should invalidate radius over 500 miles", async () => {
      const result =
        serviceRadiusValidationService.validateServiceRadiusValue(600);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("cannot exceed 500 miles");
    });

    it("should invalidate non-numeric values", async () => {
      const result =
        serviceRadiusValidationService.validateServiceRadiusValue(NaN);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("must be a number");
    });
  });
});
