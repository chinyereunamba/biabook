export interface RevenueStats {
  total: number;
  currentMonth: number;
  percentChange: number;
}

export interface BookingStats {
  total: number;
  currentMonth: number;
  percentChange: number;
  today: number;
}

export interface Stats {
  revenue: RevenueStats;
  bookings: BookingStats;
}

export interface RecentBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  appointmentDate: string;
  status: "confirmed" | "cancelled" | "pending";
  servicePrice: number;
  serviceName?: string;
}
