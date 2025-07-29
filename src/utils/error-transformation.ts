import { type ErrorInfo } from "@/components/base/error-display";

/**
 * Transform API error responses to ErrorInfo format for UI error components
 */
export function transformApiErrorToErrorInfo(error: unknown): ErrorInfo {
  // Handle structured API errors (from our error handler middleware)
  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as {
      error: string;
      message: string;
      suggestions?: string[];
    };

    return {
      code: apiError.error,
      message: apiError.message,
      suggestions: apiError.suggestions,
      timestamp: new Date(),
      retryable: isRetryableError(apiError.error),
      severity: getSeverityFromCode(apiError.error),
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    return {
      code: "CLIENT_ERROR",
      message: error.message,
      timestamp: new Date(),
      retryable: true,
      severity: "medium",
    };
  }

  // Handle fetch errors
  if (error && typeof error === "object" && "status" in error) {
    const fetchError = error as { status: number; statusText?: string };

    return {
      code: `HTTP_${fetchError.status}`,
      message: getHttpErrorMessage(fetchError.status),
      timestamp: new Date(),
      retryable: isRetryableHttpStatus(fetchError.status),
      severity: getHttpErrorSeverity(fetchError.status),
    };
  }

  // Fallback for unknown errors
  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred. Please try again.",
    timestamp: new Date(),
    retryable: true,
    severity: "medium",
  };
}

/**
 * Determine if an error code represents a retryable error
 */
function isRetryableError(code: string): boolean {
  const nonRetryableErrors = [
    "VALIDATION_ERROR",
    "SERVICE_NOT_FOUND",
    "BUSINESS_NOT_FOUND",
    "APPOINTMENT_NOT_FOUND",
  ];

  return !nonRetryableErrors.includes(code);
}

/**
 * Determine error severity based on error code
 */
function getSeverityFromCode(code: string): ErrorInfo["severity"] {
  const criticalCodes = ["DATABASE_ERROR", "INTERNAL_SERVER_ERROR"];
  const highCodes = ["BOOKING_CONFLICT", "OPTIMISTIC_LOCK_ERROR"];
  const mediumCodes = ["VALIDATION_ERROR", "BUSINESS_UNAVAILABLE"];
  const lowCodes = ["SERVICE_NOT_FOUND", "BUSINESS_NOT_FOUND"];

  if (criticalCodes.includes(code)) return "critical";
  if (highCodes.includes(code)) return "high";
  if (mediumCodes.includes(code)) return "medium";
  if (lowCodes.includes(code)) return "low";

  return "medium";
}

/**
 * Get user-friendly message for HTTP status codes
 */
function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
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
    case 503:
    case 504:
      return "The service is temporarily unavailable. Please try again later.";
    default:
      return "An error occurred while processing your request.";
  }
}

/**
 * Determine if an HTTP status code represents a retryable error
 */
function isRetryableHttpStatus(status: number): boolean {
  // Client errors (4xx) are generally not retryable except for some cases
  if (status >= 400 && status < 500) {
    return [408, 429].includes(status); // Request timeout, rate limit
  }

  // Server errors (5xx) are generally retryable
  if (status >= 500) {
    return true;
  }

  return false;
}

/**
 * Get error severity for HTTP status codes
 */
function getHttpErrorSeverity(status: number): ErrorInfo["severity"] {
  if (status >= 500) return "critical";
  if (status === 429) return "high";
  if (status >= 400) return "medium";
  return "low";
}

/**
 * Enhanced error handler hook that uses the error transformation
 */
export function useApiErrorHandler() {
  const handleApiError = (
    error: unknown,
    context?: Record<string, unknown>,
  ) => {
    const errorInfo = transformApiErrorToErrorInfo(error);

    // Add context if provided
    if (context) {
      errorInfo.context = { ...errorInfo.context, ...context };
    }

    return errorInfo;
  };

  return { handleApiError };
}
