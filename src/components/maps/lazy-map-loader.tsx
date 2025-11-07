/**
 * Lazy loading wrapper for map components with performance optimizations
 */

"use client";

import { lazy, Suspense, useState, useEffect, useRef } from "react";
import {
  EnhancedLocationError,
  LocationErrorHandler,
} from "@/lib/location-error-handler";
import type { Coordinates } from "@/types/location";

// Lazy load map components
const GoogleMap = lazy(() =>
  import("./google-map").then((module) => ({ default: module.GoogleMap })),
);
const MapFallback = lazy(() =>
  import("./map-fallback").then((module) => ({ default: module.MapFallback })),
);

export interface LazyMapProps {
  center: Coordinates;
  zoom?: number;
  markers?: Array<{
    position: Coordinates;
    title: string;
    info?: string;
  }>;
  onMapClick?: (coordinates: Coordinates) => void;
  className?: string;
  fallbackToAddress?: boolean;
  address?: string;
}

interface MapLoadingState {
  isLoading: boolean;
  hasError: boolean;
  error?: EnhancedLocationError;
  retryCount: number;
}

/**
 * Map loading skeleton component
 */
function MapSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`}>
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-gray-400">
          <svg
            className="h-12 w-12 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Map error boundary component
 */
function MapErrorBoundary({
  error,
  onRetry,
  onFallback,
  className,
}: {
  error: EnhancedLocationError;
  onRetry: () => void;
  onFallback: () => void;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}
    >
      <div className="mb-4 flex items-center">
        <svg
          className="mr-2 h-6 w-6 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 className="text-lg font-medium text-red-800">Map Unavailable</h3>
      </div>

      <p className="mb-4 text-red-700">
        {LocationErrorHandler.getUserMessage(error)}
      </p>

      <div className="flex space-x-3">
        {LocationErrorHandler.isRetryable(error) && (
          <button
            onClick={onRetry}
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>
        )}
        <button
          onClick={onFallback}
          className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
        >
          View Address
        </button>
      </div>
    </div>
  );
}

/**
 * Lazy map loader with performance optimizations and error handling
 */
export function LazyMapLoader({
  center,
  zoom = 14,
  markers = [],
  onMapClick,
  className = "h-64 w-full",
  fallbackToAddress = true,
  address,
}: LazyMapProps) {
  const [loadingState, setLoadingState] = useState<MapLoadingState>({
    isLoading: true,
    hasError: false,
    retryCount: 0,
  });
  const [showFallback, setShowFallback] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!mapRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading when map is 100px away from viewport
        threshold: 0.1,
      },
    );

    observer.observe(mapRef.current);

    return () => observer.disconnect();
  }, []);

  // Handle map loading errors
  const handleMapError = (error: Error) => {
    const locationError = LocationErrorHandler.createError(
      "MAP_LOADING_FAILED" as any,
      error.message,
      error,
      { center, zoom, markersCount: markers.length },
    );

    setLoadingState((prev) => ({
      ...prev,
      isLoading: false,
      hasError: true,
      error: locationError,
    }));

    LocationErrorHandler.logError(locationError, {
      component: "LazyMapLoader",
      retryCount: loadingState.retryCount,
    });
  };

  // Handle retry attempts
  const handleRetry = () => {
    if (loadingState.retryCount >= 2) {
      setShowFallback(true);
      return;
    }

    setLoadingState((prev) => ({
      ...prev,
      isLoading: true,
      hasError: false,
      error: undefined,
      retryCount: prev.retryCount + 1,
    }));

    // Add delay before retry
    setTimeout(() => {
      setIsIntersecting(true);
    }, LocationErrorHandler.getRetryDelay(loadingState.error!));
  };

  // Handle fallback to address view
  const handleFallback = () => {
    setShowFallback(true);
  };

  // Handle successful map load
  const handleMapLoad = () => {
    setLoadingState((prev) => ({
      ...prev,
      isLoading: false,
      hasError: false,
      error: undefined,
    }));
  };

  // Don't render anything until intersection
  if (!isIntersecting) {
    return (
      <div ref={mapRef} className={className}>
        <MapSkeleton className="h-full" />
      </div>
    );
  }

  // Show fallback if requested or too many errors
  if (showFallback || (loadingState.hasError && loadingState.retryCount >= 2)) {
    return (
      <div ref={mapRef} className={className}>
        <Suspense fallback={<MapSkeleton className="h-full" />}>
          <MapFallback
            address={address}
            coordinates={center}
            className="h-full"
          />
        </Suspense>
      </div>
    );
  }

  // Show error state
  if (loadingState.hasError && loadingState.error) {
    return (
      <div ref={mapRef} className={className}>
        <MapErrorBoundary
          error={loadingState.error}
          onRetry={handleRetry}
          onFallback={handleFallback}
          className="h-full"
        />
      </div>
    );
  }

  // Show loading map
  return (
    <div ref={mapRef} className={className}>
      <Suspense fallback={<MapSkeleton className="h-full" />}>
        <GoogleMap
          center={center}
          zoom={zoom}
          markers={markers}
          onMapClick={onMapClick}
          onLoad={handleMapLoad}
          onError={handleMapError}
          className="h-full w-full"
        />
      </Suspense>
    </div>
  );
}

/**
 * Hook for preloading map components
 */
export function useMapPreloader() {
  const [isPreloaded, setIsPreloaded] = useState(false);

  const preloadMaps = async () => {
    if (isPreloaded) return;

    try {
      // Preload map components
      await Promise.all([import("./google-map"), import("./map-fallback")]);

      setIsPreloaded(true);
    } catch (error) {
      console.error("Failed to preload map components:", error);
    }
  };

  return { preloadMaps, isPreloaded };
}

/**
 * Map performance monitor
 */
export class MapPerformanceMonitor {
  private static loadTimes: number[] = [];
  private static errorCounts = new Map<string, number>();

  static recordLoadTime(loadTime: number): void {
    this.loadTimes.push(loadTime);

    // Keep only last 100 measurements
    if (this.loadTimes.length > 100) {
      this.loadTimes.shift();
    }
  }

  static recordError(errorCode: string): void {
    const count = this.errorCounts.get(errorCode) || 0;
    this.errorCounts.set(errorCode, count + 1);
  }

  static getAverageLoadTime(): number {
    if (this.loadTimes.length === 0) return 0;
    return (
      this.loadTimes.reduce((sum, time) => sum + time, 0) /
      this.loadTimes.length
    );
  }

  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  static reset(): void {
    this.loadTimes = [];
    this.errorCounts.clear();
  }
}
