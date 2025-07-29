"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  RefreshCw,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastError {
  id: string;
  code: string;
  message: string;
  suggestions?: string[];
  severity?: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  duration?: number;
  onRetry?: () => void | Promise<void>;
  retryable?: boolean;
}

interface ToastContextType {
  showError: (error: Omit<ToastError, "id" | "timestamp">) => void;
  showSuccess: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<
    (
      | ToastError
      | {
          id: string;
          type: "success" | "info";
          message: string;
          timestamp: Date;
          duration?: number;
        }
    )[]
  >([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showError = (error: Omit<ToastError, "id" | "timestamp">) => {
    const newToast: ToastError = {
      ...error,
      id: generateId(),
      timestamp: new Date(),
      duration: error.duration ?? (error.severity === "critical" ? 0 : 8000), // Critical errors don't auto-dismiss
    };

    setToasts((prev) => {
      const updated = [newToast, ...prev].slice(0, maxToasts);
      return updated;
    });
  };

  const showSuccess = (message: string, duration = 4000) => {
    const newToast = {
      id: generateId(),
      type: "success" as const,
      message,
      timestamp: new Date(),
      duration,
    };

    setToasts((prev) => [newToast, ...prev].slice(0, maxToasts));
  };

  const showInfo = (message: string, duration = 4000) => {
    const newToast = {
      id: generateId(),
      type: "info" as const,
      message,
      timestamp: new Date(),
      duration,
    };

    setToasts((prev) => [newToast, ...prev].slice(0, maxToasts));
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  // Auto-dismiss toasts
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(toast.id);
        }, toast.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts]);

  return (
    <ToastContext.Provider
      value={{ showError, showSuccess, showInfo, dismissToast, clearAll }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: (
    | ToastError
    | {
        id: string;
        type: "success" | "info";
        message: string;
        timestamp: Date;
        duration?: number;
      }
  )[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

interface ToastItemProps {
  toast:
    | ToastError
    | {
        id: string;
        type: "success" | "info";
        message: string;
        timestamp: Date;
        duration?: number;
      };
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 150);
  };

  const handleRetry = async () => {
    if ("onRetry" in toast && toast.onRetry && !isRetrying) {
      setIsRetrying(true);
      try {
        await toast.onRetry();
        handleDismiss();
      } catch (error) {
        console.error("Toast retry failed:", error);
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const getToastStyles = () => {
    if ("type" in toast) {
      switch (toast.type) {
        case "success":
          return "bg-green-50 border-green-200 text-green-800";
        case "info":
          return "bg-blue-50 border-blue-200 text-blue-800";
      }
    } else {
      // Error toast
      switch (toast.severity) {
        case "low":
          return "bg-blue-50 border-blue-200 text-blue-800";
        case "medium":
          return "bg-yellow-50 border-yellow-200 text-yellow-800";
        case "high":
          return "bg-orange-50 border-orange-200 text-orange-800";
        case "critical":
          return "bg-red-50 border-red-200 text-red-800";
        default:
          return "bg-gray-50 border-gray-200 text-gray-800";
      }
    }
  };

  const getIcon = () => {
    if ("type" in toast) {
      switch (toast.type) {
        case "success":
          return <CheckCircle className="h-4 w-4 text-green-600" />;
        case "info":
          return <Info className="h-4 w-4 text-blue-600" />;
      }
    } else {
      return <AlertTriangle className="h-4 w-4 text-current" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) {
      return "just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div
      className={cn(
        "transform transition-all duration-300 ease-in-out",
        isVisible
          ? "translate-x-0 scale-100 opacity-100"
          : "translate-x-full scale-95 opacity-0",
      )}
    >
      <div
        className={cn(
          "rounded-lg border p-4 shadow-lg backdrop-blur-sm",
          getToastStyles(),
        )}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">{getIcon()}</div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {"type" in toast ? toast.message : toast.message}
              </p>
              <div className="flex items-center space-x-1">
                <div className="flex items-center text-xs opacity-60">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatTimestamp(toast.timestamp)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 hover:bg-black/10"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Error-specific content */}
            {"code" in toast && (
              <>
                <div className="text-xs opacity-75">Error: {toast.code}</div>

                {toast.suggestions && toast.suggestions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Quick fixes:</p>
                    <ul className="space-y-0.5 text-xs">
                      {toast.suggestions
                        .slice(0, 2)
                        .map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            {suggestion}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {toast.onRetry && toast.retryable !== false && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="h-7 text-xs"
                  >
                    {isRetrying ? (
                      <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-1 h-3 w-3" />
                    )}
                    {isRetrying ? "Retrying..." : "Try Again"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for showing error toasts with automatic retry functionality
 */
export function useErrorToast() {
  const { showError, showSuccess } = useToast();

  const showApiError = (
    error: unknown,
    options?: {
      onRetry?: () => void | Promise<void>;
      retryable?: boolean;
      duration?: number;
    },
  ) => {
    let errorInfo: Omit<ToastError, "id" | "timestamp">;

    if (error && typeof error === "object" && "code" in error) {
      // Handle API errors with structured format
      const apiError = error as {
        code: string;
        message: string;
        suggestions?: string[];
      };

      errorInfo = {
        code: apiError.code,
        message: apiError.message,
        suggestions: apiError.suggestions,
        severity: getSeverityFromCode(apiError.code),
        onRetry: options?.onRetry,
        retryable: options?.retryable,
        duration: options?.duration,
      };
    } else if (error instanceof Error) {
      errorInfo = {
        code: "UNKNOWN_ERROR",
        message: error.message,
        severity: "medium",
        onRetry: options?.onRetry,
        retryable: options?.retryable,
        duration: options?.duration,
      };
    } else {
      errorInfo = {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
        severity: "medium",
        onRetry: options?.onRetry,
        retryable: options?.retryable,
        duration: options?.duration,
      };
    }

    showError(errorInfo);
  };

  const showRetryableError = (
    error: unknown,
    retryFn: () => void | Promise<void>,
    options?: { duration?: number },
  ) => {
    showApiError(error, {
      onRetry: retryFn,
      retryable: true,
      duration: options?.duration,
    });
  };

  return {
    showApiError,
    showRetryableError,
    showSuccess,
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
