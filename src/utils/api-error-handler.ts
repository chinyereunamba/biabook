import { clientErrorReporter } from "./client-error-reporter";
import { useToast } from "@/components/base/error-toast";

/**
 * Enhanced API error handling with comprehensive error reporting and user feedback
 */

export interface ApiError {
  error: string;
  message: string;
  suggestions?: string[];
  recovery?: {
    retryable: boolean;
    retryDelay?: number;
    maxRetries?: number;
    fallbackAction?: string;
  };
  correlationId?: string;
  timestamp?: string;
  debug?: {
    originalMessage: string;
    context: Record<string, unknown>;
    stack?: string;
  };
}

export interface ApiRequestContext {
  operation: string;
  businessId?: string;
  serviceId?: string;
  appointmentId?: string;
  userId?: string;
}

/**
 * Enhanced fetch wrapper with comprehensive error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit & {
    context?: ApiRequestContext;
    timeout?: number;
    retries?: number;
  } = {},
): Promise<T> {
  const {
    context = { operation: "unknown" },
    timeout = 30000,
    retries = 3,
    ...fetchOptions
  } = options;

  const startTime = Date.now();
  let lastError: Error | null = null;

  // Track API call start
  clientErrorReporter.trackApiCall(
    fetchOptions.method || "GET",
    url,
  );

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      // Track API call completion
      clientErrorReporter.trackApiCall(
        fetchOptions.method || "GET",
        url,
        response.status,
        duration,
      );

      if (!response.ok) {
        let errorData: ApiError;
        
        try {
          errorData = await response.json();
        } catch {
          // Fallback for non-JSON error responses
          errorData = {
            error: `HTTP_${response.status}`,
            message: response.statusText || "Request failed",
            suggestions: ["Please try again later"],
            recovery: {
              retryable: response.status >= 500,
              retryDelay: 2000,
              maxRetries: 3,
            },
          };
        }

        const apiError = new ApiRequestError(errorData, response.status, context);
        
        // Report API error
        await clientErrorReporter.reportApiError(
          apiError,
          {
            method: fetchOptions.method || "GET",
            url,
            status: response.status,
            response: errorData,
          },
          getErrorSeverity(response.status),
        );

        throw apiError;
      }

      // Parse successful response
      const data = await response.json();
      return data;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (
        error instanceof ApiRequestError ||
        error instanceof TypeError ||
        (error as any).name === "AbortError"
      ) {
        break;
      }

      // Wait before retry
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // All retries failed
  if (lastError) {
    const duration = Date.now() - startTime;
    
    // Track failed API call
    clientErrorReporter.trackApiCall(
      fetchOptions.method || "GET",
      url,
      0, // No status code for network errors
      duration,
    );

    // Report network/timeout error
    await clientErrorReporter.reportApiError(
      lastError,
      {
        method: fetchOptions.method || "GET",
        url,
        status: 0,
      },
      "high",
    );

    throw lastError;
  }

  throw new Error("Request failed after all retries");
}

/**
 * Custom error class for API request errors
 */
export class ApiRequestError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly suggestions: string[];
  public readonly recovery: ApiError["recovery"];
  public readonly correlationId?: string;
  public readonly context: ApiRequestContext;

  constructor(errorData: ApiError, statusCode: number, context: ApiRequestContext) {
    super(errorData.message);
    this.name = "ApiRequestError";
    this.code = errorData.error;
    this.statusCode = statusCode;
    this.suggestions = errorData.suggestions || [];
    this.recovery = errorData.recovery;
    this.correlationId = errorData.correlationId;
    this.context = context;
  }

  /**
   * Check if this error is retryable
   */
  isRetryable(): boolean {
    return this.recovery?.retryable ?? false;
  }

  /**
   * Get retry delay in milliseconds
   */
  getRetryDelay(): number {
    return this.recovery?.retryDelay ?? 2000;
  }

  /**
   * Get maximum retry attempts
   */
  getMaxRetries(): number {
    return this.recovery?.maxRetries ?? 3;
  }
}

/**
 * Determine error severity based on HTTP status code
 */
function getErrorSeverity(statusCode: number): "low" | "medium" | "high" | "critical" {
  if (statusCode >= 500) return "critical";
  if (statusCode === 429) return "high";
  if (statusCode >= 400) return "medium";
  return "low";
}

/**
 * React hook for API error handling with toast notifications
 */
export function useApiErrorHandler() {
  const { showError, showSuccess } = useToast();

  const handleApiError = (error: unknown, context?: ApiRequestContext) => {
    if (error instanceof ApiRequestError) {
      showError({
        code: error.code,
        message: error.message,
        suggestions: error.suggestions,
        severity: getErrorSeverity(error.statusCode),
        onRetry: error.isRetryable() ? () => {
          // Retry logic would be implemented by the calling component
          console.log("Retry requested for:", error.code);
        } : undefined,
        retryable: error.isRetryable(),
      });
    } else if (error instanceof Error) {
      showError({
        code: "UNKNOWN_ERROR",
        message: error.message,
        suggestions: ["Please try again later"],
        severity: "medium",
        retryable: true,
      });
    }
  };

  const handleApiSuccess = (message: string) => {
    showSuccess(message);
  };

  return {
    handleApiError,
    handleApiSuccess,
  };
}

/**
 * Booking-specific API request wrapper
 */
export async function bookingApiRequest<T>(
  url: string,
  options: RequestInit & {
    businessId?: string;
    serviceId?: string;
    appointmentId?: string;
    operation: string;
  },
): Promise<T> {
  const { businessId, serviceId, appointmentId, operation, ...fetchOptions } = options;

  return apiRequest<T>(url, {
    ...fetchOptions,
    context: {
      operation,
      businessId,
      serviceId,
      appointmentId,
    },
  });
}

/**
 * Utility functions for common booking operations
 */
export const bookingApi = {
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
  }) {
    return bookingApiRequest("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
      operation: "createBooking",
      businessId: bookingData.businessId,
      serviceId: bookingData.serviceId,
    });
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(appointmentId: string, reason?: string) {
    return bookingApiRequest(`/api/bookings/${appointmentId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
      operation: "cancelBooking",
      appointmentId,
    });
  },

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    appointmentId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
  ) {
    return bookingApiRequest(`/api/bookings/${appointmentId}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
      }),
      operation: "rescheduleBooking",
      appointmentId,
    });
  },

  /**
   * Get business services
   */
  async getServices(businessId: string) {
    return bookingApiRequest(`/api/businesses/${businessId}/services`, {
      method: "GET",
      operation: "getServices",
      businessId,
    });
  },

  /**
   * Get available time slots
   */
  async getAvailability(businessId: string, serviceId: string, date: string) {
    return bookingApiRequest(
      `/api/businesses/${businessId}/availability?serviceId=${serviceId}&date=${date}`,
      {
        method: "GET",
        operation: "getAvailability",
        businessId,
        serviceId,
      },
    );
  },
};

/**
 * Error recovery utilities
 */
export const errorRecovery = {
  /**
   * Retry an API request with exponential backoff
   */
  async retryWithBackoff<T>(
    requestFn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          break;
        }

        // Check if error is retryable
        if (error instanceof ApiRequestError && !error.isRetryable()) {
          break;
        }

        // Wait with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  },

  /**
   * Handle network connectivity issues
   */
  async withNetworkRetry<T>(requestFn: () => Promise<T>): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      // Check if it's a network error
      if (
        error instanceof TypeError ||
        (error as any).name === "NetworkError" ||
        (error as any).code === "NETWORK_ERROR"
      ) {
        // Wait for potential network recovery
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Try once more
        return await requestFn();
      }

      throw error;
    }
  },
};