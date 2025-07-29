import { type NextRequest, NextResponse } from "next/server";
import { isBookingError, BookingError } from "@/server/errors/booking-errors";
import { bookingLogger } from "@/server/logging/booking-logger";
import {
  ErrorProcessor,
  ErrorMonitor,
  type ErrorContext,
} from "@/server/errors/error-handler";

/**
 * Enhanced middleware for handling errors in API routes with comprehensive error processing
 */
export async function withErrorHandling(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    return await handler();
  } catch (error) {
    const duration = Date.now() - startTime;

    // Extract comprehensive request context for logging
    const url = new URL(request.url);
    const context: ErrorContext = {
      operation: extractOperationFromPath(url.pathname),
      path: url.pathname,
      method: request.method,
      query: Object.fromEntries(url.searchParams.entries()),
      userAgent: request.headers.get("user-agent") ?? undefined,
      referer: request.headers.get("referer") ?? undefined,
      contentType: request.headers.get("content-type") ?? undefined,
      requestDuration: duration,
      timestamp: new Date().toISOString(),
    };

    // Process error with comprehensive error handling
    const processedError = ErrorProcessor.processError(error, context);

    // Track error for monitoring
    ErrorMonitor.trackError(processedError);

    // Add rate limiting headers if applicable
    const headers: Record<string, string> = {};
    if (processedError.code === "RATE_LIMIT_EXCEEDED") {
      headers["Retry-After"] = "60"; // 60 seconds
      headers["X-RateLimit-Limit"] = "100";
      headers["X-RateLimit-Remaining"] = "0";
    }

    // Add correlation ID for tracking
    headers["X-Error-Correlation-ID"] = processedError.correlationId;

    // Return comprehensive error response
    return NextResponse.json(
      {
        error: processedError.code,
        message: processedError.userMessage,
        suggestions: processedError.suggestions,
        recovery: {
          retryable: processedError.recovery.retryable,
          retryDelay: processedError.recovery.retryDelay,
          maxRetries: processedError.recovery.maxRetries,
          fallbackAction: processedError.recovery.fallbackAction,
        },
        correlationId: processedError.correlationId,
        timestamp: processedError.timestamp.toISOString(),
        // Include debug info in development
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            originalMessage: processedError.message,
            context: processedError.context,
            stack: error instanceof Error ? error.stack : undefined,
          },
        }),
      },
      {
        status: processedError.statusCode,
        headers,
      },
    );
  }
}

/**
 * Extract operation name from API path for better error categorization
 */
function extractOperationFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean);

  if (segments.includes("api")) {
    const apiIndex = segments.indexOf("api");
    const operation = segments.slice(apiIndex + 1).join("_");

    // Map common patterns to readable operation names
    const operationMap: Record<string, string> = {
      bookings: "createBooking",
      "bookings_[id]": "getBooking",
      "bookings_[id]_cancel": "cancelBooking",
      "bookings_[id]_reschedule": "rescheduleBooking",
      appointments: "manageAppointments",
      "appointments_[id]": "updateAppointment",
      dashboard_services: "manageServices",
      dashboard_availability: "manageAvailability",
      notifications_process: "processNotifications",
      onboarding: "completeOnboarding",
    };

    return operationMap[operation] || operation || "unknown";
  }

  return "unknown";
}

/**
 * Enhanced higher-order function to wrap API route handlers with comprehensive error handling
 */
export function withErrorHandler<T>(
  handler: (req: NextRequest, context: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context: T) => {
    return withErrorHandling(request, () => handler(request, context));
  };
}

/**
 * Specialized error handler for booking operations with additional context
 */
export function withBookingErrorHandler<T>(
  handler: (req: NextRequest, context: T) => Promise<NextResponse>,
  operationName?: string,
) {
  return async (request: NextRequest, context: T) => {
    return withErrorHandling(request, async () => {
      try {
        return await handler(request, context);
      } catch (error) {
        // Add booking-specific context
        if (error instanceof Error) {
          const url = new URL(request.url);
          const bookingContext = {
            operation: operationName || extractOperationFromPath(url.pathname),
            businessId: url.searchParams.get("businessId") || undefined,
            serviceId: url.searchParams.get("serviceId") || undefined,
            appointmentId:
              context && typeof context === "object" && "params" in context
                ? (context.params as any)?.id
                : undefined,
          };

          // Enhance error with booking context
          (error as any).bookingContext = bookingContext;
        }
        throw error;
      }
    });
  };
}

/**
 * Middleware for handling client-side error reporting
 */
export async function withClientErrorReporting(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const response = await handler();

    // Add error reporting headers for client-side monitoring
    response.headers.set("X-Error-Reporting-Enabled", "true");
    response.headers.set("X-Error-Endpoint", "/api/errors/report");

    return response;
  } catch (error) {
    // Let the main error handler deal with it
    throw error;
  }
}

/**
 * Enhanced error handler with user session context
 */
export function withUserContextErrorHandler<T>(
  handler: (req: NextRequest, context: T) => Promise<NextResponse>,
  getUserId?: (req: NextRequest) => Promise<string | undefined>,
) {
  return async (request: NextRequest, context: T) => {
    return withErrorHandling(request, async () => {
      try {
        return await handler(request, context);
      } catch (error) {
        // Add user context if available
        if (getUserId && error instanceof Error) {
          try {
            const userId = await getUserId(request);
            if (userId) {
              (error as any).userContext = { userId };
            }
          } catch (userError) {
            // Don't fail the main error handling if user context fails
            console.warn("Failed to get user context for error:", userError);
          }
        }
        throw error;
      }
    });
  };
}
