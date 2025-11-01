import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { bookingConflictService } from "../booking-conflict-service";
import { db } from "@/server/db";
import {
  appointments,
  businesses,
  services,
  weeklyAvailability,
  users,
  categories,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

describe("BookingConflictService", () => {
  const testBusinessId = "test-business-1";
  const testServiceId = "test-service-1";
  const testUserId = "test-user-1";
  const testCategoryId = "salon";
  const testDate = "2025-12-25"; // Future date
  const testStartTime = "10:00";

  beforeEach(async () => {
    // Clean up test data
    await db
      .delete(appointments)
      .where(eq(appointments.businessId, testBusinessId));
    await db.delete(services).where(eq(services.businessId, testBusinessId));
    await db
      .delete(weeklyAvailability)
      .where(eq(weeklyAvailability.businessId, testBusinessId));
    await db.delete(businesses).where(eq(businesses.id, testBusinessId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(categories).where(eq(categories.id, testCategoryId));

    // Create test user
    await db.insert(users).values({
      id: testUserId,
      name: "Test Owner",
      email: "owner@test.com",
    });

    // Create test category
    await db.insert(categories).values({
      id: testCategoryId,
      name: "Salon",
    });

    // Create test business
    await db.insert(businesses).values({
      id: testBusinessId,
      name: "Test Business",
      slug: "test-business",
      categoryId: testCategoryId,
      ownerId: testUserId,
    });

    // Create test service
    await db.insert(services).values({
      id: testServiceId,
      businessId: testBusinessId,
      name: "Test Service",
      duration: 60, // 1 hour
      price: 5000, // $50.00
      isActive: true,
    });

    // Create weekly availability (Monday = 1)
    await db.insert(weeklyAvailability).values({
      businessId: testBusinessId,
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    });
  });

  afterEach(async () => {
    // Clean up test data
    await db
      .delete(appointments)
      .where(eq(appointments.businessId, testBusinessId));
    await db.delete(services).where(eq(services.businessId, testBusinessId));
    await db
      .delete(weeklyAvailability)
      .where(eq(weeklyAvailability.businessId, testBusinessId));
    await db.delete(businesses).where(eq(businesses.id, testBusinessId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(categories).where(eq(categories.id, testCategoryId));
  });

  describe("validateBookingRequest", () => {
    it("should return available for valid booking request", async () => {
      const result = await bookingConflictService.validateBookingRequest({
        businessId: testBusinessId,
        serviceId: testServiceId,
        appointmentDate: "2025-12-22", // Monday
        startTime: testStartTime,
      });

      expect(result.isAvailable).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it("should detect conflicts with existing appointments", async () => {
      // Create an existing appointment
      await db.insert(appointments).values({
        businessId: testBusinessId,
        serviceId: testServiceId,
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "1234567890",
        appointmentDate: "2025-12-22",
        startTime: "10:00",
        endTime: "11:00",
        status: "confirmed",
        servicePrice: 5000,
      });

      const result = await bookingConflictService.validateBookingRequest({
        businessId: testBusinessId,
        serviceId: testServiceId,
        appointmentDate: "2025-12-22",
        startTime: "10:30", // Overlaps with existing appointment
      });

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toContain(
        "This time slot conflicts with existing appointments",
      );
    });

    it("should reject appointments in the past", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split("T")[0];

      const result = await bookingConflictService.validateBookingRequest({
        businessId: testBusinessId,
        serviceId: testServiceId,
        appointmentDate: pastDate!,
        startTime: testStartTime,
      });

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toContain(
        "Cannot book appointments in the past",
      );
    });

    it("should reject appointments outside business hours", async () => {
      const result = await bookingConflictService.validateBookingRequest({
        businessId: testBusinessId,
        serviceId: testServiceId,
        appointmentDate: "2025-12-22", // Monday
        startTime: "08:00", // Before business hours (09:00-17:00)
      });

      expect(result.isAvailable).toBe(false);
      expect(
        result.conflicts.some((c) => c.includes("Business hours are")),
      ).toBe(true);
    });

    it("should reject appointments on unavailable days", async () => {
      const result = await bookingConflictService.validateBookingRequest({
        businessId: testBusinessId,
        serviceId: testServiceId,
        appointmentDate: "2025-12-23", // Tuesday - not available
        startTime: testStartTime,
      });

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toContain(
        "Business is not available on this day of the week",
      );
    });

    it("should validate input parameters", async () => {
      const result = await bookingConflictService.validateBookingRequest({
        businessId: "",
        serviceId: testServiceId,
        appointmentDate: testDate,
        startTime: testStartTime,
      });

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toContain("Business ID is required");
    });

    it("should reject inactive services", async () => {
      // Deactivate the service
      await db
        .update(services)
        .set({ isActive: false })
        .where(eq(services.id, testServiceId));

      const result = await bookingConflictService.validateBookingRequest({
        businessId: testBusinessId,
        serviceId: testServiceId,
        appointmentDate: "2025-12-22",
        startTime: testStartTime,
      });

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toContain("Service not found or inactive");
    });
  });

  describe("isTimeSlotAvailable", () => {
    it("should return true for available time slot", async () => {
      const isAvailable = await bookingConflictService.isTimeSlotAvailable(
        testBusinessId,
        testServiceId,
        "2025-12-22", // Monday
        testStartTime,
      );

      expect(isAvailable).toBe(true);
    });

    it("should return false for conflicting time slot", async () => {
      // Create an existing appointment
      await db.insert(appointments).values({
        businessId: testBusinessId,
        serviceId: testServiceId,
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "1234567890",
        appointmentDate: "2025-12-22",
        startTime: "10:00",
        endTime: "11:00",
        status: "confirmed",
        servicePrice: 5000,
      });

      const isAvailable = await bookingConflictService.isTimeSlotAvailable(
        testBusinessId,
        testServiceId,
        "2025-12-22",
        "10:00", // Same time as existing appointment
      );

      expect(isAvailable).toBe(false);
    });
  });

  describe("getConflicts", () => {
    it("should return empty array for valid booking", async () => {
      const conflicts = await bookingConflictService.getConflicts(
        testBusinessId,
        testServiceId,
        "2025-12-22", // Monday
        testStartTime,
      );

      expect(conflicts).toHaveLength(0);
    });

    it("should return conflicts for invalid booking", async () => {
      const conflicts = await bookingConflictService.getConflicts(
        testBusinessId,
        testServiceId,
        "2025-12-23", // Tuesday - not available
        testStartTime,
      );

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts).toContain(
        "Business is not available on this day of the week",
      );
    });
  });
});
