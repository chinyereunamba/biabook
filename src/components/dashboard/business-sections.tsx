"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Camera,
  Save,
  Eye,
  EyeOff,
  Star,
  Award,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Overview Section - Today's business stats
export function OverviewSection() {
  const todayStats = {
    bookings: 12,
    revenue: 850,
    newCustomers: 3,
    completedServices: 8,
    upcomingBookings: 4,
  };

  const recentBookings = [
    {
      id: "1",
      customerName: "Sarah Johnson",
      service: "Hair Cut & Style",
      time: "10:00 AM",
      status: "confirmed",
      price: 85,
    },
    {
      id: "2",
      customerName: "Mike Chen",
      service: "Beard Trim",
      time: "11:30 AM",
      status: "in-progress",
      price: 35,
    },
    {
      id: "3",
      customerName: "Emma Davis",
      service: "Color Treatment",
      time: "2:00 PM",
      status: "upcoming",
      price: 120,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "upcoming":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Upcoming</Badge>
        );
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Today's Bookings
                </p>
                <p className="text-2xl font-bold">{todayStats.bookings}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <p className="mt-1 text-xs text-green-600">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Revenue
                </p>
                <p className="text-2xl font-bold">${todayStats.revenue}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <p className="mt-1 text-xs text-green-600">+15% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  New Customers
                </p>
                <p className="text-2xl font-bold">{todayStats.newCustomers}</p>
              </div>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              First-time visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Completed
                </p>
                <p className="text-2xl font-bold">
                  {todayStats.completedServices}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Services finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Upcoming
                </p>
                <p className="text-2xl font-bold">
                  {todayStats.upcomingBookings}
                </p>
              </div>
              <Clock className="h-6 w-6 text-indigo-500" />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Later today</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today's Schedule</span>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Booking
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-muted-foreground text-sm font-medium">
                    {booking.time}
                  </div>
                  <div>
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="text-muted-foreground text-sm">
                      {booking.service}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold">${booking.price}</span>
                  {getStatusBadge(booking.status)}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Bookings Management Section
export function BookingsSection() {
  const [bookings] = useState([
    {
      id: "1",
      customerName: "Sarah Johnson",
      customerPhone: "+1 (555) 123-4567",
      service: "Hair Cut & Style",
      date: "2024-11-01",
      time: "10:00 AM",
      duration: 60,
      status: "confirmed",
      price: 85,
      notes: "Regular customer, prefers layers",
    },
    {
      id: "2",
      customerName: "Mike Chen",
      customerPhone: "+1 (555) 987-6543",
      service: "Beard Trim",
      date: "2024-11-01",
      time: "11:30 AM",
      duration: 30,
      status: "pending",
      price: 35,
      notes: "",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input placeholder="Search bookings..." className="w-64 pl-10" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Service</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/50 border-b">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-muted-foreground text-sm">
                          {booking.customerPhone}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{booking.service}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p>{booking.date}</p>
                        <p className="text-muted-foreground text-sm">
                          {booking.time}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{booking.duration} min</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ${booking.price}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Customers Section
export function CustomersSection() {
  const [customers] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 123-4567",
      totalBookings: 12,
      lastVisit: "2024-10-28",
      totalSpent: 1240,
      favoriteService: "Hair Cut & Style",
      notes: "Prefers morning appointments",
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@example.com",
      phone: "+1 (555) 987-6543",
      totalBookings: 8,
      lastVisit: "2024-10-25",
      totalSpent: 680,
      favoriteService: "Beard Trim",
      notes: "Regular monthly visits",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input placeholder="Search customers..." className="w-64 pl-10" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Total Bookings
                    </p>
                    <p className="font-semibold">{customer.totalBookings}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Total Spent</p>
                    <p className="font-semibold">${customer.totalSpent}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Last Visit</p>
                    <p className="text-sm">{customer.lastVisit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Favorite Service
                    </p>
                    <p className="text-sm">{customer.favoriteService}</p>
                  </div>
                </div>
                {customer.notes && (
                  <div className="border-t pt-3">
                    <p className="text-muted-foreground text-xs">Notes</p>
                    <p className="text-sm">{customer.notes}</p>
                  </div>
                )}
                <div className="flex items-center space-x-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
// Services Section
export function ServicesSection() {
  const [services] = useState([
    {
      id: "1",
      name: "Hair Cut & Style",
      description: "Professional haircut with styling",
      duration: 60,
      price: 85,
      category: "Hair Services",
      active: true,
      bookingsThisMonth: 45,
    },
    {
      id: "2",
      name: "Color Treatment",
      description: "Full hair coloring service",
      duration: 120,
      price: 120,
      category: "Hair Services",
      active: true,
      bookingsThisMonth: 28,
    },
    {
      id: "3",
      name: "Beard Trim",
      description: "Professional beard trimming and shaping",
      duration: 30,
      price: 35,
      category: "Grooming",
      active: true,
      bookingsThisMonth: 32,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input placeholder="Search services..." className="w-64 pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="hair">Hair Services</SelectItem>
              <SelectItem value="grooming">Grooming</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card
            key={service.id}
            className={!service.active ? "opacity-60" : ""}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {service.active ? (
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">
                      Inactive
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                {service.description}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Duration:</span>
                  <span className="text-sm font-medium">
                    {service.duration} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Price:</span>
                  <span className="text-sm font-bold">${service.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Category:</span>
                  <span className="text-sm">{service.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">This Month:</span>
                  <span className="text-sm font-medium">
                    {service.bookingsThisMonth} bookings
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Availability Section
export function AvailabilitySection() {
  const [workingHours, setWorkingHours] = useState({
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: true, start: "09:00", end: "17:00" },
    saturday: { enabled: true, start: "10:00", end: "16:00" },
    sunday: { enabled: false, start: "10:00", end: "16:00" },
  });

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <p className="text-muted-foreground text-sm">
            Set your available days and hours to prevent double booking
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.map((day) => (
              <div
                key={day.key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={
                      workingHours[day.key as keyof typeof workingHours].enabled
                    }
                    onCheckedChange={(checked) =>
                      setWorkingHours((prev) => ({
                        ...prev,
                        [day.key]: {
                          ...prev[day.key as keyof typeof workingHours],
                          enabled: checked,
                        },
                      }))
                    }
                  />
                  <span className="w-24 font-medium">{day.label}</span>
                </div>
                {workingHours[day.key as keyof typeof workingHours].enabled && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={
                        workingHours[day.key as keyof typeof workingHours].start
                      }
                      onChange={(e) =>
                        setWorkingHours((prev) => ({
                          ...prev,
                          [day.key]: {
                            ...prev[day.key as keyof typeof workingHours],
                            start: e.target.value,
                          },
                        }))
                      }
                      className="w-32"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={
                        workingHours[day.key as keyof typeof workingHours].end
                      }
                      onChange={(e) =>
                        setWorkingHours((prev) => ({
                          ...prev,
                          [day.key]: {
                            ...prev[day.key as keyof typeof workingHours],
                            end: e.target.value,
                          },
                        }))
                      }
                      className="w-32"
                    />
                  </div>
                )}
                {!workingHours[day.key as keyof typeof workingHours]
                  .enabled && (
                  <span className="text-muted-foreground">Closed</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Break Times & Holidays</CardTitle>
          <p className="text-muted-foreground text-sm">
            Set lunch breaks and holiday closures
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Daily Break Time</Label>
              <div className="mt-2 flex items-center space-x-2">
                <Input type="time" defaultValue="12:00" className="w-32" />
                <span>to</span>
                <Input type="time" defaultValue="13:00" className="w-32" />
              </div>
            </div>
            <div>
              <Label>Holiday Dates</Label>
              <div className="mt-2 flex items-center space-x-2">
                <Input type="date" className="w-40" />
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Holiday
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// Staff Section
export function StaffSection() {
  const [staff] = useState([
    {
      id: "1",
      name: "John Smith",
      role: "Senior Stylist",
      email: "john@salon.com",
      phone: "+1 (555) 111-2222",
      services: ["Hair Cut & Style", "Color Treatment"],
      schedule: "Mon-Fri 9AM-5PM",
      active: true,
    },
    {
      id: "2",
      name: "Maria Garcia",
      role: "Colorist",
      email: "maria@salon.com",
      phone: "+1 (555) 333-4444",
      services: ["Color Treatment", "Highlights"],
      schedule: "Tue-Sat 10AM-6PM",
      active: true,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Staff Management</h3>
          <p className="text-muted-foreground text-sm">
            Add staff, assign them to services, set schedules
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {member.active ? (
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">
                      Inactive
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{member.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{member.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{member.schedule}</span>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Assigned Services
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {member.services.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Notifications Section
export function NotificationsSection() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <p className="text-muted-foreground text-sm">
            Configure email or WhatsApp confirmations for your customers
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-muted-foreground text-sm">
                    Send booking confirmations via email
                  </p>
                </div>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">WhatsApp Notifications</p>
                  <p className="text-muted-foreground text-sm">
                    Send booking confirmations via WhatsApp
                  </p>
                </div>
              </div>
              <Switch
                checked={whatsappEnabled}
                onCheckedChange={setWhatsappEnabled}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-muted-foreground text-sm">
                    Send booking confirmations via SMS
                  </p>
                </div>
              </div>
              <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
          <p className="text-muted-foreground text-sm">
            Customize your notification messages
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Booking Confirmation</Label>
              <Textarea
                className="mt-2"
                placeholder="Hi {customer_name}, your appointment for {service} on {date} at {time} has been confirmed. See you soon!"
                rows={3}
              />
            </div>
            <div>
              <Label>Booking Reminder (24h before)</Label>
              <Textarea
                className="mt-2"
                placeholder="Hi {customer_name}, this is a reminder about your {service} appointment tomorrow at {time}. Looking forward to seeing you!"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Templates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// Settings Section
export function SettingsSection() {
  const [businessInfo, setBusinessInfo] = useState({
    name: "Bella's Hair Salon",
    description: "Professional hair styling and beauty services",
    phone: "+1 (555) 123-4567",
    email: "info@bellasalon.com",
    address: "123 Main Street, City, State 12345",
    website: "www.bellasalon.com",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <p className="text-muted-foreground text-sm">
            Manage your business details and contact information
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={businessInfo.name}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={businessInfo.phone}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  value={businessInfo.email}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={businessInfo.website}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>Business Description</Label>
              <Textarea
                value={businessInfo.description}
                onChange={(e) =>
                  setBusinessInfo((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="mt-2"
                rows={3}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={businessInfo.address}
                onChange={(e) =>
                  setBusinessInfo((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="mt-2"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
          <p className="text-muted-foreground text-sm">
            Upload your business logo for branding
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-lg">
              <Camera className="text-muted-foreground h-8 w-8" />
            </div>
            <div>
              <Button variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
              <p className="text-muted-foreground mt-2 text-xs">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// Reports Section
export function ReportsSection() {
  const reportData = {
    totalBookings: 156,
    completedBookings: 142,
    cancelledBookings: 14,
    totalRevenue: 12450,
    averageBookingValue: 87.68,
    topService: "Hair Cut & Style",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold">{reportData.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <p className="mt-2 text-sm text-green-600">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Completed
                </p>
                <p className="text-3xl font-bold">
                  {reportData.completedBookings}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {(
                (reportData.completedBookings / reportData.totalBookings) *
                100
              ).toFixed(1)}
              % completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Cancelled
                </p>
                <p className="text-3xl font-bold">
                  {reportData.cancelledBookings}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {(
                (reportData.cancelledBookings / reportData.totalBookings) *
                100
              ).toFixed(1)}
              % cancellation rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">${reportData.totalRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <p className="mt-2 text-sm text-green-600">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Avg. Booking Value
                </p>
                <p className="text-3xl font-bold">
                  ${reportData.averageBookingValue}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Per appointment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Top Service
                </p>
                <p className="text-xl font-bold">{reportData.topService}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">Most popular</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <p className="text-muted-foreground text-sm">
            Download detailed reports for your records
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="mb-2 h-6 w-6" />
              <span>Booking Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="mb-2 h-6 w-6" />
              <span>Revenue Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="mb-2 h-6 w-6" />
              <span>Customer Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
