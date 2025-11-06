import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../route";
import { serviceRadiusValidationService } from "@/server/services/service-radius-validation";

// Mock the service
vi.mock("@/server/services/service-radius-validation", () => ({
  serviceRadiusValidationService: {
    validateBookingLocation: vi.fn(),
  },
}));

// Mock the error handler
vi.mock("@/app/api/_middleware/error-handler", () => ({
  withErrorHandler: (handler: any) => handler,
}));

describe("/api/bookings/validate-location", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (body: any) => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as any;
  };

  describe("POST", () => {
    it("should validate location successfully", async () => {
      const mockValidationResult = {
        isValid: true,
        distance: 5.2,
        serviceRadius: 10,
        businessName: "Test Business",
        businessLocation: {
          address: "123 Test St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      };

      vi.mocked(
        serviceRadiusValidationService.validateBookingLocation,
      ).mockResolvedValue(mockValidationResult);

      const request = createMockRequest({
        businessId: "test-business-id",
        customerLocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.validation).toEqual(mockValidationResult);
      expect(result.canBook).toBe(true);
      expect(result.message).toContain("5.2 miles from Test Business");
    });

    it("should handle customer outside service area", async () => {
      const mockValidationResult = {
        isValid: false,
        distance: 15.8,
        serviceRadius: 10,
        businessName: "Test Business",
        businessLocation: {
          address: "123 Test St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
        alternatives: [
          {
            id: "alt-business-1",
            name: "Alternative Business",
            distance: 8.5,
            estimatedTravelTime: 20,
          },
        ],
      };

      vi.mocked(
        serviceRadiusValidationService.validateBookingLocation,
      ).mockResolvedValue(mockValidationResult);

      const request = createMockRequest({
        businessId: "test-business-id",
        customerLocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
        includeAlternatives: true,
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.validation).toEqual(mockValidationResult);
      expect(result.canBook).toBe(false);
      expect(result.message).toContain("outside their 10 mile service area");
      expect(result.validation.alternatives).toHaveLength(1);
    });

    it("should handle unlimited service radius", async () => {
      const mockValidationResult = {
        isValid: true,
        distance: 25.3,
        serviceRadius: null,
        businessName: "Test Business",
        businessLocation: {
          address: "123 Test St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      };

      vi.mocked(
        serviceRadiusValidationService.validateBookingLocation,
      ).mockResolvedValue(mockValidationResult);

      const request = createMockRequest({
        businessId: "test-business-id",
        customerLocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.canBook).toBe(true);
      expect(result.message).toContain("25.3 miles from Test Business");
    });

    it("should validate request body", async () => {
      const request = createMockRequest({
        businessId: "", // Invalid empty business ID
        customerLocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should validate customer location coordinates", async () => {
      const request = createMockRequest({
        businessId: "test-business-id",
        customerLocation: {
          latitude: 91, // Invalid latitude
          longitude: -74.006,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should handle service errors", async () => {
      vi.mocked(
        serviceRadiusValidationService.validateBookingLocation,
      ).mockRejectedValue(new Error("Business not found"));

      const request = createMockRequest({
        businessId: "non-existent-business",
        customerLocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should handle invalid coordinates error", async () => {
      vi.mocked(
        serviceRadiusValidationService.validateBookingLocation,
      ).mockRejectedValue(new Error("Invalid customer coordinates provided"));

      const request = createMockRequest({
        businessId: "test-business-id",
        customerLocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should use default options when not provided", async () => {
      const mockValidationResult = {
        isValid: true,
        distance: 5.2,
        serviceRadius: 10,
        businessName: "Test Business",
        businessLocation: {
          address: "123 Test St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      };

      vi.mocked(
        serviceRadiusValidationService.validateBookingLocation,
      ).mockResolvedValue(mockValidationResult);

      const request = createMockRequest({
        businessId: "test-business-id",
        customerLocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });

      await POST(request);

      expect(
        serviceRadiusValidationService.validateBookingLocation,
      ).toHaveBeenCalledWith(
        "test-business-id",
        { latitude: 40.7128, longitude: -74.006 },
        {
          includeAlternatives: false,
          maxAlternativeRadius: 50,
          maxAlternatives: 5,
        },
      );
    });

    it("should use custom options when provided", async () => {
      const mockValidationResult = {
        isValid: false,
        distance: 15.8,
        serviceRadius: 10,
        businessName: "Test Business",
        businessLocation: {
          address: "123 Test St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
        alternatives: [],
      };

      vi.mocked(
        serviceRadiusValidationService.validateBookingLocation,
      ).mockResolvedValue(mockValidationResult);

      const request = createMockRequest({
        businessId: "test-business-id",
        customerLocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
        includeAlternatives: true,
        maxAlternativeRadius: 25,
        maxAlternatives: 3,
      });

      await POST(request);

      expect(
        serviceRadiusValidationService.validateBookingLocation,
      ).toHaveBeenCalledWith(
        "test-business-id",
        { latitude: 40.7128, longitude: -74.006 },
        {
          includeAlternatives: true,
          maxAlternativeRadius: 25,
          maxAlternatives: 3,
        },
      );
    });
  });
});
