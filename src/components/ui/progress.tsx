"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

const progressVariants = cva("relative w-full overflow-hidden rounded-full", {
  variants: {
    variant: {
      default: "bg-primary/20",
      success: "bg-green-100",
      warning: "bg-yellow-100",
      error: "bg-red-100",
    },
    size: {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
      xl: "h-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        error: "bg-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  showLabel?: boolean;
  label?: string;
}

function Progress({
  className,
  value,
  variant,
  size,
  showLabel = false,
  label,
  ...props
}: ProgressProps) {
  return (
    <div className="w-full space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-muted-foreground">{value}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(progressVariants({ variant, size }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(progressIndicatorVariants({ variant }))}
          style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}

// Multi-step progress component for booking flows
interface StepProgressProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    completed?: boolean;
  }>;
  currentStep: number;
  className?: string;
  variant?: "horizontal" | "vertical";
}

function StepProgress({
  steps,
  currentStep,
  className,
  variant = "horizontal",
}: StepProgressProps) {
  if (variant === "vertical") {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => {
          const isCompleted = step.completed || index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200",
                    {
                      "border-primary bg-primary text-primary-foreground":
                        isCompleted,
                      "border-primary bg-background text-primary": isCurrent,
                      "border-muted-foreground/30 bg-background text-muted-foreground":
                        isUpcoming,
                    },
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mt-2 h-8 w-0.5 transition-colors duration-200",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-8">
                <h3
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    {
                      "text-foreground": isCompleted || isCurrent,
                      "text-muted-foreground": isUpcoming,
                    },
                  )}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal variant (mobile-optimized)
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.completed || index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 sm:h-10 sm:w-10",
                    {
                      "border-primary bg-primary text-primary-foreground":
                        isCompleted,
                      "border-primary bg-background text-primary ring-primary/20 ring-2":
                        isCurrent,
                      "border-muted-foreground/30 bg-background text-muted-foreground":
                        isUpcoming,
                    },
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <span className="text-sm font-medium sm:text-base">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors duration-200 sm:text-sm",
                      {
                        "text-foreground": isCompleted || isCurrent,
                        "text-muted-foreground": isUpcoming,
                      },
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors duration-200 sm:mx-4",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/30",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress bar */}
      <Progress
        value={(currentStep / (steps.length - 1)) * 100}
        className="h-1"
        variant="default"
      />
    </div>
  );
}

// Loading progress component
interface LoadingProgressProps {
  message?: string;
  progress?: number;
  indeterminate?: boolean;
  className?: string;
}

function LoadingProgress({
  message = "Loading...",
  progress,
  indeterminate = false,
  className,
}: LoadingProgressProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{message}</span>
        {!indeterminate && progress !== undefined && (
          <span className="text-muted-foreground text-sm">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="relative">
        <Progress
          value={indeterminate ? undefined : progress}
          className={cn("h-2", indeterminate && "animate-pulse")}
        />
        {indeterminate && (
          <div className="via-primary/30 absolute inset-0 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent to-transparent" />
        )}
      </div>
    </div>
  );
}

export { Progress, StepProgress, LoadingProgress, progressVariants };
