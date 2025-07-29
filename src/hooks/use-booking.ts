"use client";

import { useState, useCallback } from "react";
import type { CustomerFormData } from "@/components/application/booking/customer-form";
import type { BookingConfirmationData } from "@/components/application/booking/booking-confirmation";

export interface BookingRequest {
  businessId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface BookingResponse {
  appointment: BookingConfirmationData;
  message?: string;
  error?: string;
}

export interface BookingError {
  message: string;
  type?:
    | "CONFLICT"
    | "VALIDATION"
    | "NOT_FOUND"
    | "SERVER_ERROR"
    | "NETWORK_ERROR";
  field?: string;
  suggestions?: string[];
}

interface UseBookingOptions {
  onSuccess?: (booking: BookingConfirmationData) => void;
  onError?: (error: BookingError) => void;
}

interface UseBookingResult {
  submitBooking: (
    bookingData: BookingRequest,
  ) => Promise<BookingConfirmationData>;
  loading: boolean;
  error: BookingError | null;
  clearError: () => void;
}

export function useBooking(options: UseBookingOptions = {}): UseBookingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BookingError | null>(null);

  const submitBooking = useCallback(
    async (bookingData: BookingRequest): Promise<BookingConfirmationData> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        });

        const result: BookingResponse = await response.json();

        if (!response.ok) {
          // Handle different types of errors
          let bookingError: BookingError;

          if (response.status === 400) {
            // Validation or business logic error
            bookingError = {
              message: result.error ?? "Invalid booking information",
              suggestions: [
                "Please check your booking details and try again",
                "Make sure all required fields are filled correctly",
              ],
            };
          } else if (response.status === 409) {
            // Conflict error (time slot no longer available)
            bookingError = {
              message: result.error ?? "Time slot is no longer available",
              suggestions: [
                "Please select a different time slot",
                "The selected time may have been booked by someone else",
                "Try refreshing the availability and selecting again",
              ],
            };
          } else if (response.status === 404) {
            // Business or service not found
            bookingError = {
              message: result.error ?? "Business or service not found",
              suggestions: [
                "Please try refreshing the page",
                "The business or service may no longer be available",
              ],
            };
          } else {
            // Generic server error
            bookingError = {
              message: result.error ?? "Failed to create booking",
              suggestions: [
                "Please try again in a few moments",
                "If the problem persists, contact support",
              ],
            };
          }

          setError(bookingError);
          options.onError?.(bookingError);
          throw new Error(bookingError.message);
        }

        // Success
        const appointment = result.appointment;
        options.onSuccess?.(appointment);
        return appointment;
      } catch (err) {
        // Network or other errors
        if (err instanceof Error && err.message !== error?.message) {
          const networkError: BookingError = {
            message: err.message.includes("fetch")
              ? "Network error - please check your connection"
              : err.message,
            suggestions: [
              "Please check your internet connection",
              "Try again in a few moments",
            ],
          };
          setError(networkError);
          options.onError?.(networkError);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options, error?.message],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    submitBooking,
    loading,
    error,
    clearError,
  };
}

export function createBookingRequest(
  businessId: string,
  serviceId: string,
  customerData: CustomerFormData,
  appointmentDate: string,
  startTime: string,
  serviceDuration: number,
): BookingRequest {
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
  };
}
