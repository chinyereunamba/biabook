import { auth } from "@/server/auth";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
  Loader2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import type { RecentBooking, Stats } from "@/types/dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default async function DashboardPage() {
  const session = await auth();

  // Session is guaranteed to exist and be onboarded due to layout checks

  const revenueData = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 2000 },
    { month: "Apr", revenue: 2780 },
    { month: "May", revenue: 1890 },
    { month: "Jun", revenue: 2390 },
  ];

  const bookingsData = [
    { day: "Mon", bookings: 24 },
    { day: "Tue", bookings: 13 },
    { day: "Wed", bookings: 30 },
    { day: "Thu", bookings: 20 },
    { day: "Fri", bookings: 35 },
    { day: "Sat", bookings: 28 },
    { day: "Sun", bookings: 15 },
  ];

  // Mock recent bookings data
  const recentBookings: RecentBooking[] = [];

  return (
    <div className="bg-background min-h-screen w-full">
      {/* Header */}
      <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Welcome back! Here's your business overview.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:bg-secondary rounded-lg p-2 transition-colors">
              <svg
                className="text-muted-foreground h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Revenue
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  $45,231.89
                </h3>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <DollarSign className="text-primary h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-500">+20.1%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Bookings
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  +2,350
                </h3>
              </div>
              <div className="bg-accent/10 rounded-lg p-3">
                <Calendar className="text-accent h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-500">+180.1%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Monthly Revenue
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  $12,500.00
                </h3>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              This month's earnings
            </p>
          </div>

          {/* Today's Bookings */}
          <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Today's Bookings
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  +573
                </h3>
              </div>
              <div className="rounded-lg bg-purple-500/10 p-3">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Appointments scheduled
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <div className="bg-card border-border rounded-xl border p-6 lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-foreground text-lg font-semibold">
                Revenue Trend
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Last 6 months performance
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
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
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Bookings */}
          <div className="bg-card border-border rounded-xl border p-6">
            <div className="mb-6">
              <h3 className="text-foreground text-lg font-semibold">
                Weekly Bookings
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                This week's activity
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="bookings"
                  fill="var(--color-accent)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-card border-border rounded-xl border p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-lg font-semibold">
                Recent Bookings
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Latest customer appointments
              </p>
            </div>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                    Customer
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                    Service
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                    Date & Time
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                    Amount
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-border hover:bg-secondary/50 border-b transition-colors"
                  >
                    <td className="px-4 py-4">
                      <p className="text-foreground font-medium">
                        {booking.customerName}
                      </p>
                    </td>
                    <td className="text-foreground px-4 py-4">
                      {booking.serviceName}
                    </td>
                    <td className="text-foreground px-4 py-4">
                      <p>{booking.appointmentDate}</p>
                      <p className="text-muted-foreground text-sm">
                        {/* {booking?.time} */}
                      </p>
                    </td>
                    <td className="text-foreground px-4 py-4 font-semibold">
                      {booking.servicePrice}
                    </td>
                    <td className="px-4 py-4">
                      {/* <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          booking.status === "Confirmed"
                            ? "bg-green-500/20 text-green-400"
                            : booking.status === "Pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {booking.status}
                      </span> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
