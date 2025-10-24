import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { errorLogger } from "@/server/logging/error-logger";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors } from "@/server/errors/booking-errors";

const errorReportSchema = z.object({
  message: z.string().min(1, "Error message is required"),
  stack: z.string().optional(),
  url: z.string().min(1, "URL is required"),
  userAgent: z.string().optional(),
  timestamp: z.string().min(1, "Timestamp is required"),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  errorCode: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  context: z.record(z.string(), z.unknown()).optional(),
  breadcrumbs: z
    .array(
      z.object({
        timestamp: z.string(),
        category: z.string(),
        message: z.string(),
        level: z.enum(["info", "warning", "error"]).default("info"),
        data: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .optional(),
  userFeedback: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      comments: z.string().optional(),
    })
    .optional(),
});

async function reportErrorHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the error report
    const validationResult = errorReportSchema.safeParse(body);
    if (!validationResult.success) {
      throw BookingErrors.validation(
        "Invalid error report format",
        "errorReport",
        validationResult.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        ),
      );
    }

    const errorReport = validationResult.data;

    // Extract additional context from request
    const requestContext = {
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      referer: request.headers.get("referer"),
      origin: request.headers.get("origin"),
      acceptLanguage: request.headers.get("accept-language"),
    };

    // Create comprehensive error context
    const errorContext = {
      url: errorReport.url,
      userAgent: errorReport.userAgent,
      userId: errorReport.userId,
      sessionId: errorReport.sessionId,
      source: "client",
      severity: errorReport.severity,
      errorCode: errorReport.errorCode,
      ...requestContext,
      ...errorReport.context,
    };

    // Create error metadata
    const errorMetadata = {
      stack: errorReport.stack,
      clientTimestamp: errorReport.timestamp,
      serverTimestamp: new Date().toISOString(),
      breadcrumbs: errorReport.breadcrumbs,
      userFeedback: errorReport.userFeedback,
      reportSource: "client_error_boundary",
    };

    // Log the client-side error with comprehensive context
    errorLogger.logError(
      `Client Error: ${errorReport.message}`,
      new Error(errorReport.message),
      errorContext,
      errorMetadata,
    );

    // If this is a critical error or has user feedback, log it separately
    if (errorReport.severity === "critical" || errorReport.userFeedback) {
      errorLogger.logError(
        `Critical client error reported${errorReport.userFeedback ? " with user feedback" : ""}`,
        new Error(errorReport.message),
        {
          ...errorContext,
          priority: "high",
          requiresAttention: true,
        },
        {
          ...errorMetadata,
          alertType: "critical_client_error",
        },
      );
    }

    // Track error patterns for monitoring
    if (errorReport.errorCode) {
      errorLogger.logInfo(
        `Error pattern tracked: ${errorReport.errorCode}`,
        {
          errorCode: errorReport.errorCode,
          url: errorReport.url,
          userId: errorReport.userId,
          patternTracking: true,
        },
        {
          frequency: 1,
          lastOccurrence: new Date().toISOString(),
        },
      );
    }

    // Return success response with correlation ID for tracking
    const correlationId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      correlationId,
      message: "Error report received and logged successfully",
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          processedAt: new Date().toISOString(),
          context: errorContext,
        },
      }),
    });
  } catch (error) {
    // Log the error in processing the error report
    errorLogger.logError(
      "Failed to process client error report",
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "processClientErrorReport",
        source: "server",
      },
      {
        originalRequestBody: "Unable to read body due to error",
      },
    );

    throw error;
  }
}

export const POST = withErrorHandler(reportErrorHandler);
