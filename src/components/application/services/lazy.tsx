"use client";

import {
  createLazyComponent,
  ServiceManagementFallback,
} from "@/lib/lazy-loading";

// Lazy load service management components
export const LazyServiceManagement = createLazyComponent(
  () =>
    import("./service-management").then((m) => ({
      default: m.ServiceManagement,
    })),
  <ServiceManagementFallback />,
);

export const LazyServiceForm = createLazyComponent(
  () => import("./service-form").then((m) => ({ default: m.ServiceForm })),
  <div className="animate-pulse space-y-4">
    <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
    <div className="space-y-4">
      <div className="h-10 w-full rounded bg-gray-200"></div>
      <div className="h-24 w-full rounded bg-gray-200"></div>
      <div className="h-10 w-full rounded bg-gray-200"></div>
      <div className="h-10 w-32 rounded bg-gray-200"></div>
    </div>
  </div>,
);

export const LazyServiceList = createLazyComponent(
  () => import("./service-list").then((m) => ({ default: m.ServiceList })),
  <div className="animate-pulse space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-24 w-full rounded bg-gray-200"></div>
    ))}
  </div>,
);
