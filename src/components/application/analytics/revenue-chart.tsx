"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface RevenueChartProps {
  total: number;
  confirmed: number;
  average: number;
  monthlyGrowth: number;
}

export function RevenueChart({
  total,
  confirmed,
  average,
  monthlyGrowth,
}: RevenueChartProps) {
  // Format currency for display
  const formatCurrency = (value: number) => {
    return `$${(value / 100).toFixed(2)}`;
  };

  // Prepare data for the chart
  const data = [
    {
      name: "Total",
      value: total / 100,
    },
    {
      name: "Confirmed",
      value: confirmed / 100,
    },
    {
      name: "Average",
      value: average / 100,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Total Revenue</span>
          <div className="text-2xl font-bold">{formatCurrency(total)}</div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Monthly Growth</span>
          <div className="flex items-center">
            <span className="text-2xl font-bold">
              {monthlyGrowth.toFixed(1)}%
            </span>
            <span className="ml-2">
              {monthlyGrowth > 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : monthlyGrowth < 0 ? (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              ) : null}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${value}`} width={50} />
            <Tooltip
              formatter={(value) => [`$${value}`, "Revenue"]}
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
