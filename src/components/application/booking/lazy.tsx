"use client";

import {
  createLazyComponent,
  BookingFormFallback,
  CalendarFallback,
  TimeSlotFallback,
  BusinessProfileFallback,
} from "@/lib/lazy-loading";

// Lazy load booking components
export const LazyBusinessProfile = createLazyComponent(
  () =>
    import("./business-profile").then((m) => ({
      default: m.BusinessProfileComponent,
    })),
  <BusinessProfileFallback />,
);

export const LazyServiceSelection = createLazyComponent(
  () =>
    import("./service-selection").then((m) => ({
      default: m.ServiceSelection,
    })),
  <div className="animate-pulse space-y-4">
    <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 rounded bg-gray-200"></div>
      ))}
    </div>
  </div>,
);

export const LazyCalendar = createLazyComponent(
  () => import("./calendar").then((m) => ({ default: m.Calendar })),
  <CalendarFallback />,
);

export const LazyTimeSlotGrid = createLazyComponent(
  () => import("./time-slot-grid").then((m) => ({ default: m.TimeSlotGrid })),
  <TimeSlotFallback />,
);

export const LazyCustomerForm = createLazyComponent(
  () => import("./customer-form").then((m) => ({ default: m.CustomerForm })),
  <BookingFormFallback />,
);

export const LazyBookingConfirmation = createLazyComponent(
  () =>
    import("./booking-confirmation").then((m) => ({
      default: m.BookingConfirmation,
    })),
  <div className="animate-pulse">
    <div className="mb-4 h-8 w-48 rounded bg-gray-200"></div>
    <div className="h-64 rounded bg-gray-200"></div>
  </div>,
);

export const LazyServiceGrid = createLazyComponent(
  () => import("./service-grid").then((m) => ({ default: m.ServiceGrid })),
  <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-48 rounded bg-gray-200"></div>
    ))}
  </div>,
);

export const LazyBookingManagement = createLazyComponent(
  () =>
    import("./booking-management").then((m) => ({
      default: m.BookingManagement,
    })),
  <div className="animate-pulse space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-8 w-32 rounded bg-gray-200"></div>
      <div className="h-10 w-24 rounded bg-gray-200"></div>
    </div>
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 rounded bg-gray-200"></div>
      ))}
    </div>
  </div>,
);
