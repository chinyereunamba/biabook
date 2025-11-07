"use client";

// Recharts temporarily disabled for React 19 compatibility
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react";

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
    return `${(value / 100).toFixed(2)}`;
  };

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

      <div className="bg-muted/20 flex h-[200px] items-center justify-center rounded-lg">
        <div className="text-center">
          <DollarSign className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-sm">
            Revenue chart will be available soon
          </p>
        </div>
      </div>
    </div>
  );
}
