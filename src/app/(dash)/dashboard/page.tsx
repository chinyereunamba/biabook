"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
  Loader2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [stats, setStats] = useState<unknown>(null);
  const [recentBookings, setRecentBookings] = useState<[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  if (session?.user && session?.user.needsOnboarding) {
    router.replace("/onboarding/welcome");
  }
  // Load the current user's business
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const response = await fetch("/api/me/business");
        if (!response.ok) {
          throw new Error("Failed to fetch business");
        }

        const data = await response.json();
        if (data.business) {
          setBusinessId(data.business.id);
        } else {
          // If no business is found, use a default one for demo purposes
          setBusinessId("business-1");
        }
      } catch (error) {
        console.error("Failed to load business:", error);
        // Use a default business ID for demo purposes
        setBusinessId("business-1");
      }
    };

    loadBusiness();
  }, []);

  // Load dashboard data when businessId is available
  useEffect(() => {
    if (!businessId) return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load stats
        const statsResponse = await fetch(
          `/api/businesses/${businessId}/stats`,
        );
        if (!statsResponse.ok) {
          throw new Error("Failed to fetch business stats");
        }
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Load recent bookings
        const bookingsResponse = await fetch(
          `/api/businesses/${businessId}/appointments?limit=5`,
        );
        if (!bookingsResponse.ok) {
          throw new Error("Failed to fetch recent bookings");
        }
        const bookingsData = await bookingsResponse.json();
        setRecentBookings(bookingsData.appointments || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Failed to load dashboard data");

        // Set default data for demo purposes if API fails
        setStats({
          revenue: {
            total: 4523189,
            currentMonth: 1250000,
            percentChange: 20.1,
          },
          bookings: {
            total: 2350,
            currentMonth: 350,
            percentChange: 180.1,
            today: 573,
          },
        });

        setRecentBookings([
          {
            id: "booking-1",
            customerName: "Liam Johnson",
            customerEmail: "liam@example.com",
            appointmentDate: "2023-06-23",
            status: "confirmed",
            servicePrice: 25000,
          },
          {
            id: "booking-2",
            customerName: "Olivia Smith",
            customerEmail: "olivia@example.com",
            appointmentDate: "2023-06-24",
            status: "cancelled",
            servicePrice: 15000,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [businessId]);

  // Format price from cents to dollars
  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="mt-2 text-sm text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <main className="flex flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.revenue ? formatPrice(stats.revenue.total) : "0.00"}
              </div>
              <p className="text-muted-foreground text-xs">
                {stats?.revenue?.percentChange > 0 ? "+" : ""}
                {stats?.revenue?.percentChange?.toFixed(1) || "0"}% from last
                month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{stats?.bookings?.total || "0"}
              </div>
              <p className="text-muted-foreground text-xs">
                {stats?.bookings?.percentChange > 0 ? "+" : ""}
                {stats?.bookings?.percentChange?.toFixed(1) || "0"}% from last
                month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <CreditCard className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {stats?.revenue
                  ? formatPrice(stats.revenue.currentMonth)
                  : "0.00"}
              </div>
              <p className="text-muted-foreground text-xs">
                This month's earnings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Bookings
              </CardTitle>
              <Activity className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{stats?.bookings?.today || "0"}
              </div>
              <p className="text-muted-foreground text-xs">
                Appointments scheduled for today
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Recent bookings from your customers.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/bookings" className="flex gap-2">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden xl:table-column">
                      Service
                    </TableHead>
                    <TableHead className="hidden xl:table-column">
                      Status
                    </TableHead>
                    <TableHead className="hidden xl:table-column">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-muted-foreground py-4 text-center"
                      >
                        No recent bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">
                            {booking.customerName}
                          </div>
                          <div className="text-muted-foreground hidden text-sm md:inline">
                            {booking.customerEmail}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-column">
                          {booking.serviceName || "Service"}
                        </TableCell>
                        <TableCell className="hidden xl:table-column">
                          <Badge
                            className="text-xs"
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "cancelled"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                          {booking.appointmentDate}
                        </TableCell>
                        <TableCell className="text-right">
                          ${formatPrice(booking.servicePrice)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm leading-none font-medium">Revenue</p>
                  <p className="text-muted-foreground text-sm">
                    This month's earnings
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  $
                  {stats?.revenue
                    ? formatPrice(stats.revenue.currentMonth)
                    : "0.00"}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm leading-none font-medium">Bookings</p>
                  <p className="text-muted-foreground text-sm">
                    This month's appointments
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {stats?.bookings?.currentMonth || "0"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
