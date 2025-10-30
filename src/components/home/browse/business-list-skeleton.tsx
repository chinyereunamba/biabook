import React from "react";

export function BusinessSkeleton() {
  // Show 6 placeholders (you can adjust this count)
  const placeholders = Array.from({ length: 6 });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {placeholders.map((_, i) => (
        <div
          key={i}
          className="border-border bg-card overflow-hidden rounded-xl border"
        >
          {/* Image placeholder */}
          <div className="from-primary/10 to-accent/10 h-48 animate-pulse bg-gradient-to-br" />

          <div className="space-y-4 p-6">
            {/* Name + Category */}
            <div className="flex items-start justify-between">
              <div className="bg-muted h-5 w-2/3 animate-pulse rounded" />
              <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="bg-muted h-4 w-4 animate-pulse rounded-full" />
              <div className="bg-muted h-4 w-8 animate-pulse rounded" />
              <div className="bg-muted h-4 w-10 animate-pulse rounded" />
            </div>

            {/* Location */}
            <div className="flex items-center gap-1">
              <div className="bg-muted h-4 w-4 animate-pulse rounded-full" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="bg-muted h-3 w-full animate-pulse rounded" />
              <div className="bg-muted h-3 w-5/6 animate-pulse rounded" />
            </div>

            {/* Price + Button */}
            <div className="mt-4 flex items-center justify-between">
              <div className="bg-muted h-5 w-16 animate-pulse rounded" />
              <div className="bg-muted h-8 w-20 animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
