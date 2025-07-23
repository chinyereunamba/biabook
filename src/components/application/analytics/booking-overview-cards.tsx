"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle,
} from "lucide-react";

interface BookingOverviewCardsProps {
  data: {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    completedBookings: number;
  };
}

export function BookingOverviewCards({ data }: BookingOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <CalendarCheck className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalBookings}</div>
          <p className="text-muted-foreground text-xs">
            All bookings in selected period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.confirmedBookings}</div>
          <p className="text-muted-foreground text-xs">
            {data.totalBookings > 0
              ? `${((data.confirmedBookings / data.totalBookings) * 100).toFixed(1)}% of total`
              : "0% of total"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <CalendarClock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.pendingBookings}</div>
          <p className="text-muted-foreground text-xs">
            {data.totalBookings > 0
              ? `${((data.pendingBookings / data.totalBookings) * 100).toFixed(1)}% of total`
              : "0% of total"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          <CalendarX className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.cancelledBookings}</div>
          <p className="text-muted-foreground text-xs">
            {data.totalBookings > 0
              ? `${((data.cancelledBookings / data.totalBookings) * 100).toFixed(1)}% of total`
              : "0% of total"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
