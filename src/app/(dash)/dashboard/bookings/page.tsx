"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingOverlay } from "@/components/ui/loading-states";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { DataTable } from "@/components/data-table";

export default function BookingsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  interface Booking {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    serviceName: string;
    servicePrice: number;
  }

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Load the current user's business
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const response = await fetch("/api/me/business");
        if (!response.ok) {
          throw new Error("Failed to fetch business");
        }

        const data: { business?: { id: string } } = await response.json();
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

    void loadBusiness();
  }, []);

  // Load bookings when businessId is available
  useEffect(() => {
    if (!businessId) return;

    const loadBookings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: pagination.limit.toString(),
          offset: pagination.offset.toString(),
        });

        if (statusFilter) {
          params.append("status", statusFilter);
        }

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        const response = await fetch(
          `/api/businesses/${businessId}/appointments?${params.toString()}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data.appointments ?? []);
        setPagination({
          total: data.pagination?.total ?? 0,
          limit: data.pagination?.limit ?? 10,
          offset: data.pagination?.offset ?? 0,
        });
      } catch (error) {
        console.error("Failed to load bookings:", error);
        toast.error("Failed to load bookings");

        // Set default data for demo purposes if API fails
        setBookings([
          {
            id: "booking-1",
            customerName: "Liam Johnson",
            customerEmail: "liam@example.com",
            customerPhone: "555-123-4567",
            appointmentDate: "2025-07-20",
            startTime: "10:00",
            endTime: "11:00",
            status: "confirmed",
            serviceName: "Haircut",
            servicePrice: 25000,
          },
          {
            id: "booking-2",
            customerName: "Olivia Smith",
            customerEmail: "olivia@example.com",
            customerPhone: "555-987-6543",
            appointmentDate: "2025-07-21",
            startTime: "14:00",
            endTime: "15:00",
            status: "pending",
            serviceName: "Hair Coloring",
            servicePrice: 75000,
          },
          {
            id: "booking-3",
            customerName: "Noah Williams",
            customerEmail: "noah@example.com",
            customerPhone: "555-456-7890",
            appointmentDate: "2025-07-19",
            startTime: "09:00",
            endTime: "10:00",
            status: "cancelled",
            serviceName: "Beard Trim",
            servicePrice: 15000,
          },
        ]);

        setPagination({
          total: 3,
          limit: 10,
          offset: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, [
    businessId,
    pagination.limit,
    pagination.offset,
    statusFilter,
    searchTerm,
  ]);

  // Format price from cents to dollars
  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  // Format time from 24h to 12h
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours ?? "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes ?? "00"} ${ampm}`;
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit,
      });
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination({
        ...pagination,
        offset: Math.max(0, pagination.offset - pagination.limit),
      });
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset pagination when searching
    setPagination({
      ...pagination,
      offset: 0,
    });
  };

  // Handle status filter
  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    // Reset pagination when filtering
    setPagination({
      ...pagination,
      offset: 0,
    });
  };

  // if (loading && bookings.length === 0) {
  //   return <LoadingOverlay message="Loading bookings..." transparent={false} />;
  // }

  return (
    <div className="bg-background w-full rounded-xl">
      <SiteHeader
        header="appointments"
        desc="Manage your customer appointments"
      />
      <div className="px-6 py-8 space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-2 sm:flex-row">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="w-full pl-8 md:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" variant="ghost" className="ml-2">
                Search
              </Button>
            </form>

            <div className="flex gap-2">
              <Button
                variant={statusFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(null)}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "confirmed" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("confirmed")}
              >
                Confirmed
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "cancelled" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("cancelled")}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </div>

        {/* <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">
                          {booking.customerName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {booking.customerEmail}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {booking.customerPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{formatDate(booking.appointmentDate)}</div>
                        <div className="text-muted-foreground text-xs">
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </div>
                      </TableCell>
                      <TableCell>{booking.serviceName}</TableCell>
                      <TableCell>
                        <Badge
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
                      <TableCell className="text-right">
                        ${formatPrice(booking.servicePrice)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card> */}
        <DataTable data={bookings} />

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {pagination.offset + 1} to{" "}
              {Math.min(pagination.offset + pagination.limit, pagination.total)}{" "}
              of {pagination.total} bookings
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={pagination.offset === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={
                  pagination.offset + pagination.limit >= pagination.total
                }
              >
                <span className="mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
