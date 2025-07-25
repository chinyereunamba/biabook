import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva("animate-pulse rounded-md bg-muted", {
  variants: {
    variant: {
      default: "bg-neutral-200 dark:bg-neutral-800",
      shimmer:
        "bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800",
      pulse: "bg-neutral-200 animate-pulse dark:bg-neutral-800",
    },
    size: {
      sm: "h-4",
      md: "h-6",
      lg: "h-8",
      xl: "h-12",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, size, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// Specific skeleton components for common use cases
function SkeletonText({
  lines = 1,
  className,
  ...props
}: { lines?: number } & SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
          )}
          variant="shimmer"
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("space-y-3 rounded-lg border p-4", className)}
      {...props}
    >
      <div className="flex items-center space-x-3">
        <Skeleton className="h-12 w-12 rounded-full" variant="shimmer" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" variant="shimmer" />
          <Skeleton className="h-3 w-1/2" variant="shimmer" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

function SkeletonButton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-11 w-24 rounded-lg", className)}
      variant="shimmer"
      {...props}
    />
  );
}

function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-10 w-10 rounded-full", className)}
      variant="shimmer"
      {...props}
    />
  );
}

// Mobile-optimized skeleton for service cards
function SkeletonServiceCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border bg-white p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" variant="shimmer" />
          <Skeleton className="h-4 w-1/2" variant="shimmer" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" variant="shimmer" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-20" variant="shimmer" />
        <Skeleton className="h-9 w-24 rounded-lg" variant="shimmer" />
      </div>
    </div>
  );
}

// Mobile-optimized skeleton for booking steps
function SkeletonBookingStep({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-6 p-4", className)} {...props}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/2" variant="shimmer" />
        <Skeleton className="h-4 w-3/4" variant="shimmer" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-3 w-2/3" variant="shimmer" />
          </div>
        ))}
      </div>

      {/* Action button */}
      <Skeleton className="h-12 w-full rounded-lg" variant="shimmer" />
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonButton,
  SkeletonAvatar,
  SkeletonServiceCard,
  SkeletonBookingStep,
  skeletonVariants,
};
