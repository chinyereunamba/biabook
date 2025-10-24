"use client";

import { useEffect } from "react";
import {
  trackWebVitals,
  trackBundlePerformance,
  preloadCriticalResources,
  getMobilePerformanceContext,
} from "@/lib/performance-monitor";

/**
 * Performance monitoring component for mobile optimization
 * Should be included in the root layout
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    trackWebVitals();
    trackBundlePerformance();

    // Preload critical resources for mobile
    preloadCriticalResources();

    // Log mobile performance context
    const context = getMobilePerformanceContext();
    if (context?.isMobile) {
      console.log("Mobile Performance Context:", context);
    }

    // Monitor memory usage on mobile devices
    if (context?.isMobile) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        if (memory) {
          const usagePercentage =
            (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
          if (usagePercentage > 70) {
            console.warn(
              "High memory usage on mobile device:",
              usagePercentage.toFixed(2) + "%",
            );
          }
        }
      };

      // Check memory usage every 30 seconds
      const memoryInterval = setInterval(checkMemory, 30000);

      return () => clearInterval(memoryInterval);
    }
  }, []);

  // This component doesn't render anything
  return null;
}

/**
 * Component load tracker HOC
 */
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string,
) {
  return function PerformanceTrackedComponent(props: T) {
    useEffect(() => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        console.log(
          `Component ${componentName} rendered in ${loadTime.toFixed(2)}ms`,
        );

        // Send to analytics if available
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "component_render", {
            component_name: componentName,
            render_time: Math.round(loadTime),
            event_category: "Performance",
          });
        }
      };
    }, []);

    return <Component {...props} />;
  };
}
