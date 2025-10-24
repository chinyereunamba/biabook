"use client";

/**
 * Performance monitoring utilities for mobile optimization
 */

// Track Core Web Vitals
export function trackWebVitals() {
  if (typeof window === "undefined") return;

  // Track Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    if (lastEntry) {
      // Log LCP for monitoring
      console.log("LCP:", lastEntry.startTime);

      // Send to analytics if needed
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "web_vitals", {
          name: "LCP",
          value: Math.round(lastEntry.startTime),
          event_category: "Web Vitals",
        });
      }
    }
  });

  try {
    observer.observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {
    // LCP not supported
  }

  // Track First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (entry.processingStart && entry.startTime) {
        console.log("FID:", entry.processingStart - entry.startTime);

        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "web_vitals", {
            name: "FID",
            value: Math.round(entry.processingStart - entry.startTime),
            event_category: "Web Vitals",
          });
        }
      }
    });
  });

  try {
    fidObserver.observe({ type: "first-input", buffered: true });
  } catch (e) {
    // FID not supported
  }

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });

    console.log("CLS:", clsValue);

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "web_vitals", {
        name: "CLS",
        value: Math.round(clsValue * 1000),
        event_category: "Web Vitals",
      });
    }
  });

  try {
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch (e) {
    // CLS not supported
  }
}

// Monitor bundle sizes and loading performance
export function trackBundlePerformance() {
  if (typeof window === "undefined") return;

  // Track resource loading times
  window.addEventListener("load", () => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];

    // Log navigation timing
    console.log("Navigation Timing:", {
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart,
    });

    // Track JavaScript bundle sizes
    const jsResources = resources.filter(
      (resource) =>
        resource.name.includes(".js") &&
        resource.name.includes("/_next/static/"),
    );

    jsResources.forEach((resource) => {
      console.log("JS Bundle:", {
        name: resource.name.split("/").pop(),
        size: resource.transferSize,
        loadTime: resource.responseEnd - resource.requestStart,
      });
    });

    // Track CSS bundle sizes
    const cssResources = resources.filter(
      (resource) =>
        resource.name.includes(".css") &&
        resource.name.includes("/_next/static/"),
    );

    cssResources.forEach((resource) => {
      console.log("CSS Bundle:", {
        name: resource.name.split("/").pop(),
        size: resource.transferSize,
        loadTime: resource.responseEnd - resource.requestStart,
      });
    });
  });
}

// Detect mobile device and connection quality
export function getMobilePerformanceContext() {
  if (typeof window === "undefined") return null;

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // Get connection information if available
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  return {
    isMobile,
    connectionType: connection?.effectiveType || "unknown",
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0,
    saveData: connection?.saveData || false,
  };
}

// Preload critical resources for mobile
export function preloadCriticalResources() {
  if (typeof window === "undefined") return;

  const context = getMobilePerformanceContext();

  // Skip preloading on slow connections or save-data mode
  if (
    context?.saveData ||
    (context?.connectionType &&
      ["slow-2g", "2g"].includes(context.connectionType))
  ) {
    return;
  }

  // Preload critical fonts
  const fontPreloads = ["/fonts/inter-var.woff2"];

  fontPreloads.forEach((font) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = font;
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });

  // Preload critical images
  const imagePreloads = ["/images/hero-mobile.webp", "/images/logo.svg"];

  imagePreloads.forEach((image) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = image;
    link.as = "image";
    document.head.appendChild(link);
  });
}

// Monitor component loading performance
export function trackComponentLoad(componentName: string, startTime: number) {
  const endTime = performance.now();
  const loadTime = endTime - startTime;

  console.log(`Component Load: ${componentName} took ${loadTime.toFixed(2)}ms`);

  // Send to analytics if needed
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "component_load", {
      component_name: componentName,
      load_time: Math.round(loadTime),
      event_category: "Performance",
    });
  }
}

// Lazy loading with intersection observer
export function createIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {},
) {
  const defaultOptions = {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
      }
    });
  }, defaultOptions);
}

// Memory usage monitoring for mobile devices
export function monitorMemoryUsage() {
  if (typeof window === "undefined") return;

  const memory = (performance as any).memory;
  if (!memory) return;

  const memoryInfo = {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };

  console.log("Memory Usage:", memoryInfo);

  // Warn if memory usage is high
  if (memoryInfo.usagePercentage > 80) {
    console.warn(
      "High memory usage detected:",
      memoryInfo.usagePercentage.toFixed(2) + "%",
    );
  }

  return memoryInfo;
}
