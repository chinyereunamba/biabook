"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MoreVertical,
  Building2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Business {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  categoryName: string;
  location?: string;
  phone?: string;
  email?: string;
  totalAppointments: number;
  totalRevenue: number;
  createdAt: string;
}

interface BusinessSummary {
  total: number;
  active: number;
  inactive: number;
  totalRevenue: number;
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [summary, setSummary] = useState<BusinessSummary>({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchBusinesses();
  }, [searchTerm, sortBy, sortOrder]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: "50",
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/businesses?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);

        // Calculate summary from the data
        const total = data.businesses?.length || 0;
        const totalRevenue =
          data.businesses?.reduce(
            (sum: number, b: Business) => sum + (b.totalRevenue || 0),
            0,
          ) || 0;

        setSummary({
          total,
          active: total, // For now, assume all are active
          inactive: 0,
          totalRevenue,
        });
      } else {
        console.error("Failed to fetch businesses:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredBusinesses = businesses.filter(
    (business) =>
      business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading businesses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen w-full">
      {/* Header */}
      <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              Business Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage businesses and their performance on the platform
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={fetchBusinesses}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Businesses
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {summary.total}
                  </h3>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Active Businesses
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {summary.active}
                  </h3>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Revenue
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {formatCurrency(summary.totalRevenue)}
                  </h3>
                </div>
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Avg Revenue
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {summary.total > 0
                      ? formatCurrency(summary.totalRevenue / summary.total)
                      : "$0.00"}
                  </h3>
                </div>
                <div className="rounded-lg bg-orange-500/10 p-3">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Businesses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Businesses ({filteredBusinesses.length})</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="createdAt">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="appointments">Sort by Appointments</option>
                    <option value="revenue">Sort by Revenue</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    className="bg-input border-border text-foreground placeholder-muted-foreground w-64 rounded-lg border py-2 pr-4 pl-10 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  {filteredBusinesses.map((business) => (
                    <tr
                      key={business.id}
                      className="border-border hover:bg-secondary/50 border-b transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                            {business.name?.charAt(0)?.toUpperCase() || "B"}
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              {business.name}
                            </p>
                            <div className="text-muted-foreground mt-1 flex items-center space-x-4 text-xs">
                              {business.location && (
                                <span className="flex items-center">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {business.location}
                                </span>
                              )}
                              {business.phone && (
                                <span className="flex items-center">
                                  <Phone className="mr-1 h-3 w-3" />
                                  {business.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-foreground font-medium">
                            {business.ownerName || "Unknown"}
                          </p>
                          {business.ownerEmail && (
                            <p className="text-muted-foreground flex items-center text-sm">
                              <Mail className="mr-1 h-3 w-3" />
                              {business.ownerEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">
                          {business.categoryName || "Uncategorized"}
                        </Badge>
                      </td>
                      <td className="text-foreground px-4 py-4 font-medium">
                        {business.totalAppointments || 0}
                      </td>
                      <td className="text-foreground px-4 py-4 font-semibold">
                        {formatCurrency(business.totalRevenue || 0)}
                      </td>
                      <td className="text-muted-foreground px-4 py-4 text-sm">
                        {formatDate(business.createdAt)}
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
            </div>

            {filteredBusinesses.length === 0 && !loading && (
              <div className="py-12 text-center">
                <Building2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  No businesses found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
