"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Building,
  TrendingUp,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Ban,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const businesses = [
    {
      id: 1,
      name: "Bella Hair Salon",
      owner: "Sarah Martinez",
      email: "sarah@bellahair.com",
      category: "Hair Salon",
      bookings: 156,
      revenue: 7800,
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "MindMath Tutoring",
      owner: "David Johnson",
      email: "david@mindmath.com",
      category: "Education",
      bookings: 89,
      revenue: 4450,
      status: "active",
      joinDate: "2024-02-03",
    },
    {
      id: 3,
      name: "Wellness Clinic",
      owner: "Dr. Lisa Chen",
      email: "lisa@wellnessclinic.com",
      category: "Healthcare",
      bookings: 234,
      revenue: 11700,
      status: "active",
      joinDate: "2024-01-08",
    },
    {
      id: 4,
      name: "FitCore Gym",
      owner: "Mike Rodriguez",
      email: "mike@fitcore.com",
      category: "Fitness",
      bookings: 45,
      revenue: 2250,
      status: "suspended",
      joinDate: "2024-03-12",
    },
  ];

  const stats = {
    totalBusinesses: 127,
    activeBusinesses: 119,
    totalBookings: 2847,
    totalRevenue: 142350,
  };

  const filteredBusinesses = businesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ??
      business.owner.toLowerCase().includes(searchTerm.toLowerCase()) ??
      business.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold">BookMe Admin</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Super Admin</Badge>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <span className="text-sm font-semibold text-purple-600">A</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Businesses
                  </p>
                  <p className="text-3xl font-bold">{stats.totalBusinesses}</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Active Businesses
                  </p>
                  <p className="text-3xl font-bold">{stats.activeBusinesses}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Bookings
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.totalBookings.toLocaleString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Platform Revenue
                  </p>
                  <p className="text-3xl font-bold">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Registered Businesses</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Search businesses..."
                    className="w-64 pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredBusinesses.map((business) => (
                <Card key={business.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                          <Building className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {business.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Owner: {business.owner} • {business.email}
                          </p>
                          <div className="mt-1 flex items-center space-x-4">
                            <Badge variant="secondary">
                              {business.category}
                            </Badge>
                            <Badge
                              variant={
                                business.status === "active"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                business.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                            >
                              {business.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {business.bookings}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Bookings
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            ${business.revenue.toLocaleString()}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Revenue
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            {business.joinDate}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Joined
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Ban className="mr-2 h-4 w-4" />
                              {business.status === "active"
                                ? "Suspend"
                                : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Business
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Business Growth</CardTitle>
                  <CardDescription>
                    New businesses registered over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex h-64 items-center justify-center">
                    Chart placeholder - Business growth over time
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Trends</CardTitle>
                  <CardDescription>
                    Total bookings across all businesses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex h-64 items-center justify-center">
                    Chart placeholder - Booking trends
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Businesses by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Hair Salons</span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div className="h-2 w-16 rounded-full bg-purple-600"></div>
                        </div>
                        <span className="text-sm">42</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Healthcare</span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div className="h-2 w-12 rounded-full bg-blue-600"></div>
                        </div>
                        <span className="text-sm">28</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Education</span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div className="h-2 w-10 rounded-full bg-green-600"></div>
                        </div>
                        <span className="text-sm">23</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Fitness</span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div className="h-2 w-8 rounded-full bg-orange-600"></div>
                        </div>
                        <span className="text-sm">18</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Platform revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>This Month</span>
                      <span className="font-bold">$12,450</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Month</span>
                      <span className="font-bold">$11,200</span>
                    </div>
                    <div className="flex items-center justify-between text-green-600">
                      <span>Growth</span>
                      <span className="font-bold">+11.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Settings</h2>

            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Business Approval</p>
                    <p className="text-muted-foreground text-sm">
                      Require manual approval for new business registrations
                    </p>
                  </div>
                  <Button variant="outline">Enabled</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">WhatsApp Integration</p>
                    <p className="text-muted-foreground text-sm">
                      Global WhatsApp API configuration
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-muted-foreground text-sm">
                      System email notification settings
                    </p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Maintenance</CardTitle>
                <CardDescription>
                  System maintenance and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  Export Business Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  Generate Analytics Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  System Health Check
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  Clear Cache
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
