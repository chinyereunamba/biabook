"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton, SkeletonServiceCard, SkeletonBookingStep } from "./skeleton";
import { LoadingProgress } from "./progress";
import { Loader2, Wifi, WifiOff } from "lucide-react";

// Spinner component with mobile-optimized sizing
interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <Loader2
      className={cn("text-primary animate-spin", sizeClasses[size], className)}
    />
  );
}

// Loading overlay for full-screen loading states
interface LoadingOverlayProps {
  message?: string;
  progress?: number;
  indeterminate?: boolean;
  transparent?: boolean;
  className?: string;
}

function LoadingOverlay({
  message = "Loading...",
  progress,
  indeterminate = true,
  transparent = false,
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        transparent ? "bg-background/80 backdrop-blur-sm" : "bg-background",
        className,
      )}
    >
      <div className="w-full max-w-sm space-y-4 px-6">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" />
          <div className="space-y-2 text-center">
            <p className="text-foreground text-sm font-medium">{message}</p>
          </div>
        </div>
        {(progress !== undefined || indeterminate) && (
          <LoadingProgress
            message=""
            progress={progress}
            indeterminate={indeterminate}
          />
        )}
      </div>
    </div>
  );
}

// Button loading state
interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {loading ? loadingText || "Loading..." : children}
    </button>
  );
}

// Network status indicator
interface NetworkStatusProps {
  isOnline?: boolean;
  className?: string;
}

function NetworkStatus({ isOnline = true, className }: NetworkStatusProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-muted-foreground">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600">Offline</span>
        </>
      )}
    </div>
  );
}

// Loading card for service listings
function LoadingServiceGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonServiceCard key={i} />
      ))}
    </div>
  );
}

// Loading state for booking flow
function LoadingBookingFlow({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <SkeletonBookingStep />
    </div>
  );
}

// Empty state with loading option
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

function EmptyState({
  title,
  description,
  action,
  loading = false,
  className,
}: EmptyStateProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center space-y-4 py-12",
          className,
        )}
      >
        <Spinner size="lg" />
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-medium">Loading...</h3>
          <p className="text-muted-foreground text-sm">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 py-12",
        className,
      )}
    >
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-sm text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Inline loading state for small components
interface InlineLoadingProps {
  size?: "sm" | "md";
  text?: string;
  className?: string;
}

function InlineLoading({ size = "sm", text, className }: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Spinner size={size} />
      {text && (
        <span
          className={cn(
            "text-muted-foreground",
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
}

// Pulse loading animation for content
function PulseLoading({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="space-y-3">
        <div className="bg-muted h-4 w-3/4 rounded"></div>
        <div className="bg-muted h-4 w-1/2 rounded"></div>
        <div className="bg-muted h-4 w-5/6 rounded"></div>
      </div>
    </div>
  );
}

export {
  Spinner,
  LoadingOverlay,
  LoadingButton,
  NetworkStatus,
  LoadingServiceGrid,
  LoadingBookingFlow,
  EmptyState,
  InlineLoading,
  PulseLoading,
};
