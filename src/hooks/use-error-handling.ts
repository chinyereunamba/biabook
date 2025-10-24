"use client";

import React, { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface ApiError {
  error: string;
  message: string;
  suggestions?: string[];
  statusCode?: number;
}

export interface ErrorState {
  error: ApiError | null;
  isRetrying: boolean;
  retryCount: number;
  lastRetryAt: number | null;
}

export interface ErrorHandlingOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  toastDuration?: number;
  onError?: (error: ApiError) => void;
  onRetry?: (retryCount: number) => void;
  onMaxRetriesReached?: (error: ApiError) => void;
}

/**
 * Hook for handling API errors with retry logic and user feedback
 */
export function useErrorHandling(options: ErrorHandlingOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    showToast = true,
    toastDuration = 5000,
    onError,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    lastRetryAt: null,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle an API error
   */
  const handleError = useCallback(
    (error: unknown, context?: string) => {
      let apiError: ApiError;

      // Parse different error formats
      if (typeof error === "object" && error !== null) {
        if ("error" in error && "message" in error) {
          // API error format
          apiError = error as ApiError;
        } else if (error instanceof Error) {
          // JavaScript Error
          apiError = {
            error: "UNKNOWN_ERROR",
            message: error.message,
            suggestions: ["Please try again later"],
          };
        } else if ("message" in error) {
          // Generic error object
          apiError = {
            error: "UNKNOWN_ERROR",
            message: (error as { message: string }).message,
            suggestions: ["Please try again later"],
          };
        } else {
          // Unknown error format
          apiError = {
            error: "UNKNOWN_ERROR",
            message: "An unexpected error occurred",
            suggestions: ["Please try again later"],
          };
        }
      } else if (typeof error === "string") {
        // String error
        apiError = {
          error: "UNKNOWN_ERROR",
          message: error,
          suggestions: ["Please try again later"],
        };
      } else {
        // Completely unknown error
        apiError = {
          error: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
          suggestions: ["Please try again later"],
        };
      }

      // Add context to error message if provided
      if (context) {
        apiError.message = `${context}: ${apiError.message}`;
      }

      setErrorState((prev) => ({
        ...prev,
        error: apiError,
        isRetrying: false,
      }));

      // Show toast notification
      if (showToast) {
        const toastMessage = apiError.suggestions?.length
          ? `${apiError.message}\n${apiError.suggestions[0]}`
          : apiError.message;

        toast.error(toastMessage, {
          duration: toastDuration,
          description: apiError.suggestions?.slice(1).join(" • "),
        });
      }

      // Call custom error handler
      onError?.(apiError);
    },
    [showToast, toastDuration, onError],
  );

  /**
   * Retry the last failed operation
   */
  const retry = useCallback(
    async (retryFn: () => Promise<void>) => {
      const { error, retryCount } = errorState;

      if (!error || retryCount >= maxRetries) {
        if (error && retryCount >= maxRetries) {
          onMaxRetriesReached?.(error);
          toast.error(
            "Maximum retry attempts reached. Please contact support if the problem persists.",
          );
        }
        return;
      }

      setErrorState((prev) => ({
        ...prev,
        isRetrying: true,
      }));

      // Call retry callback
      onRetry?.(retryCount + 1);

      // Wait for retry delay
      await new Promise((resolve) => {
        retryTimeoutRef.current = setTimeout(resolve, retryDelay);
      });

      try {
        await retryFn();

        // Success - clear error state
        setErrorState({
          error: null,
          isRetrying: false,
          retryCount: 0,
          lastRetryAt: null,
        });

        if (showToast) {
          toast.success("Operation completed successfully");
        }
      } catch (retryError) {
        // Retry failed - update retry count
        setErrorState((prev) => ({
          ...prev,
          isRetrying: false,
          retryCount: prev.retryCount + 1,
          lastRetryAt: Date.now(),
        }));

        // Handle the retry error
        handleError(retryError, "Retry failed");
      }
    },
    [
      errorState,
      maxRetries,
      retryDelay,
      showToast,
      onRetry,
      onMaxRetriesReached,
      handleError,
    ],
  );

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      lastRetryAt: null,
    });
  }, []);

  /**
   * Check if the error is retryable
   */
  const canRetry =
    errorState.error !== null &&
    errorState.retryCount < maxRetries &&
    !errorState.isRetrying;

  /**
   * Get user-friendly error message with suggestions
   */
  const getErrorMessage = useCallback(() => {
    if (!errorState.error) return null;

    const { message, suggestions } = errorState.error;

    if (suggestions && suggestions.length > 0) {
      return {
        message,
        suggestions,
      };
    }

    return { message, suggestions: [] };
  }, [errorState.error]);

  /**
   * Get retry information
   */
  const getRetryInfo = useCallback(() => {
    if (!errorState.error) return null;

    return {
      canRetry,
      retryCount: errorState.retryCount,
      maxRetries,
      isRetrying: errorState.isRetrying,
      remainingRetries: maxRetries - errorState.retryCount,
    };
  }, [errorState, canRetry, maxRetries]);

  return {
    // Error state
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,

    // Actions
    handleError,
    retry,
    clearError,

    // Computed values
    canRetry,
    hasError: errorState.error !== null,

    // Helper functions
    getErrorMessage,
    getRetryInfo,
  };
}

/**
 * Hook for handling form validation errors
 */
export function useFormErrorHandling() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>("");

  const handleValidationError = useCallback((error: ApiError) => {
    // Clear previous errors
    setFieldErrors({});
    setGeneralError("");

    // Check if error contains field-specific validation errors
    if (error.error === "VALIDATION_ERROR" && error.suggestions) {
      const errors: Record<string, string> = {};

      error.suggestions.forEach((suggestion) => {
        // Parse field-specific errors (format: "field: message")
        const match = suggestion.match(/^(\w+):\s*(.+)$/);
        if (match) {
          const [, field, message] = match;
          if (field && message) {
            errors[field] = message;
          }
        }
      });

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        setGeneralError(error.message);
      }
    } else {
      setGeneralError(error.message);
    }
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setGeneralError("");
  }, []);

  const hasFieldError = useCallback(
    (field: string) => {
      return field in fieldErrors;
    },
    [fieldErrors],
  );

  const getFieldError = useCallback(
    (field: string) => {
      return fieldErrors[field] || "";
    },
    [fieldErrors],
  );

  return {
    fieldErrors,
    generalError,
    handleValidationError,
    clearFieldError,
    clearAllErrors,
    hasFieldError,
    getFieldError,
    hasErrors: Object.keys(fieldErrors).length > 0 || generalError !== "",
  };
}

/**
 * Hook for handling network connectivity errors
 */
export function useNetworkErrorHandling() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [networkError, setNetworkError] = useState<string>("");

  const handleNetworkError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      if (
        error.message.includes("fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        setNetworkError(
          "Network connection error. Please check your internet connection.",
        );
        return true; // Indicates this was a network error
      }
    }
    return false; // Not a network error
  }, []);

  const clearNetworkError = useCallback(() => {
    setNetworkError("");
  }, []);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkError("");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkError(
        "You are currently offline. Some features may not work properly.",
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    networkError,
    handleNetworkError,
    clearNetworkError,
    hasNetworkError: networkError !== "",
  };
}
