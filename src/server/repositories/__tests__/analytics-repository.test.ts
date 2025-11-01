import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "@/server/db";
import {
  businesses,
  services,
  appointments,
  users,
  categories,
} from "@/server/db/schema";
import { analyticsRepository } from "../analytics-repository";

describe("AnalyticsRepository", () => {
  const testBusinessId = "test-business-id";
  const testServiceId = "test-service-id";
  const testUserId = "test-user-id";
  const testCategoryId = "salon";

  beforeEach(async () => {
    // Clean up any existing test data
    await db.delete(appointments);
    await db.delete(services);
    await db.delete(businesses);
    await db.delete(users);
    await db.delete(categories);

    // Insert test user
    await db.insert(users).values({
      id: testUserId,
      name: "Test Owner",
      email: "owner@test.com",
    });

    // Insert test category
    await db.insert(categories).values({
      id: testCategoryId,
      name: "Salon",
    });

    // Insert test business
    await db.insert(businesses).values({
      id: testBusinessId,
      name: "Test Business",
      slug: "test-business",
      description: "Test Description",
      categoryId: testCategoryId,
      ownerId: testUserId,
    });

    // Insert test service
    await db.insert(services).values({
      id: testServiceId,
      businessId: testBusinessId,
      name: "Test Service",
      duration: 60,
      price: 5000, // $50.00 in cents
    });
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(appointments);
    await db.delete(services);
    await db.delete(businesses);
    await db.delete(users);
    await db.delete(categories);
  });

  describe("getBookingAnalytics", () => {
    it("should return correct analytics for business with no bookings", async () => {
      const analytics =
        await analyticsRepository.getBookingAnalytics(testBusinessId);

      expect(analytics.totalBookings).toBe(0);
      expect(analytics.confirmedBookings).toBe(0);
      expect(analytics.cancelledBookings).toBe(0);
      expect(analytics.pendingBookings).toBe(0);
      expect(analytics.completedBookings).toBe(0);
      expect(analytics.totalRevenue).toBe(0);
      expect(analytics.confirmedRevenue).toBe(0);
      expect(analytics.averageBookingValue).toBe(0);
      expect(analytics.totalCustomers).toBe(0);
      expect(analytics.repeatCustomers).toBe(0);
      expect(analytics.repeatCustomerRate).toBe(0);
    });

    it("should calculate correct analytics with mixed booking statuses", async () => {
      const today = new Date().toISOString().split("T")[0]!;

      // Insert test appointments with different statuses
      await db.insert(appointments).values([
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "+1234567890",
          appointmentDate: today,
          startTime: "09:00",
          endTime: "10:00",
          status: "confirmed",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          customerPhone: "+1234567891",
          appointmentDate: today,
          startTime: "10:00",
          endTime: "11:00",
          status: "pending",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "Bob Johnson",
          customerEmail: "bob@example.com",
          customerPhone: "+1234567892",
          appointmentDate: today,
          startTime: "11:00",
          endTime: "12:00",
          status: "cancelled",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "Alice Brown",
          customerEmail: "alice@example.com",
          customerPhone: "+1234567893",
          appointmentDate: today,
          startTime: "14:00",
          endTime: "15:00",
          status: "completed",
        },
      ]);

      const analytics =
        await analyticsRepository.getBookingAnalytics(testBusinessId);

      expect(analytics.totalBookings).toBe(4);
      expect(analytics.confirmedBookings).toBe(1);
      expect(analytics.cancelledBookings).toBe(1);
      expect(analytics.pendingBookings).toBe(1);
      expect(analytics.completedBookings).toBe(1);
      expect(analytics.totalRevenue).toBe(20000); // 4 * $50.00
      expect(analytics.confirmedRevenue).toBe(10000); // confirmed + completed
      expect(analytics.averageBookingValue).toBe(5000); // $50.00
      expect(analytics.totalCustomers).toBe(4);
      expect(analytics.repeatCustomers).toBe(0);
      expect(analytics.repeatCustomerRate).toBe(0);
    });

    it("should calculate repeat customer metrics correctly", async () => {
      const today = new Date().toISOString().split("T")[0]!;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0]!;

      // Insert appointments with repeat customers
      await db.insert(appointments).values([
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "+1234567890",
          appointmentDate: today,
          startTime: "09:00",
          endTime: "10:00",
          status: "confirmed",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "+1234567890",
          appointmentDate: yesterdayStr,
          startTime: "09:00",
          endTime: "10:00",
          status: "completed",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          customerPhone: "+1234567891",
          appointmentDate: today,
          startTime: "10:00",
          endTime: "11:00",
          status: "confirmed",
        },
      ]);

      const analytics =
        await analyticsRepository.getBookingAnalytics(testBusinessId);

      expect(analytics.totalCustomers).toBe(2);
      expect(analytics.repeatCustomers).toBe(1); // John has 2 bookings
      expect(analytics.repeatCustomerRate).toBe(50); // 1/2 * 100
    });

    it("should filter analytics by date range", async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const todayStr = today.toISOString().split("T")[0]!;
      const yesterdayStr = yesterday.toISOString().split("T")[0]!;
      const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0]!;

      // Insert appointments across different dates
      await db.insert(appointments).values([
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "+1234567890",
          appointmentDate: todayStr,
          startTime: "09:00",
          endTime: "10:00",
          status: "confirmed",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          customerPhone: "+1234567891",
          appointmentDate: yesterdayStr,
          startTime: "10:00",
          endTime: "11:00",
          status: "confirmed",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "Bob Johnson",
          customerEmail: "bob@example.com",
          customerPhone: "+1234567892",
          appointmentDate: twoDaysAgoStr,
          startTime: "11:00",
          endTime: "12:00",
          status: "confirmed",
        },
      ]);

      // Filter to only include yesterday and today
      const analytics = await analyticsRepository.getBookingAnalytics(
        testBusinessId,
        {
          from: yesterdayStr,
        },
      );

      expect(analytics.totalBookings).toBe(2); // Should exclude the appointment from 2 days ago
      expect(analytics.totalRevenue).toBe(10000); // 2 * $50.00
    });
  });

  describe("getServicePerformance", () => {
    it("should return service performance metrics", async () => {
      const today = new Date().toISOString().split("T")[0]!;

      // Create a second service
      const secondServiceId = "test-service-2";
      await db.insert(services).values({
        id: secondServiceId,
        businessId: testBusinessId,
        name: "Premium Service",
        duration: 90,
        price: 10000, // $100.00 in cents
      });

      // Insert appointments for both services
      await db.insert(appointments).values([
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "+1234567890",
          appointmentDate: today,
          startTime: "09:00",
          endTime: "10:00",
          status: "confirmed",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          customerPhone: "+1234567891",
          appointmentDate: today,
          startTime: "10:00",
          endTime: "11:00",
          status: "cancelled",
        },
        {
          businessId: testBusinessId,
          serviceId: secondServiceId,
          servicePrice: 10000,
          customerName: "Bob Johnson",
          customerEmail: "bob@example.com",
          customerPhone: "+1234567892",
          appointmentDate: today,
          startTime: "11:00",
          endTime: "12:30",
          status: "confirmed",
        },
      ]);

      const servicePerformance =
        await analyticsRepository.getServicePerformance(testBusinessId);

      expect(servicePerformance).toHaveLength(2);

      // Find the test service performance
      const testServicePerf = servicePerformance.find(
        (s) => s.serviceId === testServiceId,
      );
      expect(testServicePerf).toBeDefined();
      expect(testServicePerf!.serviceName).toBe("Test Service");
      expect(testServicePerf!.bookingCount).toBe(2);
      expect(testServicePerf!.revenue).toBe(10000);
      expect(testServicePerf!.averagePrice).toBe(5000);
      expect(testServicePerf!.cancellationRate).toBe(50); // 1 cancelled out of 2

      // Find the premium service performance
      const premiumServicePerf = servicePerformance.find(
        (s) => s.serviceId === secondServiceId,
      );
      expect(premiumServicePerf).toBeDefined();
      expect(premiumServicePerf!.serviceName).toBe("Premium Service");
      expect(premiumServicePerf!.bookingCount).toBe(1);
      expect(premiumServicePerf!.revenue).toBe(10000);
      expect(premiumServicePerf!.averagePrice).toBe(10000);
      expect(premiumServicePerf!.cancellationRate).toBe(0);
    });
  });

  describe("getBookingTrends", () => {
    it("should return booking trends over time", async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const todayStr = today.toISOString().split("T")[0]!;
      const yesterdayStr = yesterday.toISOString().split("T")[0]!;

      // Insert appointments across different dates
      await db.insert(appointments).values([
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "+1234567890",
          appointmentDate: todayStr,
          startTime: "09:00",
          endTime: "10:00",
          status: "confirmed",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          customerPhone: "+1234567891",
          appointmentDate: todayStr,
          startTime: "10:00",
          endTime: "11:00",
          status: "cancelled",
        },
        {
          businessId: testBusinessId,
          serviceId: testServiceId,
          servicePrice: 5000,
          customerName: "Bob Johnson",
          customerEmail: "bob@example.com",
          customerPhone: "+1234567892",
          appointmentDate: yesterdayStr,
          startTime: "11:00",
          endTime: "12:00",
          status: "confirmed",
        },
      ]);

      const trends = await analyticsRepository.getBookingTrends(
        testBusinessId,
        7,
      );

      // Should have entries for dates with bookings
      const todayTrend = trends.find((t) => t.date === todayStr);
      const yesterdayTrend = trends.find((t) => t.date === yesterdayStr);

      expect(todayTrend).toBeDefined();
      expect(todayTrend!.bookings).toBe(2);
      expect(todayTrend!.revenue).toBe(10000);
      expect(todayTrend!.confirmedBookings).toBe(1);
      expect(todayTrend!.cancelledBookings).toBe(1);

      expect(yesterdayTrend).toBeDefined();
      expect(yesterdayTrend!.bookings).toBe(1);
      expect(yesterdayTrend!.revenue).toBe(5000);
      expect(yesterdayTrend!.confirmedBookings).toBe(1);
      expect(yesterdayTrend!.cancelledBookings).toBe(0);
    });
  });
});
