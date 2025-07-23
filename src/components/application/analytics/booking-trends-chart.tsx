"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { BookingTrend } from "@/types/analytics";

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
  // Format data for the chart
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), "MMM dd"),
    // Convert cents to dollars for display
    formattedRevenue: item.revenue / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          dataKey="formattedDate"
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value}
          width={30}
        />
        {showRevenue && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            width={40}
          />
        )}
        <Tooltip
          formatter={(value, name) => {
            if (name === "formattedRevenue") {
              return [`$${value}`, "Revenue"];
            }
            if (name === "confirmedBookings") {
              return [value, "Confirmed"];
            }
            if (name === "cancelledBookings") {
              return [value, "Cancelled"];
            }
            return [value, name];
          }}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        {!hideBookings && (
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            yAxisId="left"
            name="Bookings"
          />
        )}
        {!hideBookings && (
          <Line
            type="monotone"
            dataKey="confirmedBookings"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            yAxisId="left"
            name="Confirmed"
          />
        )}
        {showRevenue && (
          <Line
            type="monotone"
            dataKey="formattedRevenue"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            yAxisId="right"
            name="Revenue"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
