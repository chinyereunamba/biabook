"use client";

import { createLazyComponent, AnalyticsFallback } from "@/lib/lazy-loading";

// Lazy load the analytics dashboard
export const LazyAnalyticsDashboard = createLazyComponent(
  () =>
    import("./analytics-dashboard").then((m) => ({
      default: m.AnalyticsDashboard,
    })),
  <AnalyticsFallback />,
);

// Lazy load individual chart components for better granular loading
export const LazyRevenueChart = createLazyComponent(
  () => import("./revenue-chart").then((m) => ({ default: m.RevenueChart })),
  <div className="animate-pulse">
    <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
    <div className="h-64 rounded bg-gray-200"></div>
  </div>,
);

export const LazyBookingTrendsChart = createLazyComponent(
  () =>
    import("./booking-trends-chart").then((m) => ({
      default: m.BookingTrendsChart,
    })),
  <div className="animate-pulse">
    <div className="mb-4 h-6 w-40 rounded bg-gray-200"></div>
    <div className="h-64 rounded bg-gray-200"></div>
  </div>,
);

export const LazyServicePerformanceTable = createLazyComponent(
  () =>
    import("./service-performance-table").then((m) => ({
      default: m.ServicePerformanceTable,
    })),
  <div className="animate-pulse space-y-4">
    <div className="h-8 w-full rounded bg-gray-200"></div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-12 w-full rounded bg-gray-200"></div>
    ))}
  </div>,
);
