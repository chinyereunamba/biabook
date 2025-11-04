"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Building2,
  Mail,
  MoreVertical,
  Search,
  MapPin,
  Phone,
} from "lucide-react";
import type { Business } from "@/types/admin";

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function BusinessTable({
  businesses,
}: {
  businesses: Business[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ✅ Read initial states from the URL
  const searchTerm = searchParams.get("search") || "";
  const sortBy =
    (searchParams.get("sortBy") as
      | "createdAt"
      | "name"
      | "appointments"
      | "revenue") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  // ✅ Update URL when a param changes
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);

    router.replace(`${pathname}?${params.toString()}`);
  };

  // 🔍 Filtered list
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(
      (b) =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [businesses, searchTerm]);

  // 🔽 Sorted list
  const sortedBusinesses = useMemo(() => {
    const sorted = [...filteredBusinesses].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case "name":
          aVal = a.name || "";
          bVal = b.name || "";
          break;
        case "appointments":
          aVal = a.totalAppointments || 0;
          bVal = b.totalAppointments || 0;
          break;
        case "revenue":
          aVal = a.totalRevenue || 0;
          bVal = b.totalRevenue || 0;
          break;
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredBusinesses, sortBy, sortOrder]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>All Businesses ({sortedBusinesses.length})</span>

          <div className="flex items-center space-x-4">
            {/* Sort controls */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => updateParam("sortBy", e.target.value)}
                className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="appointments">Sort by Appointments</option>
                <option value="revenue">Sort by Revenue</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => updateParam("sortOrder", e.target.value)}
                className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search businesses..."
                className="bg-input border-border text-foreground placeholder-muted-foreground w-64 rounded-lg border py-2 pr-4 pl-10 text-sm"
                defaultValue={searchTerm}
                onChange={(e) => updateParam("search", e.target.value)}
              />
            </div>
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
                  Created
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBusinesses.map((b) => (
                <tr
                  key={b.id}
                  className="border-border hover:bg-secondary/50 border-b transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                        {b.name?.charAt(0)?.toUpperCase() || "B"}
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{b.name}</p>
                        <div className="text-muted-foreground mt-1 flex items-center space-x-4 text-xs">
                          {b.location && (
                            <span className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {b.location}
                            </span>
                          )}
                          {b.phone && (
                            <span className="flex items-center">
                              <Phone className="mr-1 h-3 w-3" />
                              {b.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-foreground font-medium">
                        {b.ownerName || "Unknown"}
                      </p>
                      {b.ownerEmail && (
                        <p className="text-muted-foreground flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {b.ownerEmail}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">
                      {b.categoryName || "Uncategorized"}
                    </Badge>
                  </td>
                  <td className="text-foreground px-4 py-4 font-medium">
                    {b.totalAppointments || 0}
                  </td>
                  <td className="text-foreground px-4 py-4 font-semibold">
                    {formatCurrency(b.totalRevenue || 0)}
                  </td>
                  <td className="text-muted-foreground px-4 py-4 text-sm">
                    {formatDate(b.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
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
          a
        </div>

        {sortedBusinesses.length === 0 && (
          <div className="py-12 text-center">
            <Building2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              No businesses found matching your criteria.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
