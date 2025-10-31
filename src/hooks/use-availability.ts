"use client";

import { useState, useCallback, useEffect } from "react";

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilitySlot {
  date: string;
  dayOfWeek: number;
  slots: TimeSlot[];
}

export interface AvailabilityResponse {
  availability: AvailabilitySlot[];
}

export interface CheckAvailabilityResponse {
  available: boolean;
  reason?: string;
}

interface UseAvailabilityOptions {
  businessId: string;
  serviceId?: string;
  autoRefreshInterval?: number; // in milliseconds, 0 to disable
}

interface UseAvailabilityResult {
  availabilityData: AvailabilityResponse | null;
  loading: boolean;
  error: string | null;
  fetchAvailability: (serviceId?: string) => Promise<void>;
  checkSlotAvailability: (
    date: string,
    startTime: string,
    endTime: string,
  ) => Promise<boolean>;
  refreshAvailability: () => Promise<void>;
  clearError: () => void;
}

export function useAvailability({
  businessId,
  serviceId,
  autoRefreshInterval = 0,
}: UseAvailabilityOptions): UseAvailabilityResult {
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(
    async (targetServiceId?: string) => {
      const currentServiceId = targetServiceId ?? serviceId;
      if (!businessId || !currentServiceId) {
        setError("Business ID and Service ID are required");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const startDate = `${year}-${month}-${day}`;

        const params = new URLSearchParams({
          serviceId: currentServiceId,
          startDate,
          days: "30", // Get 30 days of availability
        });

        const response = await fetch(
          `/api/businesses/${businessId}/availability?${params.toString()}`,
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ??
              `HTTP ${response.status}: Failed to fetch availability`,
          );
        }

        const responseData = await response.json();

        // Handle both old and new API response formats
        let availabilityData: AvailabilityResponse;
        if (responseData.success && responseData.data) {
          // New format: { success: true, data: { availability: [...] } }
          availabilityData = { availability: responseData.data.availability };
        } else if (responseData.availability) {
          // Old format: { availability: [...] }
          availabilityData = responseData;
        } else {
          throw new Error("Invalid response format");
        }

        setAvailabilityData(availabilityData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load availability";
        setError(errorMessage);
        console.error("Availability fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [businessId, serviceId],
  );

  const checkSlotAvailability = useCallback(
    async (
      date: string,
      startTime: string,
      endTime: string,
    ): Promise<boolean> => {
      if (!businessId || !serviceId) {
        console.error(
          "Business ID and Service ID are required for slot checking",
        );
        return false;
      }

      try {
        const params = new URLSearchParams({
          businessId,
          serviceId,
          appointmentDate: date,
          startTime,
        });

        const response = await fetch(
          `/api/availability/check?${params.toString()}`,
        );

        if (!response.ok) {
          console.error("Failed to check slot availability:", response.status);
          return false;
        }

        const responseData = await response.json();

        // Handle both old and new API response formats
        if (responseData.success !== undefined) {
          // New format: { success: true, data: { available: boolean } }
          return responseData.success && responseData.data?.available === true;
        } else {
          // Old format: { available: boolean }
          return responseData.available === true;
        }
      } catch (err) {
        console.error("Error checking slot availability:", err);
        return false;
      }
    },
    [businessId, serviceId],
  );

  const refreshAvailability = useCallback(async () => {
    if (serviceId) {
      await fetchAvailability(serviceId);
    }
  }, [fetchAvailability, serviceId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefreshInterval > 0 && serviceId) {
      const interval = setInterval(() => {
        void refreshAvailability();
      }, autoRefreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, serviceId, refreshAvailability]);

  return {
    availabilityData,
    loading,
    error,
    fetchAvailability,
    checkSlotAvailability,
    refreshAvailability,
    clearError,
  };
}
