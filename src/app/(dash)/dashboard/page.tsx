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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Plus,
  Settings,
  Bell,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [notifications, setNotifications] = useState(true);

  // Mock data
  const upcomingBookings = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      service: "Hair Cut & Style",
      time: "10:00 AM",
      date: "Today",
      phone: "+1 234-567-8900",
      status: "confirmed",
    },
    {
      id: 2,
      customerName: "Mike Chen",
      service: "Beard Trim",
      time: "2:30 PM",
      date: "Today",
      phone: "+1 234-567-8901",
      status: "confirmed",
    },
    {
      id: 3,
      customerName: "Emma Davis",
      service: "Hair Color",
      time: "9:00 AM",
      date: "Tomorrow",
      phone: "+1 234-567-8902",
      status: "pending",
    },
  ];

  const services = [
    { id: 1, name: "Hair Cut & Style", duration: "45 min", price: "$50" },
    { id: 2, name: "Hair Color", duration: "120 min", price: "$120" },
    { id: 3, name: "Beard Trim", duration: "30 min", price: "$25" },
  ];

  return (
    <div>
      {/* Header */}
      

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Today's Bookings
                  </p>
                  <p className="text-3xl font-bold">8</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">This Week</p>
                  <p className="text-3xl font-bold">32</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Revenue</p>
                  <p className="text-3xl font-bold">$1,240</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">WhatsApp</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${notifications ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <span className="text-sm">
                      {notifications ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Upcoming Bookings</h2>
              <Button asChild>
                <Link href="/dashboard/bookings/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Booking
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {booking.customerName}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {booking.phone}
                          </p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="font-medium">{booking.service}</p>
                        <p className="text-muted-foreground text-sm">
                          {booking.date} at {booking.time}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {booking.status === "confirmed" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {booking.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Services</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {service.duration}
                        </span>
                        <span className="text-foreground font-semibold">
                          {service.price}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <h2 className="text-2xl font-bold">Set Your Availability</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <div
                      key={day}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          defaultChecked={day !== "Sunday"}
                          className="rounded"
                        />
                        <span className="w-20 font-medium">{day}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select className="rounded border px-3 py-1">
                          <option>9:00 AM</option>
                          <option>10:00 AM</option>
                          <option>11:00 AM</option>
                        </select>
                        <span>to</span>
                        <select className="rounded border px-3 py-1">
                          <option>5:00 PM</option>
                          <option>6:00 PM</option>
                          <option>7:00 PM</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-6">Save Availability</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>

            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Notifications</CardTitle>
                <CardDescription>
                  Get notified on WhatsApp when customers book appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable WhatsApp notifications</p>
                    <p className="text-muted-foreground text-sm">
                      You'll receive a message for each new booking
                    </p>
                  </div>
                  <Button
                    variant={notifications ? "default" : "outline"}
                    onClick={() => setNotifications(!notifications)}
                  >
                    {notifications ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Update your business information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Business Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Bella Hair Salon"
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="+1 234-567-8900"
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    defaultValue="Professional hair salon offering cuts, colors, and styling services."
                    className="min-h-[80px] w-full rounded-md border px-3 py-2"
                  />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
