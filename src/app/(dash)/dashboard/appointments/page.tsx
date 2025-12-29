"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

import { useBusiness } from "@/hooks/use-business";
import { fetchAppointments } from "@/lib/api/appointments";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { DataTable } from "./data-table";
import { bookingColumns } from "./columns";
import type { Booking } from "@/types/appointment";
import { Spinner } from "@/components/ui/loading-states";

export const AppointmentsComponent = ({
  recent,
  week,
}: {
  recent?: number;
  week?: boolean;
}) => {
  const businessQuery = useBusiness();
  const [appointments, setAppointments] = useState<{
    appointments: Booking[];
    pagination: any[];
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const businessId = businessQuery.data?.business?.id;
    if (!businessId) return;

    setLoading(true);
    fetchAppointments({ recent, week, businessId })
      .then((data) => setAppointments(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [businessQuery.data?.business?.id, recent, week]);

  if (loading) return <div><Spinner /></div>;
  if (error) return <div>Failed to load appointments: {error.message}</div>;

  return (
    <DataTable
      data={appointments?.appointments ?? []}
      columns={bookingColumns}
    />
  );
};

export default function BookingsPage() {
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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

  return (
    <div className="bg-background w-full rounded-xl">
      <SiteHeader
        header="appointments"
        desc="Manage your customer appointments"
      />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-6 sm:flex-row">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="w-full pl-8 md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
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
        <AppointmentsComponent />
      </div>
    </div>
  );
}
