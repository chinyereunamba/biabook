import { NextRequest, NextResponse } from "next/server";
import { isBookingError, BookingError } from "@/server/errors/booking-errors";
import { bookingLogger } from "@/server/logging/booking-logger";

/**
 * Middleware for handling errors in API routes
 */
export async function withErrorHandling(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    // Extract request context for logging
    const url = new URL(request.url);
    const context = {
      path: url.pathname,
      method: request.method,
      query: Object.fromEntries(url.searchParams.entries()),
      userAgent: request.headers.get("user-agent") || undefined,
      referer: request.headers.get("referer") || undefined,
      contentType: request.headers.get("content-type") || undefined,
    };

    // Handle booking errors
    if (isBookingError(error)) {
      bookingLogger.error(`API Error: ${error.code}`, error, context, {
        statusCode: error.statusCode,
      });

      return NextResponse.json(
        {
          error: error.code,
          message: error.userMessage,
          suggestions: error.suggestions,
        },
        { status: error.statusCode },
      );
    }

    // Handle other errors
    const unknownError = error as Error;
    bookingLogger.error("Unhandled API Error", unknownError, context, {
      stack: unknownError.stack,
    });

    // Don't expose internal error details in production
    const isProd = process.env.NODE_ENV === "production";

    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
        ...(isProd
          ? {}
          : {
              detail: unknownError.message,
              stack: unknownError.stack,
            }),
      },
      { status: 500 },
    );
  }
}

/**
 * Higher-order function to wrap API route handlers with error handling
 */
export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    return withErrorHandling(request, () => handler(request));
  };
}
