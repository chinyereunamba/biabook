"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LoadingServiceGrid,
  PulseLoading,
} from "@/components/ui/loading-states";
import { BookingOverviewCards } from "./booking-overview-cards";
import { RevenueChart } from "./revenue-chart";
import { ServicePerformanceTable } from "./service-performance-table";
import { CustomerMetricsCards } from "./customer-metrics-cards";
import { BookingTrendsChart } from "./booking-trends-chart";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { AnalyticsResponse } from "@/types/analytics";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

export function AnalyticsDashboard() {
  // Set default date range to last 30 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = subDays(to, 30);
    return { from, to };
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Format date range for API
  const from = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined;
  const to = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["analytics", from, to],
    queryFn: async () => {
      try {
        // In a real app, you would get the business ID from context or state
        const businessId = "your-business-id";

        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        params.append("trends", "true");
        params.append("services", "true");

        const response = await fetch(
          `/api/businesses/${businessId}/analytics?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        return response.json() as Promise<AnalyticsResponse>;
      } catch (error) {
        // Let the error bubble up to be handled by React Query error handling
        throw error;
      }
    },
  });

  // Handle export analytics data
  const handleExportData = () => {
    if (!analyticsData) return;

    // Create CSV content
    const csvContent = [
      // Headers
      "Date,Total Bookings,Confirmed Bookings,Revenue",
      // Data rows
      ...(analyticsData.trends ?? []).map(
        (trend) =>
          `${trend.date},${trend.bookings},${trend.confirmedBookings},${(trend.revenue / 100).toFixed(2)}`,
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bookme-analytics-${from}-to-${to}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Analytics Dashboard</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="h-8 w-8"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            align="end"
            className="w-full sm:w-auto"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={!analyticsData || isLoading}
            className="h-10 gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6 grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <LoadingServiceGrid count={4} />
          ) : analyticsData ? (
            <>
              <BookingOverviewCards data={analyticsData.overview} />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Trends</CardTitle>
                    <CardDescription>
                      Bookings and revenue over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <BookingTrendsChart data={analyticsData.trends ?? []} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Metrics</CardTitle>
                    <CardDescription>
                      Revenue breakdown and growth
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RevenueChart
                      total={analyticsData.revenue.total}
                      confirmed={analyticsData.revenue.confirmed}
                      average={analyticsData.revenue.average}
                      monthlyGrowth={analyticsData.growth.monthly}
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <p>Failed to load analytics data</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {isLoading ? (
            <PulseLoading className="space-y-4" />
          ) : analyticsData ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(analyticsData.revenue.total / 100).toFixed(2)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {analyticsData.growth.monthly > 0 ? "+" : ""}
                      {analyticsData.growth.monthly.toFixed(1)}% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Confirmed Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(analyticsData.revenue.confirmed / 100).toFixed(2)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {(
                        (analyticsData.revenue.confirmed /
                          analyticsData.revenue.total) *
                        100
                      ).toFixed(1)}
                      % of total revenue
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Booking Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(analyticsData.revenue.average / 100).toFixed(2)}
                    </div>
                    <p className="text-muted-foreground text-xs">Per booking</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Daily revenue over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <BookingTrendsChart
                    data={analyticsData.trends ?? []}
                    showRevenue={true}
                    hideBookings={true}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="py-10 text-center">
              <p>Failed to load revenue data</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {isLoading ? (
            <LoadingServiceGrid count={3} />
          ) : analyticsData?.services ? (
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>
                  Booking and revenue metrics by service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServicePerformanceTable services={analyticsData.services} />
              </CardContent>
            </Card>
          ) : (
            <div className="py-10 text-center">
              <p>Failed to load service data</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          {isLoading ? (
            <PulseLoading className="space-y-4" />
          ) : analyticsData ? (
            <>
              <CustomerMetricsCards
                totalCustomers={analyticsData.customers.total}
                repeatCustomers={analyticsData.customers.repeat}
                repeatRate={analyticsData.customers.repeatRate}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Customer Retention</CardTitle>
                  <CardDescription>Repeat vs. new customers</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <div className="flex h-full flex-col items-center justify-center">
                    <div className="border-primary/20 mb-4 flex h-40 w-40 items-center justify-center rounded-full border-8">
                      <div
                        className="border-primary flex h-full w-full items-center justify-center rounded-full border-8"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((analyticsData.customers.repeatRate / 100) * 2 * Math.PI)}% ${50 - 50 * Math.sin((analyticsData.customers.repeatRate / 100) * 2 * Math.PI)}%, 50% 50%)`,
                        }}
                      ></div>
                      <div className="absolute text-2xl font-bold">
                        {analyticsData.customers.repeatRate.toFixed(1)}%
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {analyticsData.customers.repeat} out of{" "}
                      {analyticsData.customers.total} customers have made
                      multiple bookings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="py-10 text-center">
              <p>Failed to load customer data</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-20" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function RevenueSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-20" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="mb-2 h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    </>
  );
}

function ServicesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="mb-2 h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomersSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-20" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="mb-2 h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    </>
  );
}
