"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  Info,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorInfo {
  code: string;
  message: string;
  suggestions?: string[];
  timestamp?: Date;
  context?: Record<string, unknown>;
  retryable?: boolean;
  severity?: "low" | "medium" | "high" | "critical";
}

interface ErrorDisplayProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: "inline" | "modal" | "toast";
  showDetails?: boolean;
}

const severityConfig = {
  low: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeVariant: "secondary" as const,
  },
  medium: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    badgeVariant: "secondary" as const,
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeVariant: "destructive" as const,
  },
  critical: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeVariant: "destructive" as const,
  },
};

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className = "",
  variant = "inline",
  showDetails = false,
}: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const severity = error.severity ?? "medium";
  const config = severityConfig[severity];
  const Icon = config.icon;

  const handleCopyError = async () => {
    const errorDetails = {
      code: error.code,
      message: error.message,
      timestamp: error.timestamp?.toISOString(),
      context: error.context,
    };

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(errorDetails, null, 2),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const ErrorContent = () => (
    <div className="space-y-4">
      {/* Main Error Message */}
      <div className="flex items-start space-x-3">
        <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", config.color)} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900">{error.message}</p>
            {error.timestamp && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="mr-1 h-3 w-3" />
                {formatTimestamp(error.timestamp)}
              </div>
            )}
          </div>

          {/* Error Code Badge */}
          <div className="flex items-center space-x-2">
            <Badge variant={config.badgeVariant} className="text-xs">
              {error.code}
            </Badge>
            {severity !== "low" && (
              <Badge variant="outline" className="text-xs">
                {severity.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {error.suggestions && error.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">What you can do:</p>
          <ul className="space-y-1 text-sm text-gray-600">
            {error.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mt-1.5 mr-2 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {onRetry && error.retryable !== false && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Try Again
            </Button>
          )}
          {showDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center"
            >
              {isExpanded ? (
                <ChevronUp className="mr-1 h-3 w-3" />
              ) : (
                <ChevronDown className="mr-1 h-3 w-3" />
              )}
              Details
            </Button>
          )}
        </div>

        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Error Details</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyError}
              className="flex items-center text-xs"
            >
              {copied ? (
                <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
              ) : (
                <Copy className="mr-1 h-3 w-3" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-xs">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Error Code:</span> {error.code}
              </div>
              {error.timestamp && (
                <div>
                  <span className="font-medium">Timestamp:</span>{" "}
                  {error.timestamp.toISOString()}
                </div>
              )}
              {error.context && Object.keys(error.context).length > 0 && (
                <div>
                  <span className="font-medium">Context:</span>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === "modal") {
    return (
      <Dialog open onOpenChange={onDismiss}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Icon className={cn("mr-2 h-5 w-5", config.color)} />
              Error Occurred
            </DialogTitle>
            <DialogDescription>
              We encountered an issue while processing your request.
            </DialogDescription>
          </DialogHeader>
          <ErrorContent />
          <DialogFooter>
            {onRetry && error.retryable !== false && (
              <Button onClick={onRetry} className="flex items-center">
                <RefreshCw className="mr-1 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={onDismiss}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === "toast") {
    return (
      <div
        className={cn(
          "ring-opacity-5 pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black",
          config.bgColor,
          config.borderColor,
          className,
        )}
      >
        <div className="p-4">
          <ErrorContent />
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <Card
      className={cn(
        "border-l-4",
        config.borderColor,
        config.bgColor,
        className,
      )}
    >
      <CardContent className="p-4">
        <ErrorContent />
      </CardContent>
    </Card>
  );
}

/**
 * Hook for managing error state with automatic retry and recovery
 */
export function useErrorHandler() {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = (
    err: unknown,
    context?: Record<string, unknown>,
    retryable = true,
  ) => {
    let errorInfo: ErrorInfo;

    if (err && typeof err === "object" && "code" in err) {
      // Handle API errors with structured format
      const apiError = err as {
        code: string;
        message: string;
        suggestions?: string[];
      };

      errorInfo = {
        code: apiError.code,
        message: apiError.message,
        suggestions: apiError.suggestions,
        timestamp: new Date(),
        context,
        retryable,
        severity: getSeverityFromCode(apiError.code),
      };
    } else if (err instanceof Error) {
      errorInfo = {
        code: "UNKNOWN_ERROR",
        message: err.message,
        timestamp: new Date(),
        context: { ...context, stack: err.stack },
        retryable,
        severity: "medium",
      };
    } else {
      errorInfo = {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
        timestamp: new Date(),
        context,
        retryable,
        severity: "medium",
      };
    }

    setError(errorInfo);
  };

  const retry = () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
  };

  const clearError = () => {
    setError(null);
    setRetryCount(0);
  };

  return {
    error,
    retryCount,
    handleError,
    retry,
    clearError,
  };
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
