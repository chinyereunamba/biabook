"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  RefreshCw,
  Clock,
  Home,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Button } from "./button";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Badge } from "./badge";

export interface ErrorDisplayProps {
  error: {
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
  };
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
  retryCount?: number;
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

/**
 * Enhanced error display component with comprehensive error information and recovery options
 */
export function EnhancedErrorDisplay({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  retryCount = 0,
  className,
  showDetails = false,
  compact = false,
}: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCorrelationId, setCopiedCorrelationId] = useState(false);

  const handleCopyCorrelationId = useCallback(async () => {
    if (error.correlationId) {
      try {
        await navigator.clipboard.writeText(error.correlationId);
        setCopiedCorrelationId(true);
        setTimeout(() => setCopiedCorrelationId(false), 2000);
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        console.error("Failed to copy correlation ID:", err);
      }
    }
  }, [error.correlationId]);

  const getErrorSeverity = (
    errorCode: string,
  ): "error" | "warning" | "info" => {
    const severityMap: Record<string, "error" | "warning" | "info"> = {
      BOOKING_CONFLICT: "warning",
      VALIDATION_ERROR: "warning",
      BUSINESS_UNAVAILABLE: "info",
      SERVICE_NOT_FOUND: "error",
      BUSINESS_NOT_FOUND: "error",
      APPOINTMENT_NOT_FOUND: "error",
      DATABASE_ERROR: "error",
      RATE_LIMIT_EXCEEDED: "warning",
      OPTIMISTIC_LOCK_ERROR: "warning",
    };

    return severityMap[errorCode] || "error";
  };

  const getErrorIcon = (severity: "error" | "warning" | "info") => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRetryButtonText = () => {
    if (isRetrying) {
      return "Retrying...";
    }

    if (retryCount > 0) {
      const remaining = (error.recovery?.maxRetries || 3) - retryCount;
      return `Try Again (${remaining} left)`;
    }

    return "Try Again";
  };

  const canRetry =
    error.recovery?.retryable &&
    retryCount < (error.recovery?.maxRetries || 3) &&
    !isRetrying;

  const severity = getErrorSeverity(error.error);

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-lg border border-red-200 bg-red-50 p-3",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          {getErrorIcon(severity)}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-red-800">{error.message}</p>
            {error.suggestions && error.suggestions.length > 0 && (
              <p className="mt-1 text-xs text-red-600">
                {error.suggestions[0]}
              </p>
            )}
          </div>
          {canRetry && onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              disabled={isRetrying}
              className="flex-shrink-0"
            >
              <RefreshCw
                className={cn("h-3 w-3", isRetrying && "animate-spin")}
              />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Alert
      variant={severity === "error" ? "destructive" : "default"}
      className={cn("relative", className)}
    >
      <div className="flex items-start gap-3">
        {getErrorIcon(severity)}
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <AlertTitle className="flex items-center gap-2">
              Something went wrong
              <Badge variant="outline" className="text-xs">
                {error.error.replace(/_/g, " ").toLowerCase()}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2">
              {error.message}
            </AlertDescription>
          </div>

          {/* Suggestions */}
          {error.suggestions && error.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">What you can do:</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-current" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {canRetry && onRetry && (
              <Button
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isRetrying && "animate-spin")}
                />
                {getRetryButtonText()}
              </Button>
            )}

            {error.recovery?.fallbackAction === "redirect_home" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}

            {error.recovery?.fallbackAction === "contact_support" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  (window.location.href = "mailto:support@biabook.app")
                }
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Contact Support
              </Button>
            )}

            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>

          {/* Retry delay indicator */}
          {isRetrying && error.recovery?.retryDelay && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Retrying in {Math.ceil(error.recovery.retryDelay / 1000)}{" "}
              seconds...
            </div>
          )}

          {/* Technical details (expandable) */}
          {(showDetails || error.correlationId) && (
            <div className="border-t pt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Technical Details
              </button>

              {isExpanded && (
                <div className="text-muted-foreground mt-2 space-y-2 text-xs">
                  {error.correlationId && (
                    <div className="flex items-center gap-2">
                      <span>Error ID:</span>
                      <code className="bg-muted rounded px-1 py-0.5 font-mono">
                        {error.correlationId}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyCorrelationId}
                        className="h-6 w-6 p-0"
                      >
                        {copiedCorrelationId ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}

                  {error.timestamp && (
                    <div>
                      <span>Occurred at:</span>{" "}
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                  )}

                  {retryCount > 0 && (
                    <div>
                      <span>Retry attempts:</span> {retryCount}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

/**
 * Simplified error display for inline use
 */
export function InlineErrorDisplay({
  message,
  onRetry,
  isRetrying = false,
  className,
}: {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-2 text-sm text-red-600", className)}
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className={cn("h-3 w-3", isRetrying && "animate-spin")} />
        </Button>
      )}
    </div>
  );
}

/**
 * Error display for form fields
 */
export function FieldErrorDisplay({
  error,
  className,
}: {
  error: string;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div
      className={cn("flex items-center gap-1 text-xs text-red-600", className)}
    >
      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}
