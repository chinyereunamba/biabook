import { auth } from "@/server/auth";
import { Users, Calendar, TrendingUp } from "lucide-react";
import type { RecentBooking } from "@/types/dashboard";
import { SiteHeader } from "@/components/site-header";
import { Stats } from "@/components/application/dashboard/stats";
import { businessRepository } from "@/server/repositories/business-repository";
import { getDashboardStats } from "@/server/utils/stats";
import { appointmentRepository } from "@/server/repositories/appointment-repository";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user.id;
  const businesses = await businessRepository.findByOwnerId(userId!);
  const business = businesses[0];

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

  const stats = await getDashboardStats(business!.id);

  // Mock recent bookings data
  const recentBookings: RecentBooking[] = [];
  const allAppointments = await appointmentRepository.getAllAppointments(
    business!.id,
  );



  return (
    <div className="bg-background w-full rounded-xl">
      {/* Header */}
      <SiteHeader
        header="Dashboard"
        desc="Welcome back! Here's your business overview."
      />

      <div className="px-6 py-8">
        {/* Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          {/* <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
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
          </div> */}
          {stats.map((item) => (
            <Stats key={item.title} item={item} />
          ))}
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
            <div className="bg-muted/20 flex h-[300px] items-center justify-center rounded-lg">
              <div className="text-center">
                <TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                  Revenue chart will be available soon
                </p>
              </div>
            </div>
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
            <div className="bg-muted/20 flex h-[300px] items-center justify-center rounded-lg">
              <div className="text-center">
                <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                  Bookings chart will be available soon
                </p>
              </div>
            </div>
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
                {allAppointments.map((booking) => (
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
                      {booking.service.name}
                    </td>
                    <td className="text-foreground px-4 py-4">
                      <p>{booking.appointmentDate.toLocaleString()}</p>
                      <p className="text-muted-foreground text-sm">
                        {/* {booking?.time} */}
                      </p>
                    </td>
                    <td className="text-foreground px-4 py-4 font-semibold">
                      {booking.service.price}
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
