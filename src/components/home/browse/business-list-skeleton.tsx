import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function BusinessSkeleton() {
  const placeholders = Array.from({ length: 6 });

  return (
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
      {placeholders.map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-low rounded-[2rem] overflow-hidden flex flex-col h-full border border-surface-container shadow-sm"
        >
          {/* Image placeholder */}
          <div className="relative h-80 w-full overflow-hidden">
            <Skeleton className="h-full w-full rounded-none" variant="shimmer" />
            <div className="absolute top-6 left-6">
              <Skeleton className="h-8 w-24 rounded-full" variant="shimmer" />
            </div>
          </div>

          <div className="p-6 flex flex-col flex-1 space-y-6">
            {/* Header: Name + Price */}
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-7 w-3/4 rounded-lg" variant="shimmer" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" variant="shimmer" />
                  <Skeleton className="h-4 w-20 rounded-md" variant="shimmer" />
                </div>
              </div>
              <div className="space-y-1 text-right pl-4">
                <Skeleton className="h-3 w-8 rounded-sm ml-auto" variant="shimmer" />
                <Skeleton className="h-7 w-16 rounded-lg" variant="shimmer" />
              </div>
            </div>

            {/* Description */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full rounded-md" variant="shimmer" />
              <Skeleton className="h-4 w-5/6 rounded-md" variant="shimmer" />
            </div>

            {/* Button */}
            <div className="mt-auto pt-4">
              <Skeleton className="h-14 w-full rounded-full" variant="shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
