/**
 * Enhanced API client for booking operations with comprehensive error handling
 */

import { type ErrorInfo } from "@/components/base/error-display";

export interface ApiError {
  code: string;
  message: string;
  suggestions?: string[];
  statusCode?: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export class BookingApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Make an API request with comprehensive error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      const duration = Date.now() - startTime;

      // Log slow requests
      if (duration > 3000) {
        console.warn(`Slow API request: ${endpoint} took ${duration}ms`);
      }

      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        // Handle structured error responses
        if (
          responseData &&
          typeof responseData === "object" &&
          "error" in responseData
        ) {
          return {
            success: false,
            error: {
              code: responseData.error,
              message: responseData.message || "An error occurred",
              suggestions: responseData.suggestions,
              statusCode: response.status,
            },
          };
        }

        // Handle generic HTTP errors
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: this.getHttpErrorMessage(response.status),
            statusCode: response.status,
          },
        };
      }

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message:
              "Unable to connect to the server. Please check your internet connection.",
            suggestions: [
              "Check your internet connection",
              "Try refreshing the page",
              "Contact support if the problem persists",
            ],
          },
        };
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          error: {
            code: "REQUEST_TIMEOUT",
            message: "The request took too long to complete.",
            suggestions: [
              "Try again in a moment",
              "Check your internet connection",
            ],
          },
        };
      }

      // Handle other errors
      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          suggestions: [
            "Please try again",
            "Contact support if the problem persists",
          ],
        },
      };
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: {
    businessId: string;
    serviceId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Promise<ApiResponse<{ appointment: unknown; message: string }>> {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
  ): Promise<ApiResponse<{ message: string; id: string }>> {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: "POST",
    });
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string): Promise<ApiResponse<unknown>> {
    return this.request(`/bookings/${bookingId}`);
  }

  /**
   * Update booking
   */
  async updateBooking(
    bookingId: string,
    updates: Partial<{
      appointmentDate: string;
      startTime: string;
      endTime: string;
      notes: string;
    }>,
  ): Promise<ApiResponse<unknown>> {
    return this.request(`/bookings/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Check availability for a time slot
   */
  async checkAvailability(params: {
    businessId: string;
    serviceId: string;
    appointmentDate: string;
    startTime: string;
  }): Promise<
    ApiResponse<{
      available: boolean;
      conflicts?: string[];
      suggestions?: unknown;
    }>
  > {
    const searchParams = new URLSearchParams(params);
    return this.request(`/availability?${searchParams.toString()}`);
  }

  /**
   * Get available time slots
   */
  async getAvailableSlots(params: {
    businessId: string;
    serviceId: string;
    date: string;
  }): Promise<ApiResponse<{ slots: unknown[] }>> {
    const searchParams = new URLSearchParams(params);
    return this.request(`/availability/slots?${searchParams.toString()}`);
  }

  /**
   * Convert API error to ErrorInfo format for display components
   */
  toErrorInfo(
    apiError: ApiError,
    context?: Record<string, unknown>,
  ): ErrorInfo {
    return {
      code: apiError.code,
      message: apiError.message,
      suggestions: apiError.suggestions,
      timestamp: new Date(),
      context,
      retryable: this.isRetryableError(apiError.code),
      severity: this.getErrorSeverity(apiError.code),
    };
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(code: string): boolean {
    const nonRetryableErrors = [
      "VALIDATION_ERROR",
      "BUSINESS_NOT_FOUND",
      "SERVICE_NOT_FOUND",
      "APPOINTMENT_NOT_FOUND",
    ];
    return !nonRetryableErrors.includes(code);
  }

  /**
   * Get error severity based on error code
   */
  private getErrorSeverity(code: string): ErrorInfo["severity"] {
    const criticalErrors = ["DATABASE_ERROR", "INTERNAL_SERVER_ERROR"];
    const highErrors = ["BOOKING_CONFLICT", "OPTIMISTIC_LOCK_ERROR"];
    const mediumErrors = [
      "VALIDATION_ERROR",
      "BUSINESS_UNAVAILABLE",
      "NETWORK_ERROR",
    ];
    const lowErrors = ["SERVICE_NOT_FOUND", "BUSINESS_NOT_FOUND"];

    if (criticalErrors.includes(code)) return "critical";
    if (highErrors.includes(code)) return "high";
    if (mediumErrors.includes(code)) return "medium";
    if (lowErrors.includes(code)) return "low";

    return "medium";
  }

  /**
   * Get user-friendly HTTP error messages
   */
  private getHttpErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return "The request was invalid. Please check your input and try again.";
      case 401:
        return "You need to be logged in to perform this action.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource could not be found.";
      case 409:
        return "There was a conflict with your request. Please try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "A server error occurred. Please try again later.";
      case 502:
        return "The server is temporarily unavailable. Please try again later.";
      case 503:
        return "The service is temporarily unavailable. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }
}

// Export singleton instance
export const bookingApi = new BookingApiClient();

/**
 * Hook for making API requests with automatic error handling
 */
export function useApiRequest<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (
    apiCall: () => Promise<ApiResponse<T>>,
    context?: Record<string, unknown>,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();

      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else if (response.error) {
        const errorInfo = bookingApi.toErrorInfo(response.error, context);
        setError(errorInfo);
        throw errorInfo;
      }
    } catch (err) {
      if (err instanceof Error && "code" in err) {
        // Already an ErrorInfo object
        setError(err as ErrorInfo);
        throw err;
      }

      // Convert unknown error to ErrorInfo
      const errorInfo: ErrorInfo = {
        code: "UNKNOWN_ERROR",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred",
        timestamp: new Date(),
        context,
        retryable: true,
        severity: "medium",
      };
      setError(errorInfo);
      throw errorInfo;
    } finally {
      setLoading(false);
    }
  };

  const retry = async (
    apiCall: () => Promise<ApiResponse<T>>,
    context?: Record<string, unknown>,
  ) => {
    return execute(apiCall, context);
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return {
    loading,
    error,
    data,
    execute,
    retry,
    reset,
  };
}

// Import useState for the hook
import { useState } from "react";
