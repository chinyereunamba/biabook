"use client";

import React, {
  lazy,
  Suspense,
  type ComponentType,
  type ReactNode,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  LoadingServiceGrid,
  PulseLoading,
} from "@/components/ui/loading-states";

/**
 * Utility for creating lazy-loaded components with fallback loading states
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode,
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Utility for creating lazy-loaded components with named exports
 */
export function createLazyNamedComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ [key: string]: T }>,
  exportName: string,
  fallback?: ReactNode,
) {
  const LazyComponent = lazy(async () => {
    const module = await importFn();
    return { default: module[exportName] as T };
  });

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Default fallback component for lazy loading
 */
function DefaultFallback() {
  return (
    <div className="animate-pulse">
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

/**
 * Analytics dashboard fallback
 */
export function AnalyticsFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      <LoadingServiceGrid count={4} />
    </div>
  );
}

/**
 * Booking form fallback
 */
export function BookingFormFallback() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * Service management fallback
 */
export function ServiceManagementFallback() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
      <LoadingServiceGrid count={6} />
    </div>
  );
}

/**
 * Calendar fallback
 */
export function CalendarFallback() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Time slot grid fallback
 */
export function TimeSlotFallback() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Business profile fallback
 */
export function BusinessProfileFallback() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Preload a component for better performance
 */
export function preloadComponent(importFn: () => Promise<any>) {
  // Preload the component
  importFn().catch(() => {
    // Ignore preload errors
  });
}

/**
 * Hook for intersection observer based lazy loading
 */
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {},
) {
  const targetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(target);
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
        ...options,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
}
