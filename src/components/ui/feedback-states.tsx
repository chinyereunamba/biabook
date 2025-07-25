"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";

// Alert component variants
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success:
          "border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-600 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
        warning:
          "border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
        error:
          "border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
        info: "border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
      },
      size: {
        sm: "px-3 py-2 text-xs",
        md: "px-4 py-3 text-sm",
        lg: "px-6 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
}

function Alert({
  className,
  variant,
  size,
  dismissible = false,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <div className={cn(alertVariants({ variant, size }), className)} {...props}>
      {children}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="ring-offset-background focus:ring-ring absolute top-2 right-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 leading-none font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

// Success feedback component
interface SuccessFeedbackProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

function SuccessFeedback({
  title,
  message,
  action,
  className,
}: SuccessFeedbackProps) {
  return (
    <Alert variant="success" className={cn("animate-fade-in", className)}>
      <CheckCircle className="h-4 w-4" />
      <div>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </Alert>
  );
}

// Error feedback component
interface ErrorFeedbackProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

function ErrorFeedback({
  title,
  message,
  action,
  className,
  dismissible = false,
  onDismiss,
}: ErrorFeedbackProps) {
  return (
    <Alert
      variant="error"
      className={cn("animate-fade-in", className)}
      dismissible={dismissible}
      onDismiss={onDismiss}
    >
      <XCircle className="h-4 w-4" />
      <div>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </Alert>
  );
}

// Warning feedback component
interface WarningFeedbackProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

function WarningFeedback({
  title,
  message,
  action,
  className,
}: WarningFeedbackProps) {
  return (
    <Alert variant="warning" className={cn("animate-fade-in", className)}>
      <AlertTriangle className="h-4 w-4" />
      <div>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </Alert>
  );
}

// Info feedback component
interface InfoFeedbackProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

function InfoFeedback({
  title,
  message,
  action,
  className,
}: InfoFeedbackProps) {
  return (
    <Alert variant="info" className={cn("animate-fade-in", className)}>
      <Info className="h-4 w-4" />
      <div>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </Alert>
  );
}

// Network status feedback
interface NetworkFeedbackProps {
  isOnline: boolean;
  className?: string;
}

function NetworkFeedback({ isOnline, className }: NetworkFeedbackProps) {
  if (isOnline) return null;

  return (
    <Alert variant="warning" className={cn("animate-slide-up", className)}>
      <WifiOff className="h-4 w-4" />
      <div>
        <AlertTitle>Connection Lost</AlertTitle>
        <AlertDescription>
          You're currently offline. Some features may not work properly.
        </AlertDescription>
      </div>
    </Alert>
  );
}

// Form validation feedback
interface FormFeedbackProps {
  errors?: Record<string, string>;
  success?: string;
  className?: string;
}

function FormFeedback({ errors, success, className }: FormFeedbackProps) {
  if (!errors && !success) return null;

  if (success) {
    return <SuccessFeedback message={success} className={className} />;
  }

  if (errors && Object.keys(errors).length > 0) {
    const errorMessages = Object.values(errors);
    return (
      <ErrorFeedback
        title="Please fix the following errors:"
        message={errorMessages.join(", ")}
        className={className}
      />
    );
  }

  return null;
}

// Booking status feedback
interface BookingStatusFeedbackProps {
  status: "pending" | "confirmed" | "cancelled" | "completed" | "failed";
  message?: string;
  className?: string;
}

function BookingStatusFeedback({
  status,
  message,
  className,
}: BookingStatusFeedbackProps) {
  const statusConfig = {
    pending: {
      variant: "info" as const,
      icon: Info,
      title: "Booking Pending",
      defaultMessage: "Your booking is being processed.",
    },
    confirmed: {
      variant: "success" as const,
      icon: CheckCircle,
      title: "Booking Confirmed",
      defaultMessage: "Your appointment has been confirmed.",
    },
    cancelled: {
      variant: "warning" as const,
      icon: AlertCircle,
      title: "Booking Cancelled",
      defaultMessage: "Your appointment has been cancelled.",
    },
    completed: {
      variant: "success" as const,
      icon: CheckCircle,
      title: "Appointment Completed",
      defaultMessage: "Your appointment has been completed.",
    },
    failed: {
      variant: "error" as const,
      icon: XCircle,
      title: "Booking Failed",
      defaultMessage: "There was an error processing your booking.",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Alert
      variant={config.variant}
      className={cn("animate-fade-in", className)}
    >
      <Icon className="h-4 w-4" />
      <div>
        <AlertTitle>{config.title}</AlertTitle>
        <AlertDescription>{message || config.defaultMessage}</AlertDescription>
      </div>
    </Alert>
  );
}

// Retry feedback component
interface RetryFeedbackProps {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
}

function RetryFeedback({
  message,
  onRetry,
  retrying = false,
  className,
}: RetryFeedbackProps) {
  return (
    <ErrorFeedback
      title="Something went wrong"
      message={message}
      className={className}
      action={
        <button
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", retrying && "animate-spin")} />
          {retrying ? "Retrying..." : "Try Again"}
        </button>
      }
    />
  );
}

// Mobile-optimized banner feedback
interface BannerFeedbackProps {
  variant: "success" | "error" | "warning" | "info";
  message: string;
  action?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

function BannerFeedback({
  variant,
  message,
  action,
  dismissible = true,
  onDismiss,
  className,
}: BannerFeedbackProps) {
  const [dismissed, setDismissed] = React.useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  const variantConfig = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      borderColor: "border-green-200",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      borderColor: "border-red-200",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "animate-slide-up fixed top-4 right-4 left-4 z-50 rounded-lg border p-4 shadow-lg",
        config.bgColor,
        config.textColor,
        config.borderColor,
        "sm:right-4 sm:left-auto sm:max-w-md",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{message}</p>
          {action && <div className="mt-2">{action}</div>}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="ring-offset-background focus:ring-ring flex-shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </div>
  );
}

export {
  Alert,
  AlertTitle,
  AlertDescription,
  SuccessFeedback,
  ErrorFeedback,
  WarningFeedback,
  InfoFeedback,
  NetworkFeedback,
  FormFeedback,
  BookingStatusFeedback,
  RetryFeedback,
  BannerFeedback,
  alertVariants,
};
