"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Search,
  MoreVertical,
} from "lucide-react";

const platformData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 19000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 22000 },
  { month: "May", revenue: 28000 },
  { month: "Jun", revenue: 32000 },
];

const businesses = [
  {
    id: 1,
    name: "Bella Hair Salon",
    owner: "Sarah Martinez",
    category: "Hair Salon",
    bookings: 156,
    revenue: "$7,800",
    joined: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "MindMath Tutoring",
    owner: "David Johnson",
    category: "Education",
    bookings: 89,
    revenue: "$4,450",
    joined: "2024-02-03",
    status: "active",
  },
  {
    id: 3,
    name: "Wellness Clinic",
    owner: "Dr. Lisa Chen",
    category: "Healthcare",
    bookings: 234,
    revenue: "$11,700",
    joined: "2024-01-08",
    status: "active",
  },
  {
    id: 4,
    name: "FitCore Gym",
    owner: "Mike Rodriguez",
    category: "Fitness",
    bookings: 45,
    revenue: "$2,250",
    joined: "2024-03-12",
    status: "suspended",
  },
];

export default function AdminDashboard() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Platform overview and business management
            </p>
          </div>
          <div className="bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold">
            A
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Businesses
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">127</h3>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <Building2 className="text-primary h-6 w-6" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Active on platform</p>
          </div>

          <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Active Businesses
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">119</h3>
              </div>
              <div className="rounded-lg bg-green-500/10 p-3">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Currently operating</p>
          </div>

          <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Bookings
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  2,847
                </h3>
              </div>
              <div className="bg-accent/10 rounded-lg p-3">
                <TrendingUp className="text-accent h-6 w-6" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Across all businesses
            </p>
          </div>

          <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Platform Revenue
                </p>
                <h3 className="text-foreground mt-2 text-3xl font-bold">
                  $142,350
                </h3>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Total commission earned
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card border-border mb-8 rounded-xl border p-6">
          <div className="mb-6">
            <h3 className="text-foreground text-lg font-semibold">
              Platform Revenue Trend
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Last 6 months performance
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={platformData}>
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

        {/* Registered Businesses */}
        <div className="bg-card border-border rounded-xl border p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-lg font-semibold">
                Registered Businesses
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                All businesses on the platform
              </p>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search businesses..."
                className="bg-input border-border text-foreground placeholder-muted-foreground rounded-lg border py-2 pr-4 pl-10 text-sm"
              />
            </div>
          </div>

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
                    Bookings
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                    Revenue
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business) => (
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
                      {business.owner}
                    </td>
                    <td className="text-foreground px-4 py-4">
                      {business.category}
                    </td>
                    <td className="text-foreground px-4 py-4">
                      {business.bookings}
                    </td>
                    <td className="text-foreground px-4 py-4 font-semibold">
                      {business.revenue}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          business.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {business.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="hover:bg-secondary rounded-lg p-2 transition-colors">
                        <MoreVertical className="text-muted-foreground h-4 w-4" />
                      </button>
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
