"use client";

import { useState, useCallback } from "react";
import { useBooking, type BookingRequest } from "./use-booking";
import { useGeolocation } from "./use-geolocation";
import type { CustomerFormData } from "@/components/application/booking/customer-form";
import type { BookingConfirmationData } from "@/components/application/booking/booking-confirmation";

export interface LocationValidationResult {
  isValid: boolean;
  distance: number;
  serviceRadius: number | null;
  businessName: string;
  businessLocation: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  alternatives?: Array<{
    id: string;
    name: string;
    distance: number;
    estimatedTravelTime: number;
  }>;
}

export interface LocationAwareBookingRequest extends BookingRequest {
  customerLocation?: {
    latitude: number;
    longitude: number;
  };
  skipLocationValidation?: boolean;
}

interface UseLocationAwareBookingOptions {
  onSuccess?: (booking: BookingConfirmationData) => void;
  onError?: (error: any) => void;
  onLocationValidationFailed?: (
    alternatives: LocationValidationResult["alternatives"],
  ) => void;
  autoRequestLocation?: boolean;
}

interface UseLocationAwareBookingResult {
  // Booking functionality
  submitBooking: (
    bookingData: LocationAwareBookingRequest,
  ) => Promise<BookingConfirmationData>;
  loading: boolean;
  error: any;
  clearError: () => void;

  // Location validation functionality
  validateLocation: (
    businessId: string,
    location: { latitude: number; longitude: number },
  ) => Promise<LocationValidationResult>;
  locationValidation: LocationValidationResult | null;
  validationLoading: boolean;
  validationError: string | null;
  clearValidationError: () => void;

  // Location detection
  currentLocation: { latitude: number; longitude: number } | null;
  locationLoading: boolean;
  locationError: string | null;
  requestLocation: () => Promise<void>;
  hasLocationPermission: boolean;
}

export function useLocationAwareBooking(
  options: UseLocationAwareBookingOptions = {},
): UseLocationAwareBookingResult {
  const [locationValidation, setLocationValidation] =
    useState<LocationValidationResult | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Use the existing booking hook
  const {
    submitBooking: originalSubmitBooking,
    loading,
    error,
    clearError,
  } = useBooking({
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

  // Use geolocation hook for automatic location detection
  const {
    location: currentLocation,
    loading: locationLoading,
    error: locationError,
    requestLocation,
    hasPermission: hasLocationPermission,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    autoRequest: options.autoRequestLocation,
  });

  // Validate customer location against business service area
  const validateLocation = useCallback(
    async (
      businessId: string,
      location: { latitude: number; longitude: number },
    ): Promise<LocationValidationResult> => {
      setValidationLoading(true);
      setValidationError(null);

      try {
        const response = await fetch("/api/bookings/validate-location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessId,
            customerLocation: location,
            includeAlternatives: true,
            maxAlternativeRadius: 50,
            maxAlternatives: 5,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to validate location");
        }

        const validation = result.validation;
        setLocationValidation(validation);

        // Notify about alternatives if customer is outside service area
        if (!validation.isValid && validation.alternatives?.length > 0) {
          options.onLocationValidationFailed?.(validation.alternatives);
        }

        return validation;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to validate location";
        setValidationError(errorMessage);
        throw err;
      } finally {
        setValidationLoading(false);
      }
    },
    [options],
  );

  // Enhanced booking submission with location validation
  const submitBooking = useCallback(
    async (
      bookingData: LocationAwareBookingRequest,
    ): Promise<BookingConfirmationData> => {
      // Include customer location in the booking request if available
      const enhancedBookingData = {
        ...bookingData,
        customerLocation:
          bookingData.customerLocation || currentLocation || undefined,
        skipLocationValidation: bookingData.skipLocationValidation || false,
      };

      return await originalSubmitBooking(enhancedBookingData);
    },
    [originalSubmitBooking, currentLocation],
  );

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  return {
    // Booking functionality
    submitBooking,
    loading,
    error,
    clearError,

    // Location validation functionality
    validateLocation,
    locationValidation,
    validationLoading,
    validationError,
    clearValidationError,

    // Location detection
    currentLocation,
    locationLoading,
    locationError,
    requestLocation,
    hasLocationPermission,
  };
}

// Helper function to create location-aware booking request
export function createLocationAwareBookingRequest(
  businessId: string,
  serviceId: string,
  customerData: CustomerFormData,
  appointmentDate: string,
  startTime: string,
  serviceDuration: number,
  customerLocation?: { latitude: number; longitude: number },
  skipLocationValidation?: boolean,
): LocationAwareBookingRequest {
  // Calculate end time based on service duration
  const timeParts = startTime.split(":");
  const startHours = parseInt(timeParts[0] ?? "0", 10);
  const startMinutes = parseInt(timeParts[1] ?? "0", 10);

  const startDate = new Date();
  startDate.setHours(startHours, startMinutes, 0, 0);

  const endDate = new Date(startDate.getTime() + serviceDuration * 60000);
  const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

  return {
    businessId,
    serviceId,
    customerName: customerData.name,
    customerEmail: customerData.email,
    customerPhone: customerData.phone,
    appointmentDate,
    startTime,
    endTime,
    notes: customerData.notes,
    customerLocation,
    skipLocationValidation,
  };
}
