/**
 * Comprehensive error handling system for booking operations
 * Provides consistent error handling, logging, and user feedback
 */

import { bookingLogger } from "@/server/logging/booking-logger";
import { BookingError, isBookingError, toBookingError } from "./booking-errors";

export interface ErrorContext {
  operation: string;
  path: string;
  method: string;
  userId?: string;
  businessId?: string;
  appointmentId?: string;
  serviceId?: string;
  userAgent?: string;
  referer?: string;
  [key: string]: unknown;
}

export interface ErrorRecoveryOptions {
  retryable: boolean;
  retryDelay?: number;
  maxRetries?: number;
  fallbackAction?: string;
  suggestions: string[];
}

export interface ProcessedError {
  code: string;
  message: string;
  userMessage: string;
  statusCode: number;
  suggestions: string[];
  recovery: ErrorRecoveryOptions;
  context: ErrorContext;
  timestamp: Date;
  correlationId: string;
}

/**
 * Enhanced error processor that provides comprehensive error handling
 */
export class ErrorProcessor {
  private static generateCorrelationId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Process any error into a standardized format with recovery options
   */
  static processError(error: unknown, context: ErrorContext): ProcessedError {
    const correlationId = this.generateCorrelationId();
    const timestamp = new Date();
    const bookingError = toBookingError(error);

    // Log the error with full context
    bookingLogger.error(
      `Error in ${context.operation}`,
      bookingError,
      context,
      {
        correlationId,
        statusCode: bookingError.statusCode,
      },
    );

    // Determine recovery options based on error type
    const recovery = this.getRecoveryOptions(bookingError, context);

    return {
      code: bookingError.code,
      message: bookingError.message,
      userMessage: bookingError.userMessage,
      statusCode: bookingError.statusCode,
      suggestions: bookingError.suggestions || [],
      recovery,
      context,
      timestamp,
      correlationId,
    };
  }

  /**
   * Get recovery options based on error type and context
   */
  private static getRecoveryOptions(
    error: BookingError,
    context: ErrorContext,
  ): ErrorRecoveryOptions {
    const baseOptions: ErrorRecoveryOptions = {
      retryable: false,
      suggestions: error.suggestions || [],
    };

    switch (error.code) {
      case "BOOKING_CONFLICT":
        return {
          ...baseOptions,
          retryable: true,
          retryDelay: 2000,
          maxRetries: 3,
          fallbackAction: "refresh_availability",
          suggestions: [
            "Please refresh the page and select a different time",
            "Try selecting a nearby time slot",
            "Consider booking for a different date",
            ...baseOptions.suggestions,
          ],
        };

      case "VALIDATION_ERROR":
        return {
          ...baseOptions,
          retryable: true,
          maxRetries: 1,
          suggestions: [
            "Please check your information and try again",
            "Make sure all required fields are filled correctly",
            ...baseOptions.suggestions,
          ],
        };

      case "SERVICE_NOT_FOUND":
      case "BUSINESS_NOT_FOUND":
        return {
          ...baseOptions,
          retryable: false,
          fallbackAction: "redirect_home",
          suggestions: [
            "This page may no longer be available",
            "Please try browsing our available services",
            ...baseOptions.suggestions,
          ],
        };

      case "APPOINTMENT_NOT_FOUND":
        return {
          ...baseOptions,
          retryable: false,
          fallbackAction: "redirect_bookings",
          suggestions: [
            "This appointment may have been cancelled or modified",
            "Please check your booking confirmation email",
            "Contact the business directly if you need assistance",
            ...baseOptions.suggestions,
          ],
        };

      case "BUSINESS_UNAVAILABLE":
        return {
          ...baseOptions,
          retryable: true,
          retryDelay: 5000,
          maxRetries: 2,
          fallbackAction: "show_alternative_times",
          suggestions: [
            "Please select a different date or time",
            "Check the business hours and try again",
            "Consider booking for next week",
            ...baseOptions.suggestions,
          ],
        };

      case "DATABASE_ERROR":
        return {
          ...baseOptions,
          retryable: true,
          retryDelay: 3000,
          maxRetries: 2,
          suggestions: [
            "A temporary system error occurred",
            "Please wait a moment and try again",
            "If the problem persists, please contact support",
            ...baseOptions.suggestions,
          ],
        };

      case "RATE_LIMIT_EXCEEDED":
        return {
          ...baseOptions,
          retryable: true,
          retryDelay: 10000,
          maxRetries: 1,
          suggestions: [
            "You're making requests too quickly",
            "Please wait a moment before trying again",
            "This helps us keep the service running smoothly",
            ...baseOptions.suggestions,
          ],
        };

      case "OPTIMISTIC_LOCK_ERROR":
        return {
          ...baseOptions,
          retryable: true,
          retryDelay: 1000,
          maxRetries: 2,
          fallbackAction: "refresh_data",
          suggestions: [
            "This information was recently updated",
            "Please refresh the page and try again",
            "Your changes may have already been saved",
            ...baseOptions.suggestions,
          ],
        };

      default:
        return {
          ...baseOptions,
          retryable: true,
          retryDelay: 2000,
          maxRetries: 1,
          suggestions: [
            "An unexpected error occurred",
            "Please try again in a moment",
            "If the problem continues, please contact support",
            ...baseOptions.suggestions,
          ],
        };
    }
  }

  /**
   * Check if an error should trigger automatic retry
   */
  static shouldAutoRetry(
    processedError: ProcessedError,
    currentAttempt: number,
  ): boolean {
    const { recovery } = processedError;

    if (!recovery.retryable) {
      return false;
    }

    if (recovery.maxRetries && currentAttempt >= recovery.maxRetries) {
      return false;
    }

    // Don't auto-retry validation errors or user-caused errors
    const nonRetryableCodes = [
      "VALIDATION_ERROR",
      "SERVICE_NOT_FOUND",
      "BUSINESS_NOT_FOUND",
      "APPOINTMENT_NOT_FOUND",
    ];

    return !nonRetryableCodes.includes(processedError.code);
  }

  /**
   * Get user-friendly error message with context
   */
  static getUserMessage(processedError: ProcessedError): string {
    const { userMessage, context } = processedError;

    // Add context-specific information to the message
    if (context.operation === "createBooking") {
      return `Booking Error: ${userMessage}`;
    } else if (context.operation === "cancelBooking") {
      return `Cancellation Error: ${userMessage}`;
    } else if (context.operation === "rescheduleBooking") {
      return `Rescheduling Error: ${userMessage}`;
    }

    return userMessage;
  }

  /**
   * Get recovery actions for the frontend
   */
  static getRecoveryActions(processedError: ProcessedError): Array<{
    label: string;
    action: string;
    primary?: boolean;
  }> {
    const { recovery, code } = processedError;
    const actions: Array<{ label: string; action: string; primary?: boolean }> =
      [];

    // Add retry action if retryable
    if (recovery.retryable) {
      actions.push({
        label: "Try Again",
        action: "retry",
        primary: true,
      });
    }

    // Add specific fallback actions
    switch (recovery.fallbackAction) {
      case "refresh_availability":
        actions.push({
          label: "Refresh Available Times",
          action: "refresh_availability",
        });
        break;

      case "redirect_home":
        actions.push({
          label: "Browse Services",
          action: "redirect_home",
        });
        break;

      case "redirect_bookings":
        actions.push({
          label: "View My Bookings",
          action: "redirect_bookings",
        });
        break;

      case "show_alternative_times":
        actions.push({
          label: "Show Other Times",
          action: "show_alternatives",
        });
        break;

      case "refresh_data":
        actions.push({
          label: "Refresh Page",
          action: "refresh_page",
        });
        break;
    }

    // Always add contact support option for persistent errors
    if (code === "DATABASE_ERROR" || !recovery.retryable) {
      actions.push({
        label: "Contact Support",
        action: "contact_support",
      });
    }

    return actions;
  }
}

/**
 * Error monitoring and alerting
 */
export class ErrorMonitor {
  private static errorCounts = new Map<string, number>();
  private static lastReset = Date.now();
  private static readonly RESET_INTERVAL = 60 * 60 * 1000; // 1 hour
  private static readonly ALERT_THRESHOLD = 10; // errors per hour

  /**
   * Track error occurrence for monitoring
   */
  static trackError(processedError: ProcessedError): void {
    const now = Date.now();

    // Reset counters every hour
    if (now - this.lastReset > this.RESET_INTERVAL) {
      this.errorCounts.clear();
      this.lastReset = now;
    }

    // Increment error count
    const key = `${processedError.code}:${processedError.context.operation}`;
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);

    // Check if we should alert
    if (currentCount + 1 >= this.ALERT_THRESHOLD) {
      this.sendAlert(processedError, currentCount + 1);
    }
  }

  /**
   * Send alert for high error rates
   */
  private static sendAlert(
    processedError: ProcessedError,
    count: number,
  ): void {
    bookingLogger.error(
      `High error rate detected: ${processedError.code}`,
      new Error(`${count} occurrences in the last hour`),
      {
        ...processedError.context,
        alertType: "high_error_rate",
        errorCount: count,
        threshold: this.ALERT_THRESHOLD,
      },
    );

    // In a production environment, you would send this to your monitoring service
    // e.g., Sentry, DataDog, CloudWatch, etc.
  }

  /**
   * Get current error statistics
   */
  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }
}
