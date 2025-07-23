"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Percent } from "lucide-react";

interface CustomerMetricsCardsProps {
  totalCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
}

export function CustomerMetricsCards({
  totalCustomers,
  repeatCustomers,
  repeatRate,
}: CustomerMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-muted-foreground text-xs">
            Unique customers in selected period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Repeat Customers
          </CardTitle>
          <UserCheck className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{repeatCustomers}</div>
          <p className="text-muted-foreground text-xs">
            Customers with multiple bookings
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Repeat Rate</CardTitle>
          <Percent className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{repeatRate.toFixed(1)}%</div>
          <p className="text-muted-foreground text-xs">
            Percentage of repeat customers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
