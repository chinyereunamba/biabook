"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MoreVertical,
  UserPlus,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  isOnboarded: boolean;
  onboardedAt?: string;
  createdAt: string;
  businessCount: number;
  appointmentCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // This would be a real API call
      // For now, we'll simulate with mock data
      const mockUsers: User[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          isOnboarded: true,
          onboardedAt: "2024-01-15T10:00:00Z",
          createdAt: "2024-01-15T09:30:00Z",
          businessCount: 1,
          appointmentCount: 25,
        },
        {
          id: "2",
          name: "Sarah Martinez",
          email: "sarah@example.com",
          isOnboarded: true,
          onboardedAt: "2024-02-03T14:20:00Z",
          createdAt: "2024-02-03T14:00:00Z",
          businessCount: 2,
          appointmentCount: 156,
        },
        {
          id: "3",
          name: "Mike Johnson",
          email: "mike@example.com",
          isOnboarded: false,
          createdAt: "2024-03-10T16:45:00Z",
          businessCount: 0,
          appointmentCount: 0,
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "onboarded" && user.isOnboarded) ||
      (filterStatus === "pending" && !user.isOnboarded);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading users...</span>
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
              User Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage platform users and their accounts
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Users
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {users.length}
                  </h3>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <UserPlus className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Onboarded
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {users.filter((u) => u.isOnboarded).length}
                  </h3>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Business Owners
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {users.filter((u) => u.businessCount > 0).length}
                  </h3>
                </div>
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <Building2 className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Pending
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {users.filter((u) => !u.isOnboarded).length}
                  </h3>
                </div>
                <div className="rounded-lg bg-orange-500/10 p-3">
                  <RefreshCw className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Users</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="all">All Users</option>
                    <option value="onboarded">Onboarded</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="bg-input border-border text-foreground placeholder-muted-foreground w-64 rounded-lg border py-2 pr-4 pl-10 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      User
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Businesses
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Appointments
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Joined
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-border hover:bg-secondary/50 border-b transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              {user.name}
                            </p>
                            <p className="text-muted-foreground flex items-center text-sm">
                              <Mail className="mr-1 h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={user.isOnboarded ? "default" : "secondary"}
                          className={
                            user.isOnboarded
                              ? "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                              : "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30"
                          }
                        >
                          {user.isOnboarded ? "Onboarded" : "Pending"}
                        </Badge>
                      </td>
                      <td className="text-foreground px-4 py-4 font-medium">
                        {user.businessCount}
                      </td>
                      <td className="text-foreground px-4 py-4 font-medium">
                        {user.appointmentCount}
                      </td>
                      <td className="text-muted-foreground px-4 py-4 text-sm">
                        {formatDate(user.createdAt)}
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

            {filteredUsers.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No users found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
