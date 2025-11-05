/**
 * React hook for timezone operations
 */

import { useState, useEffect, useCallback } from "react";
import type { Coordinates } from "@/types/location";
import { LocationError } from "@/types/location";
import {
  getUserTimezone,
  detectTimezoneFromLocation,
  convertAppointmentTimezones,
  formatAppointmentTimeDisplay,
  type TimezoneConversionResult,
  type AppointmentBookingPayload,
} from "@/lib/timezone-utils";

/**
 * Timezone detection state
 */
interface TimezoneState {
  userTimezone: string;
  detectedTimezone: string | null;
  isDetecting: boolean;
  error: string | null;
}

/**
 * Hook for timezone detection and management
 */
export function useTimezone() {
  const [state, setState] = useState<TimezoneState>({
    userTimezone: getUserTimezone(),
    detectedTimezone: null,
    isDetecting: false,
    error: null,
  });

  /**
   * Detect timezone from user's location
   */
  const detectTimezone = useCallback(async () => {
    setState((prev) => ({ ...prev, isDetecting: true, error: null }));

    try {
      const timezone = await detectTimezoneFromLocation();
      setState((prev) => ({
        ...prev,
        detectedTimezone: timezone,
        isDetecting: false,
      }));
      return timezone;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to detect timezone";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isDetecting: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Detect timezone from coordinates
   */
  const detectTimezoneFromCoordinates = useCallback(
    async (coordinates: Coordinates) => {
      setState((prev) => ({ ...prev, isDetecting: true, error: null }));

      try {
        const response = await fetch("/api/timezone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coordinates }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new LocationError(
            errorData.code || "TIMEZONE_DETECTION_FAILED",
            errorData.error || "Failed to detect timezone",
            errorData.fallbackAction,
          );
        }

        const data = await response.json();
        setState((prev) => ({
          ...prev,
          detectedTimezone: data.timezone,
          isDetecting: false,
        }));

        return data.timezone;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to detect timezone";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isDetecting: false,
        }));
        throw error;
      }
    },
    [],
  );

  /**
   * Get current timezone (detected or user's browser timezone)
   */
  const getCurrentTimezone = useCallback(() => {
    return state.detectedTimezone || state.userTimezone;
  }, [state.detectedTimezone, state.userTimezone]);

  return {
    ...state,
    detectTimezone,
    detectTimezoneFromCoordinates,
    getCurrentTimezone,
  };
}

/**
 * Hook for timezone conversion operations
 */
export function useTimezoneConversion() {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Convert appointment time between timezones
   */
  const convertAppointmentTime = useCallback(
    async (
      date: string,
      time: string,
      businessTimezone: string,
      customerTimezone?: string,
    ): Promise<TimezoneConversionResult> => {
      setIsConverting(true);
      setError(null);

      try {
        const result = await convertAppointmentTimezones(
          date,
          time,
          businessTimezone,
          customerTimezone,
        );
        setIsConverting(false);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to convert timezone";
        setError(errorMessage);
        setIsConverting(false);
        throw error;
      }
    },
    [],
  );

  /**
   * Create booking payload with timezone information
   */
  const createBookingPayload = useCallback(
    async (
      date: string,
      time: string,
      businessTimezone: string,
      customerTimezone?: string,
    ): Promise<AppointmentBookingPayload> => {
      setIsConverting(true);
      setError(null);

      try {
        const response = await fetch("/api/timezone/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            time,
            businessTimezone,
            customerTimezone,
            operation: "booking-payload",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create booking payload",
          );
        }

        const payload = await response.json();
        setIsConverting(false);
        return payload;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create booking payload";
        setError(errorMessage);
        setIsConverting(false);
        throw error;
      }
    },
    [],
  );

  return {
    isConverting,
    error,
    convertAppointmentTime,
    createBookingPayload,
  };
}

/**
 * Hook for business timezone management
 */
export function useBusinessTimezone(businessId: string) {
  const [timezone, setTimezone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load business timezone
   */
  const loadTimezone = useCallback(async () => {
    if (!businessId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/timezone/business?businessId=${businessId}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          setTimezone(null);
          setIsLoading(false);
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load business timezone");
      }

      const data = await response.json();
      setTimezone(data.timezone);
      setIsLoading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load business timezone";
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [businessId]);

  /**
   * Update business timezone
   */
  const updateTimezone = useCallback(
    async (newTimezone: string) => {
      if (!businessId) return;

      setIsUpdating(true);
      setError(null);

      try {
        const response = await fetch("/api/timezone/business", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId,
            timezone: newTimezone,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to update business timezone",
          );
        }

        const data = await response.json();
        setTimezone(newTimezone);
        setIsUpdating(false);

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update business timezone";
        setError(errorMessage);
        setIsUpdating(false);
        throw error;
      }
    },
    [businessId],
  );

  // Load timezone on mount
  useEffect(() => {
    loadTimezone();
  }, [loadTimezone]);

  return {
    timezone,
    isLoading,
    isUpdating,
    error,
    loadTimezone,
    updateTimezone,
  };
}

/**
 * Hook for formatting appointment times with timezone
 */
export function useAppointmentTimeFormat() {
  const formatTime = useCallback(
    (date: string, time: string, timezone: string, showTimezone = true) => {
      return formatAppointmentTimeDisplay(date, time, timezone, showTimezone);
    },
    [],
  );

  const formatTimeRange = useCallback(
    (
      date: string,
      startTime: string,
      endTime: string,
      timezone: string,
      showTimezone = true,
    ) => {
      const formattedStart = formatAppointmentTimeDisplay(
        date,
        startTime,
        timezone,
        false,
      );
      const formattedEnd = formatAppointmentTimeDisplay(
        date,
        endTime,
        timezone,
        showTimezone,
      );

      return `${formattedStart} - ${formattedEnd}`;
    },
    [],
  );

  return {
    formatTime,
    formatTimeRange,
  };
}
