/**
 * Analytics data types for the BiaBook application
 */

export interface DateRangeFilter {
  from?: string; // YYYY-MM-DD format
  to?: string; // YYYY-MM-DD format
}

export interface BookingAnalytics {
  // Basic counts
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  completedBookings: number;

  // Revenue metrics
  totalRevenue: number;
  confirmedRevenue: number;
  averageBookingValue: number;

  // Time-based metrics
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;

  // Growth metrics
  monthlyGrowth: number;
  weeklyGrowth: number;

  // Service performance
  topServices: ServicePerformance[];

  // Customer metrics
  totalCustomers: number;
  repeatCustomers: number;
  repeatCustomerRate: number;
}

export interface ServicePerformance {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  revenue: number;
  averagePrice: number;
  cancellationRate: number;
}

export interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  repeatCustomers: number;
  repeatCustomerRate: number;
}

export interface AnalyticsResponse {
  overview: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    completedBookings: number;
  };
  revenue: {
    total: number;
    confirmed: number;
    average: number;
  };
  timeMetrics: {
    today: number;
    week: number;
    month: number;
  };
  growth: {
    monthly: number;
    weekly: number;
  };
  services?: ServicePerformance[];
  customers: {
    total: number;
    repeat: number;
    repeatRate: number;
  };
  trends?: BookingTrend[];
  dateRange?: {
    from: string | null;
    to: string | null;
  };
}
