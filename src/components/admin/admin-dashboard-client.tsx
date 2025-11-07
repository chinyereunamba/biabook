"use client";

import { useEffect, useState } from "react";
// Recharts temporarily disabled for React 19 compatibility
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Search,
  MoreVertical,
  Calendar,
  Activity,
  RefreshCw,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStats {
  overview: {
    totalBusinesses: number;
    totalUsers: number;
    totalAppointments: number;
    totalServices: number;
    totalRevenue: number;
    recentAppointments: number;
    weeklyAppointments: number;
  };
  appointmentsByStatus: Array<{
    status: string;
    count: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  topBusinesses: Array<{
    businessId: string;
    businessName: string;
    totalBookings: number;
    totalRevenue: number;
  }>;
}

interface Business {
  id: string;
  name: string;
  ownerName: string;
  categoryName: string;
  totalAppointments: number;
  totalRevenue: number;
  createdAt: string;
  phone?: string;
  email?: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAdminStats();
    fetchBusinesses();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/admin/businesses?limit=10");
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses);
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading admin dashboard...</span>
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
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Platform overview and business management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchAdminStats();
                fetchBusinesses();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <div className="bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold">
              A
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Businesses
                  </p>
                  <h3 className="text-foreground mt-2 text-3xl font-bold">
                    {stats?.overview.totalBusinesses || 0}
                  </h3>
                </div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <Building2 className="text-primary h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">Active on platform</span>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Users
                  </p>
                  <h3 className="text-foreground mt-2 text-3xl font-bold">
                    {stats?.overview.totalUsers || 0}
                  </h3>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">Registered users</span>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Appointments
                  </p>
                  <h3 className="text-foreground mt-2 text-3xl font-bold">
                    {stats?.overview.totalAppointments || 0}
                  </h3>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground">
                  {stats?.overview.weeklyAppointments || 0} this week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Platform Revenue
                  </p>
                  <h3 className="text-foreground mt-2 text-3xl font-bold">
                    {formatCurrency(stats?.overview.totalRevenue || 0)}
                  </h3>
                </div>
                <div className="rounded-lg bg-orange-500/10 p-3">
                  <DollarSign className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">From completed bookings</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Revenue Trend</span>
                <TrendingUp className="text-muted-foreground h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted/20">
                <div className="text-center">
                  <TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    Revenue chart will be available soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Appointment Status</span>
                <Activity className="text-muted-foreground h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 flex h-[300px] items-center justify-center rounded-lg">
                <div className="text-center">
                  <Activity className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    Status chart will be available soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Businesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Performing Businesses</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Business Name
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Total Bookings
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Revenue
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.topBusinesses || []).map((business, index) => (
                    <tr
                      key={business.businessId}
                      className="border-border hover:bg-secondary/50 border-b transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                            {index + 1}
                          </div>
                          <p className="text-foreground font-medium">
                            {business.businessName}
                          </p>
                        </div>
                      </td>
                      <td className="text-foreground px-4 py-4 font-semibold">
                        {business.totalBookings}
                      </td>
                      <td className="text-foreground px-4 py-4 font-semibold">
                        {formatCurrency(business.totalRevenue)}
                      </td>
                      <td className="px-4 py-4">
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Businesses */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Businesses</span>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  className="bg-input border-border text-foreground placeholder-muted-foreground rounded-lg border py-2 pr-4 pl-10 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Business
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Owner
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Category
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Appointments
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Revenue
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Joined
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {businesses
                    .filter(
                      (business) =>
                        business.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        business.ownerName
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                    )
                    .map((business) => (
                      <tr
                        key={business.id}
                        className="border-border hover:bg-secondary/50 border-b transition-colors"
                      >
                        <td className="px-4 py-4">
                          <p className="text-foreground font-medium">
                            {business.name}
                          </p>
                        </td>
                        <td className="text-foreground px-4 py-4">
                          {business.ownerName || "N/A"}
                        </td>
                        <td className="text-foreground px-4 py-4">
                          {business.categoryName || "N/A"}
                        </td>
                        <td className="text-foreground px-4 py-4">
                          {business.totalAppointments}
                        </td>
                        <td className="text-foreground px-4 py-4 font-semibold">
                          {formatCurrency(business.totalRevenue)}
                        </td>
                        <td className="text-muted-foreground px-4 py-4 text-sm">
                          {formatDate(business.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
