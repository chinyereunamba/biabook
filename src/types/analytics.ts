export interface AnalyticsOverview {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancellationRate: number;
}

export interface AnalyticsRevenue {
  total: number;
  confirmed: number;
  average: number;
}

export interface AnalyticsGrowth {
  bookings: number;
  revenue: number;
  monthly: number;
}

export interface AnalyticsTrend {
  date: string;
  bookings: number;
  confirmedBookings: number;
  revenue: number;
}

export interface AnalyticsService {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  averagePrice: number;
  conversionRate: number;
}

export interface AnalyticsCustomers {
  total: number;
  repeat: number;
  repeatRate: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  revenue: AnalyticsRevenue;
  growth: AnalyticsGrowth;
  trends: AnalyticsTrend[];
  services: AnalyticsService[];
  customers: AnalyticsCustomers;
}

export interface AnalyticsResponse extends AnalyticsData {}
