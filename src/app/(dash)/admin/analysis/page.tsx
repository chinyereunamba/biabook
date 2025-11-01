"use client";

import { useEffect, useState } from "react";
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

export default function AdminAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  // Mock data - in real app, this would come from API
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 142350,
      revenueGrowth: 12.5,
      totalBookings: 2847,
      bookingsGrowth: 8.3,
      activeBusinesses: 119,
      businessGrowth: 15.2,
      avgBookingValue: 50,
      valueGrowth: -2.1,
    },
    revenueByMonth: [
      { month: "Jan", revenue: 12000, bookings: 240 },
      { month: "Feb", revenue: 19000, bookings: 380 },
      { month: "Mar", revenue: 15000, bookings: 300 },
      { month: "Apr", revenue: 22000, bookings: 440 },
      { month: "May", revenue: 28000, bookings: 560 },
      { month: "Jun", revenue: 32000, bookings: 640 },
    ],
    bookingsByCategory: [
      { name: "Hair Salons", value: 45, bookings: 1281 },
      { name: "Healthcare", value: 25, bookings: 712 },
      { name: "Fitness", value: 15, bookings: 427 },
      { name: "Education", value: 10, bookings: 285 },
      { name: "Spa & Wellness", value: 5, bookings: 142 },
    ],
    businessGrowth: [
      { month: "Jan", businesses: 95, active: 89 },
      { month: "Feb", businesses: 102, active: 96 },
      { month: "Mar", businesses: 108, active: 101 },
      { month: "Apr", businesses: 115, active: 108 },
      { month: "May", businesses: 122, active: 115 },
      { month: "Jun", businesses: 127, active: 119 },
    ],
    topPerformingBusinesses: [
      { name: "Bella Hair Salon", revenue: 7800, bookings: 156, growth: 23.5 },
      { name: "Wellness Clinic", revenue: 11700, bookings: 234, growth: 18.2 },
      { name: "FitCore Gym", revenue: 5400, bookings: 108, growth: 15.8 },
      { name: "MindMath Tutoring", revenue: 4450, bookings: 89, growth: 12.1 },
      { name: "Zen Spa", revenue: 3200, bookings: 64, growth: 9.7 },
    ],
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen w-full">
      {/* Header */}
      <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Deep dive into platform performance and trends
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="">
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
                <span className="text-muted-foreground ml-1">
                  vs last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="">
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
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">
                  {formatPercentage(analyticsData.overview.bookingsGrowth)}
                </span>
                <span className="text-muted-foreground ml-1">
                  vs last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="">
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
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">
                  {formatPercentage(analyticsData.overview.businessGrowth)}
                </span>
                <span className="text-muted-foreground ml-1">
                  vs last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="">
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
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-red-500">
                  {formatPercentage(analyticsData.overview.valueGrowth)}
                </span>
                <span className="text-muted-foreground ml-1">
                  vs last period
                </span>
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
                  <XAxis
                    dataKey="month"
                    stroke="var(--color-muted-foreground)"
                  />
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
                  <XAxis
                    dataKey="month"
                    stroke="var(--color-muted-foreground)"
                  />
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
                {analyticsData.topPerformingBusinesses.map(
                  (business, index) => (
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
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
