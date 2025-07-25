"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { ErrorDisplay, type ErrorInfo } from "./error-display";
import { CheckCircle, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  errorInfo?: ErrorInfo;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  showError: (error: ErrorInfo, title?: string) => string;
  showSuccess: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

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
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        // Limit the number of toasts
        return updated.slice(0, maxToasts);
      });

      // Auto-remove toast after duration
      const duration = toast.duration ?? (toast.type === "error" ? 8000 : 5000);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [maxToasts, removeToast],
  );

  const showError = useCallback(
    (error: ErrorInfo, title = "Error") => {
      return addToast({
        type: "error",
        title,
        message: error.message,
        errorInfo: error,
        duration: 0, // Don't auto-dismiss errors
      });
    },
    [addToast],
  );

  const showSuccess = useCallback(
    (message: string, title = "Success") => {
      return addToast({
        type: "success",
        title,
        message,
        duration: 4000,
      });
    },
    [addToast],
  );

  const showWarning = useCallback(
    (message: string, title = "Warning") => {
      return addToast({
        type: "warning",
        title,
        message,
        duration: 6000,
      });
    },
    [addToast],
  );

  const showInfo = useCallback(
    (message: string, title = "Info") => {
      return addToast({
        type: "info",
        title,
        message,
        duration: 5000,
      });
    },
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6">
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-400",
      titleColor: "text-green-800",
      messageColor: "text-green-700",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-400",
      titleColor: "text-red-800",
      messageColor: "text-red-700",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-400",
      titleColor: "text-yellow-800",
      messageColor: "text-yellow-700",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-400",
      titleColor: "text-blue-800",
      messageColor: "text-blue-700",
    },
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  // For error toasts with errorInfo, use the ErrorDisplay component
  if (toast.type === "error" && toast.errorInfo) {
    return (
      <div className="pointer-events-auto w-full max-w-sm">
        <ErrorDisplay
          error={toast.errorInfo}
          variant="toast"
          onDismiss={() => onRemove(toast.id)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "ring-opacity-5 pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black",
        config.bgColor,
        config.borderColor,
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-6 w-6", config.iconColor)} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={cn("text-sm font-medium", config.titleColor)}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={cn("mt-1 text-sm", config.messageColor)}>
                {toast.message}
              </p>
            )}
            {toast.action && (
              <div className="mt-3">
                <button
                  type="button"
                  className={cn(
                    "rounded-md text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none",
                    config.titleColor,
                    "hover:underline",
                  )}
                  onClick={toast.action.onClick}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={cn(
                "inline-flex rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-none",
                config.messageColor,
                "hover:text-gray-500",
              )}
              onClick={() => onRemove(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
