/**
 * Comprehensive location error handling with recovery strategies
 */

import { LocationError, LocationErrorCode } from "@/types/location";

// Enhanced error codes for more specific error handling
export enum EnhancedLocationErrorCode {
  // Geolocation errors
  GEOLOCATION_DENIED = "GEOLOCATION_DENIED",
  GEOLOCATION_UNAVAILABLE = "GEOLOCATION_UNAVAILABLE",
  GEOLOCATION_TIMEOUT = "GEOLOCATION_TIMEOUT",
  GEOLOCATION_POSITION_UNAVAILABLE = "GEOLOCATION_POSITION_UNAVAILABLE",

  // Geocoding errors
  GEOCODING_FAILED = "GEOCODING_FAILED",
  GEOCODING_QUOTA_EXCEEDED = "GEOCODING_QUOTA_EXCEEDED",
  GEOCODING_INVALID_REQUEST = "GEOCODING_INVALID_REQUEST",
  GEOCODING_ZERO_RESULTS = "GEOCODING_ZERO_RESULTS",

  // Coordinate validation errors
  INVALID_COORDINATES = "INVALID_COORDINATES",
  COORDINATES_OUT_OF_BOUNDS = "COORDINATES_OUT_OF_BOUNDS",

  // Service area errors
  OUTSIDE_SERVICE_AREA = "OUTSIDE_SERVICE_AREA",
  SERVICE_RADIUS_EXCEEDED = "SERVICE_RADIUS_EXCEEDED",

  // Timezone errors
  TIMEZONE_DETECTION_FAILED = "TIMEZONE_DETECTION_FAILED",
  TIMEZONE_CONVERSION_FAILED = "TIMEZONE_CONVERSION_FAILED",
  INVALID_TIMEZONE = "INVALID_TIMEZONE",

  // Map integration errors
  MAP_LOADING_FAILED = "MAP_LOADING_FAILED",
  MAP_API_KEY_INVALID = "MAP_API_KEY_INVALID",
  MAP_QUOTA_EXCEEDED = "MAP_QUOTA_EXCEEDED",

  // Network and API errors
  NETWORK_ERROR = "NETWORK_ERROR",
  API_RATE_LIMIT_EXCEEDED = "API_RATE_LIMIT_EXCEEDED",
  API_UNAVAILABLE = "API_UNAVAILABLE",

  // Data validation errors
  INVALID_ADDRESS_FORMAT = "INVALID_ADDRESS_FORMAT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Database errors
  LOCATION_SAVE_FAILED = "LOCATION_SAVE_FAILED",
  LOCATION_RETRIEVAL_FAILED = "LOCATION_RETRIEVAL_FAILED",
}

// Error recovery strategy interface
export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  fallbackAction?: string;
  userMessage: string;
  technicalMessage: string;
  retryable: boolean;
  retryDelay?: number; // in milliseconds
  maxRetries?: number;
}

// Enhanced location error class
export class EnhancedLocationError extends Error {
  constructor(
    public code: EnhancedLocationErrorCode,
    message: string,
    public originalError?: Error,
    public context?: Record<string, unknown>,
    public recoveryStrategy?: ErrorRecoveryStrategy,
  ) {
    super(message);
    this.name = "EnhancedLocationError";
  }
}

// Error recovery strategies for each error type
const ERROR_RECOVERY_STRATEGIES: Record<
  EnhancedLocationErrorCode,
  ErrorRecoveryStrategy
> = {
  [EnhancedLocationErrorCode.GEOLOCATION_DENIED]: {
    canRecover: true,
    fallbackAction: "manual_location_entry",
    userMessage:
      "Location access was denied. Please enter your address manually or allow location access in your browser settings.",
    technicalMessage: "User denied geolocation permission",
    retryable: false,
  },

  [EnhancedLocationErrorCode.GEOLOCATION_UNAVAILABLE]: {
    canRecover: true,
    fallbackAction: "manual_location_entry",
    userMessage:
      "Your location couldn't be determined automatically. Please enter your address manually.",
    technicalMessage: "Geolocation service unavailable",
    retryable: true,
    retryDelay: 2000,
    maxRetries: 2,
  },

  [EnhancedLocationErrorCode.GEOLOCATION_TIMEOUT]: {
    canRecover: true,
    fallbackAction: "manual_location_entry",
    userMessage:
      "Location detection is taking too long. Please enter your address manually.",
    technicalMessage: "Geolocation request timed out",
    retryable: true,
    retryDelay: 1000,
    maxRetries: 1,
  },

  [EnhancedLocationErrorCode.GEOCODING_FAILED]: {
    canRecover: true,
    fallbackAction: "manual_coordinates_entry",
    userMessage:
      "We couldn't find that address. Please check the spelling or try a different address.",
    technicalMessage: "Geocoding service failed to process address",
    retryable: true,
    retryDelay: 1000,
    maxRetries: 2,
  },

  [EnhancedLocationErrorCode.GEOCODING_QUOTA_EXCEEDED]: {
    canRecover: true,
    fallbackAction: "cached_results_only",
    userMessage:
      "Location services are temporarily limited. Please try again later or contact support.",
    technicalMessage: "Geocoding API quota exceeded",
    retryable: true,
    retryDelay: 60000, // 1 minute
    maxRetries: 1,
  },

  [EnhancedLocationErrorCode.GEOCODING_ZERO_RESULTS]: {
    canRecover: true,
    fallbackAction: "address_suggestions",
    userMessage:
      "No results found for that address. Please check the spelling or try a nearby address.",
    technicalMessage: "Geocoding returned zero results",
    retryable: false,
  },

  [EnhancedLocationErrorCode.OUTSIDE_SERVICE_AREA]: {
    canRecover: true,
    fallbackAction: "suggest_alternatives",
    userMessage:
      "This business doesn't serve your area. We'll show you similar businesses nearby.",
    technicalMessage: "Customer location outside business service radius",
    retryable: false,
  },

  [EnhancedLocationErrorCode.TIMEZONE_DETECTION_FAILED]: {
    canRecover: true,
    fallbackAction: "default_timezone",
    userMessage:
      "We'll use the business's timezone for your appointment. Please verify the time when booking.",
    technicalMessage: "Failed to detect timezone from coordinates",
    retryable: true,
    retryDelay: 1000,
    maxRetries: 1,
  },

  [EnhancedLocationErrorCode.MAP_LOADING_FAILED]: {
    canRecover: true,
    fallbackAction: "address_display",
    userMessage: "Map couldn't load. We'll show you the address instead.",
    technicalMessage: "Map API failed to load",
    retryable: true,
    retryDelay: 2000,
    maxRetries: 1,
  },

  [EnhancedLocationErrorCode.MAP_API_KEY_INVALID]: {
    canRecover: true,
    fallbackAction: "fallback_map_provider",
    userMessage:
      "Map temporarily unavailable. We'll show you the address instead.",
    technicalMessage: "Google Maps API key invalid or expired",
    retryable: false,
  },

  [EnhancedLocationErrorCode.NETWORK_ERROR]: {
    canRecover: true,
    fallbackAction: "cached_results",
    userMessage:
      "Network connection issue. Please check your internet connection and try again.",
    technicalMessage: "Network request failed",
    retryable: true,
    retryDelay: 3000,
    maxRetries: 3,
  },

  [EnhancedLocationErrorCode.API_RATE_LIMIT_EXCEEDED]: {
    canRecover: true,
    fallbackAction: "cached_results_only",
    userMessage: "Service temporarily busy. Please try again in a moment.",
    technicalMessage: "API rate limit exceeded",
    retryable: true,
    retryDelay: 5000,
    maxRetries: 2,
  },

  [EnhancedLocationErrorCode.INVALID_COORDINATES]: {
    canRecover: true,
    fallbackAction: "address_geocoding",
    userMessage:
      "Invalid location coordinates. Please enter your address instead.",
    technicalMessage: "Coordinates validation failed",
    retryable: false,
  },

  [EnhancedLocationErrorCode.INVALID_ADDRESS_FORMAT]: {
    canRecover: true,
    fallbackAction: "address_validation_help",
    userMessage:
      "Please check your address format. Make sure to include street, city, and ZIP code.",
    technicalMessage: "Address format validation failed",
    retryable: false,
  },

  [EnhancedLocationErrorCode.LOCATION_SAVE_FAILED]: {
    canRecover: true,
    fallbackAction: "retry_save",
    userMessage: "Couldn't save your location. Please try again.",
    technicalMessage: "Database save operation failed",
    retryable: true,
    retryDelay: 2000,
    maxRetries: 2,
  },

  // Default strategies for remaining error codes
  [EnhancedLocationErrorCode.GEOLOCATION_POSITION_UNAVAILABLE]: {
    canRecover: true,
    fallbackAction: "manual_location_entry",
    userMessage: "Location unavailable. Please enter your address manually.",
    technicalMessage: "Geolocation position unavailable",
    retryable: false,
  },

  [EnhancedLocationErrorCode.GEOCODING_INVALID_REQUEST]: {
    canRecover: true,
    fallbackAction: "address_validation_help",
    userMessage: "Invalid address format. Please check your input.",
    technicalMessage: "Geocoding request invalid",
    retryable: false,
  },

  [EnhancedLocationErrorCode.COORDINATES_OUT_OF_BOUNDS]: {
    canRecover: true,
    fallbackAction: "address_geocoding",
    userMessage: "Invalid coordinates. Please enter your address instead.",
    technicalMessage: "Coordinates out of valid bounds",
    retryable: false,
  },

  [EnhancedLocationErrorCode.SERVICE_RADIUS_EXCEEDED]: {
    canRecover: true,
    fallbackAction: "suggest_alternatives",
    userMessage:
      "You're outside this business's service area. We'll show you nearby alternatives.",
    technicalMessage: "Customer location exceeds service radius",
    retryable: false,
  },

  [EnhancedLocationErrorCode.TIMEZONE_CONVERSION_FAILED]: {
    canRecover: true,
    fallbackAction: "default_timezone",
    userMessage:
      "Timezone conversion failed. Times shown in business timezone.",
    technicalMessage: "Timezone conversion operation failed",
    retryable: true,
    retryDelay: 1000,
    maxRetries: 1,
  },

  [EnhancedLocationErrorCode.INVALID_TIMEZONE]: {
    canRecover: true,
    fallbackAction: "default_timezone",
    userMessage: "Invalid timezone detected. Using business timezone.",
    technicalMessage: "Timezone validation failed",
    retryable: false,
  },

  [EnhancedLocationErrorCode.MAP_QUOTA_EXCEEDED]: {
    canRecover: true,
    fallbackAction: "fallback_map_provider",
    userMessage:
      "Map temporarily unavailable. We'll show you the address instead.",
    technicalMessage: "Map API quota exceeded",
    retryable: true,
    retryDelay: 60000,
    maxRetries: 1,
  },

  [EnhancedLocationErrorCode.API_UNAVAILABLE]: {
    canRecover: true,
    fallbackAction: "cached_results",
    userMessage:
      "Location services temporarily unavailable. Please try again later.",
    technicalMessage: "External API service unavailable",
    retryable: true,
    retryDelay: 10000,
    maxRetries: 2,
  },

  [EnhancedLocationErrorCode.MISSING_REQUIRED_FIELD]: {
    canRecover: true,
    fallbackAction: "field_validation_help",
    userMessage: "Please fill in all required location fields.",
    technicalMessage: "Required field missing in location data",
    retryable: false,
  },

  [EnhancedLocationErrorCode.LOCATION_RETRIEVAL_FAILED]: {
    canRecover: true,
    fallbackAction: "retry_retrieval",
    userMessage: "Couldn't load location data. Please try again.",
    technicalMessage: "Database retrieval operation failed",
    retryable: true,
    retryDelay: 2000,
    maxRetries: 2,
  },
};

/**
 * Location error handler class with comprehensive recovery strategies
 */
export class LocationErrorHandler {
  /**
   * Creates an enhanced location error with recovery strategy
   */
  static createError(
    code: EnhancedLocationErrorCode,
    message?: string,
    originalError?: Error,
    context?: Record<string, unknown>,
  ): EnhancedLocationError {
    const strategy = ERROR_RECOVERY_STRATEGIES[code];
    const errorMessage = message || strategy.technicalMessage;

    return new EnhancedLocationError(
      code,
      errorMessage,
      originalError,
      context,
      strategy,
    );
  }

  /**
   * Gets user-friendly error message for display
   */
  static getUserMessage(error: EnhancedLocationError): string {
    return error.recoveryStrategy?.userMessage || error.message;
  }

  /**
   * Gets fallback action for error recovery
   */
  static getFallbackAction(error: EnhancedLocationError): string | undefined {
    return error.recoveryStrategy?.fallbackAction;
  }

  /**
   * Determines if error is retryable
   */
  static isRetryable(error: EnhancedLocationError): boolean {
    return error.recoveryStrategy?.retryable || false;
  }

  /**
   * Gets retry delay for retryable errors
   */
  static getRetryDelay(error: EnhancedLocationError): number {
    return error.recoveryStrategy?.retryDelay || 1000;
  }

  /**
   * Gets maximum retry attempts
   */
  static getMaxRetries(error: EnhancedLocationError): number {
    return error.recoveryStrategy?.maxRetries || 1;
  }

  /**
   * Handles geolocation API errors
   */
  static handleGeolocationError(
    error: GeolocationPositionError,
  ): EnhancedLocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return this.createError(
          EnhancedLocationErrorCode.GEOLOCATION_DENIED,
          "User denied geolocation permission",
          new Error(error.message),
          { code: error.code },
        );

      case error.POSITION_UNAVAILABLE:
        return this.createError(
          EnhancedLocationErrorCode.GEOLOCATION_POSITION_UNAVAILABLE,
          "Geolocation position unavailable",
          new Error(error.message),
          { code: error.code },
        );

      case error.TIMEOUT:
        return this.createError(
          EnhancedLocationErrorCode.GEOLOCATION_TIMEOUT,
          "Geolocation request timed out",
          new Error(error.message),
          { code: error.code },
        );

      default:
        return this.createError(
          EnhancedLocationErrorCode.GEOLOCATION_UNAVAILABLE,
          "Geolocation service unavailable",
          new Error(error.message),
          { code: error.code },
        );
    }
  }

  /**
   * Handles Google Maps API errors
   */
  static handleGoogleMapsError(
    status: string,
    context?: Record<string, unknown>,
  ): EnhancedLocationError {
    switch (status) {
      case "ZERO_RESULTS":
        return this.createError(
          EnhancedLocationErrorCode.GEOCODING_ZERO_RESULTS,
          "No results found for address",
          undefined,
          context,
        );

      case "OVER_QUERY_LIMIT":
        return this.createError(
          EnhancedLocationErrorCode.GEOCODING_QUOTA_EXCEEDED,
          "Geocoding quota exceeded",
          undefined,
          context,
        );

      case "REQUEST_DENIED":
        return this.createError(
          EnhancedLocationErrorCode.MAP_API_KEY_INVALID,
          "API key invalid or request denied",
          undefined,
          context,
        );

      case "INVALID_REQUEST":
        return this.createError(
          EnhancedLocationErrorCode.GEOCODING_INVALID_REQUEST,
          "Invalid geocoding request",
          undefined,
          context,
        );

      default:
        return this.createError(
          EnhancedLocationErrorCode.GEOCODING_FAILED,
          `Geocoding failed with status: ${status}`,
          undefined,
          { ...context, status },
        );
    }
  }

  /**
   * Handles network-related errors
   */
  static handleNetworkError(
    error: Error,
    context?: Record<string, unknown>,
  ): EnhancedLocationError {
    if (error.message.includes("rate limit") || error.message.includes("429")) {
      return this.createError(
        EnhancedLocationErrorCode.API_RATE_LIMIT_EXCEEDED,
        "API rate limit exceeded",
        error,
        context,
      );
    }

    if (error.message.includes("network") || error.message.includes("fetch")) {
      return this.createError(
        EnhancedLocationErrorCode.NETWORK_ERROR,
        "Network request failed",
        error,
        context,
      );
    }

    return this.createError(
      EnhancedLocationErrorCode.API_UNAVAILABLE,
      "External API unavailable",
      error,
      context,
    );
  }

  /**
   * Logs error with appropriate level and context
   */
  static logError(
    error: EnhancedLocationError,
    additionalContext?: Record<string, unknown>,
  ): void {
    const logContext = {
      code: error.code,
      message: error.message,
      originalError: error.originalError?.message,
      context: error.context,
      recoveryStrategy: error.recoveryStrategy?.fallbackAction,
      ...additionalContext,
    };

    // Use different log levels based on error severity
    if (error.recoveryStrategy?.canRecover) {
      console.warn("Recoverable location error:", logContext);
    } else {
      console.error("Location error:", logContext);
    }
  }
}
