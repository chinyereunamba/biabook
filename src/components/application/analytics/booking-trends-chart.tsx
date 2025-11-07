"use client";

// Recharts temporarily disabled for React 19 compatibility
import { format, parseISO } from "date-fns";
import type { BookingTrend } from "@/types/analytics";
import { TrendingUp } from "lucide-react";

interface BookingTrendsChartProps {
  data: BookingTrend[];
  showRevenue?: boolean;
  hideBookings?: boolean;
}

export function BookingTrendsChart({
  data,
  showRevenue = true,
  hideBookings = false,
}: BookingTrendsChartProps) {
  return (
    <div className="bg-muted/20 flex h-full w-full items-center justify-center rounded-lg">
      <div className="text-center">
        <TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <p className="text-muted-foreground text-sm">
          Booking trends chart will be available soon
        </p>
      </div>
    </div>
  );
}
