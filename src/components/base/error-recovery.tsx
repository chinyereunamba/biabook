"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Home,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface RecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: "primary" | "outline" | "destructive";
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ErrorRecoveryProps {
  error: {
    code: string;
    message: string;
    suggestions?: string[];
    severity?: "low" | "medium" | "high" | "critical";
  };
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  customActions?: RecoveryAction[];
  showContactSupport?: boolean;
  className?: string;
}

export function ErrorRecovery({
  error,
  onRetry,
  onDismiss,
  customActions = [],
  showContactSupport = false,
  className = "",
}: ErrorRecoveryProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const maxRetries = 3;
  const canRetry = onRetry && retryCount < maxRetries;

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
      setRetryCount((prev) => prev + 1);
    } catch (retryError) {
      console.error("Retry failed:", retryError);
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  const getRecoveryActions = (): RecoveryAction[] => {
    const actions: RecoveryAction[] = [];

    // Add retry action if available
    if (canRetry) {
      actions.push({
        label: isRetrying
          ? "Retrying..."
          : `Try Again ${retryCount > 0 ? `(${retryCount}/${maxRetries})` : ""}`,
        action: handleRetry,
        variant: "primary",
        icon: RefreshCw,
      });
    }

    // Add navigation actions based on error severity
    if (error.severity === "critical" || error.code === "BUSINESS_NOT_FOUND") {
      actions.push({
        label: "Go Home",
        action: () => router.push("/"),
        variant: "outline",
        icon: Home,
      });
    }

    if (
      error.code === "BOOKING_CONFLICT" ||
      error.code === "BUSINESS_UNAVAILABLE"
    ) {
      actions.push({
        label: "Try Different Time",
        action: () => router.back(),
        variant: "outline",
        icon: ArrowLeft,
      });
    }

    // Add custom actions
    actions.push(...customActions);

    return actions;
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRecoveryMessage = () => {
    switch (error.code) {
      case "BOOKING_CONFLICT":
        return "This time slot was just booked by someone else. Let's find you another available time.";
      case "BUSINESS_UNAVAILABLE":
        return "The business is currently unavailable. You can try selecting a different date or time.";
      case "VALIDATION_ERROR":
        return "Please check your information and try again.";
      case "RATE_LIMIT_EXCEEDED":
        return "You're making requests too quickly. Please wait a moment before trying again.";
      case "DATABASE_ERROR":
        return "We're experiencing technical difficulties. Our team has been notified.";
      default:
        return "Don't worry, these things happen. Here are some ways to resolve this:";
    }
  };

  const recoveryActions = getRecoveryActions();

  return (
    <Card className={cn("border-l-4", getSeverityColor(), className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        <Alert>
          <AlertDescription className="text-sm">
            {error.message}
          </AlertDescription>
        </Alert>

        {/* Recovery Message */}
        <p className="text-sm text-gray-600">{getRecoveryMessage()}</p>

        {/* Suggestions */}
        {error.suggestions && error.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              What you can do:
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {error.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-2 h-3 w-3 flex-shrink-0 text-green-500" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recovery Actions */}
        {recoveryActions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recoveryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || "primary"}
                  size="sm"
                  onClick={action.action}
                  disabled={isRetrying}
                  className="flex items-center"
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "mr-1 h-3 w-3",
                        isRetrying &&
                          action.icon === RefreshCw &&
                          "animate-spin",
                      )}
                    />
                  )}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Contact Support */}
        {showContactSupport && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs text-gray-500">
              Still having trouble? Our support team is here to help.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("tel:+1-555-BOOKME", "_self")}
                className="flex items-center text-xs"
              >
                <Phone className="mr-1 h-3 w-3" />
                Call Support
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open("mailto:support@bookme.com", "_self")
                }
                className="flex items-center text-xs"
              >
                <Mail className="mr-1 h-3 w-3" />
                Email Support
              </Button>
            </div>
          </div>
        )}

        {/* Error Details Toggle */}
        <div className="border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-500"
          >
            {showDetails ? "Hide" : "Show"} technical details
          </Button>

          {showDetails && (
            <div className="mt-2 rounded bg-gray-50 p-2 font-mono text-xs">
              <div>Error Code: {error.code}</div>
              <div>Timestamp: {new Date().toISOString()}</div>
              {retryCount > 0 && <div>Retry Attempts: {retryCount}</div>}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Hook for managing error recovery state
 */
export function useErrorRecovery() {
  const [error, setError] = useState<ErrorRecoveryProps["error"] | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleError = (
    err: unknown,
    options?: {
      severity?: "low" | "medium" | "high" | "critical";
      suggestions?: string[];
    },
  ) => {
    let errorInfo: ErrorRecoveryProps["error"];

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
        suggestions: apiError.suggestions || options?.suggestions,
        severity: options?.severity || getSeverityFromCode(apiError.code),
      };
    } else if (err instanceof Error) {
      errorInfo = {
        code: "UNKNOWN_ERROR",
        message: err.message,
        suggestions: options?.suggestions,
        severity: options?.severity || "medium",
      };
    } else {
      errorInfo = {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
        suggestions: options?.suggestions,
        severity: options?.severity || "medium",
      };
    }

    setError(errorInfo);
  };

  const retry = async (retryFn: () => Promise<void>) => {
    setIsRecovering(true);
    try {
      await retryFn();
      setError(null);
    } catch (retryError) {
      handleError(retryError);
    } finally {
      setIsRecovering(false);
    }
  };

  const clearError = () => {
    setError(null);
    setIsRecovering(false);
  };

  return {
    error,
    isRecovering,
    handleError,
    retry,
    clearError,
  };
}

/**
 * Determine error severity based on error code
 */
function getSeverityFromCode(
  code: string,
): "low" | "medium" | "high" | "critical" {
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
