"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Building2,
  DollarSign,
  Activity,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#8dd1e1",
  "#d084d0",
];

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalBookings: number;
    bookingsGrowth: number;
    activeBusinesses: number;
    businessGrowth: number;
    avgBookingValue: number;
    valueGrowth: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  bookingsByCategory: Array<{
    name: string;
    value: number;
    bookings: number;
  }>;
  businessGrowth: Array<{
    month: string;
    businesses: number;
    active: number;
  }>;
  topPerformingBusinesses: Array<{
    name: string;
    revenue: number;
    bookings: number;
    growth: number;
  }>;
}

export default function AnalyticsCharts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read time range from URL
  const timeRange = searchParams.get("timeRange") || "30d";

  // Update URL when time range changes
  const updateTimeRange = (newTimeRange: string) => {
    const params = new URLSearchParams(searchParams);
    if (newTimeRange !== "30d") {
      params.set("timeRange", newTimeRange);
    } else {
      params.delete("timeRange");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/analytics?timeRange=${timeRange}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const exportData = () => {
    if (!analyticsData) return;

    const csvContent = [
      ["Metric", "Value"],
      ["Total Revenue", analyticsData.overview.totalRevenue.toString()],
      ["Total Bookings", analyticsData.overview.totalBookings.toString()],
      ["Active Businesses", analyticsData.overview.activeBusinesses.toString()],
      [
        "Average Booking Value",
        analyticsData.overview.avgBookingValue.toString(),
      ],
      ["Revenue Growth", `${analyticsData.overview.revenueGrowth}%`],
      ["Bookings Growth", `${analyticsData.overview.bookingsGrowth}%`],
      ["Business Growth", `${analyticsData.overview.businessGrowth}%`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-destructive mb-2 text-lg font-semibold">
              Failed to load analytics
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">{error}</p>
            <Button onClick={fetchAnalytics} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <>
      {/* Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => updateTimeRange(e.target.value)}
            className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Revenue
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  {formatCurrency(analyticsData.overview.totalRevenue)}
                </h3>
              </div>
              <div className="rounded-lg bg-green-500/10 p-3">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {analyticsData.overview.revenueGrowth > 0 ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span
                className={
                  analyticsData.overview.revenueGrowth > 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {formatPercentage(analyticsData.overview.revenueGrowth)}
              </span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Bookings
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  {analyticsData.overview.totalBookings.toLocaleString()}
                </h3>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {analyticsData.overview.bookingsGrowth > 0 ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span
                className={
                  analyticsData.overview.bookingsGrowth > 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {formatPercentage(analyticsData.overview.bookingsGrowth)}
              </span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Active Businesses
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  {analyticsData.overview.activeBusinesses}
                </h3>
              </div>
              <div className="rounded-lg bg-purple-500/10 p-3">
                <Building2 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {analyticsData.overview.businessGrowth > 0 ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span
                className={
                  analyticsData.overview.businessGrowth > 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {formatPercentage(analyticsData.overview.businessGrowth)}
              </span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Avg Booking Value
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  {formatCurrency(analyticsData.overview.avgBookingValue)}
                </h3>
              </div>
              <div className="rounded-lg bg-orange-500/10 p-3">
                <Activity className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {analyticsData.overview.valueGrowth > 0 ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span
                className={
                  analyticsData.overview.valueGrowth > 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {formatPercentage(analyticsData.overview.valueGrowth)}
              </span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={analyticsData.revenueByMonth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? formatCurrency(value) : value,
                    name === "revenue" ? "Revenue" : "Bookings",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Business Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Business Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analyticsData.businessGrowth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="businesses"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: "#8884d8", r: 4 }}
                  name="Total Businesses"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ fill: "#82ca9d", r: 4 }}
                  name="Active Businesses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bookings by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analyticsData.bookingsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.bookingsByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value}% (${props.payload.bookings} bookings)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Businesses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPerformingBusinesses.length > 0 ? (
                analyticsData.topPerformingBusinesses.map((business, index) => (
                  <div
                    key={business.name}
                    className="bg-secondary/20 flex items-center justify-between rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{business.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {business.bookings} bookings
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(business.revenue)}
                      </p>
                      <p className="text-sm text-green-500">
                        {formatPercentage(business.growth)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Building2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">
                    No business data available for this period
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
