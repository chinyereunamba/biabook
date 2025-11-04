import React, {
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import { Card, CardContent } from "../ui/card";
import {
  Building2,
  TrendingUp,
  Users,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessSummary } from "@/types/admin";

export default function BusinessSummary({
  summary,
}: {
  summary: BusinessSummary;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };
  const avgRevenue =
    summary.total > 0
      ? formatCurrency(summary.totalRevenue / summary.total)
      : "$0.00";

  const stats = [
    {
      id: 1,
      title: "Number of Businesses",
      value: summary.total,
      icon: Building2,
      bg: "bg-blue-500/10",
      color: "text-blue-500",
    },
    {
      id: 2,
      title: "Active Businesses",
      value: summary.active,
      icon: TrendingUp,
      bg: "bg-green-500/10",
      color: "text-green-500",
    },
    {
      id: 3,
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      icon: TrendingUp,
      bg: "bg-purple-500/10",
      color: "text-purple-500",
    },
    {
      id: 4,
      title: "Avg Revenue",
      value: avgRevenue,
      icon: Users,
      bg: "bg-orange-500/10",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      {stats.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {item.title}
                </p>
                <h3 className="text-foreground mt-2 text-2xl font-bold">
                  {item.value}
                </h3>
              </div>
              <div className={cn("rounded-lg p-3", item.bg)}>
                <item.icon className={cn("h-6 w-6", item.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
