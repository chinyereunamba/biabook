"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  category: string;
  message: string;
  details?: string;
  userId?: string;
  userEmail?: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [levelFilter, categoryFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real app, this would come from API
      const mockLogs: LogEntry[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          level: "info",
          category: "Authentication",
          message: "User logged in successfully",
          details: "User authenticated via Google OAuth",
          userId: "user-123",
          userEmail: "john@example.com",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          level: "success",
          category: "Booking",
          message: "New appointment created",
          details: "Appointment ID: apt-456, Business: Hair Salon",
          userId: "user-456",
          userEmail: "sarah@example.com",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          level: "warning",
          category: "Payment",
          message: "Payment processing delayed",
          details: "Payment gateway response time exceeded 5 seconds",
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          level: "error",
          category: "WhatsApp",
          message: "Failed to send WhatsApp notification",
          details: "Connection timeout after 10 seconds",
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          level: "info",
          category: "Business",
          message: "New business registered",
          details: "Business: Wellness Clinic, Owner: Dr. Smith",
          userId: "user-789",
          userEmail: "dr.smith@example.com",
        },
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "success":
        return "bg-green-500/20 text-green-700 hover:bg-green-500/30";
      case "warning":
        return "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30";
      case "error":
        return "bg-red-500/20 text-red-700 hover:bg-red-500/30";
      default:
        return "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30";
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesCategory =
      categoryFilter === "all" || log.category === categoryFilter;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const categories = Array.from(new Set(logs.map((log) => log.category)));
  const logCounts = {
    total: logs.length,
    info: logs.filter((l) => l.level === "info").length,
    success: logs.filter((l) => l.level === "success").length,
    warning: logs.filter((l) => l.level === "warning").length,
    error: logs.filter((l) => l.level === "error").length,
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading logs...</span>
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
            <h1 className="text-foreground text-2xl font-bold">System Logs</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Monitor system activities and troubleshoot issues
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
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
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Logs
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {logCounts.total}
                  </h3>
                </div>
                <div className="rounded-lg bg-gray-500/10 p-3">
                  <Info className="h-6 w-6 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Info
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {logCounts.info}
                  </h3>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Info className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Success
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {logCounts.success}
                  </h3>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Warnings
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {logCounts.warning}
                  </h3>
                </div>
                <div className="rounded-lg bg-yellow-500/10 p-3">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Errors
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {logCounts.error}
                  </h3>
                </div>
                <div className="rounded-lg bg-red-500/10 p-3">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Logs ({filteredLogs.length})</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="bg-input border-border text-foreground placeholder-muted-foreground w-64 rounded-lg border py-2 pr-4 pl-10 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const { date, time } = formatTimestamp(log.timestamp);
                return (
                  <div
                    key={log.id}
                    className="border-border hover:bg-secondary/50 rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-start space-x-3">
                        <div className="mt-1">{getLevelIcon(log.level)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center space-x-3">
                            <Badge
                              variant="outline"
                              className={getLevelBadgeColor(log.level)}
                            >
                              {log.level.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{log.category}</Badge>
                            <div className="text-muted-foreground flex items-center text-xs">
                              <Calendar className="mr-1 h-3 w-3" />
                              {date}
                              <Clock className="mr-1 ml-3 h-3 w-3" />
                              {time}
                            </div>
                          </div>
                          <p className="text-foreground mb-1 font-medium">
                            {log.message}
                          </p>
                          {log.details && (
                            <p className="text-muted-foreground mb-2 text-sm">
                              {log.details}
                            </p>
                          )}
                          {log.userEmail && (
                            <p className="text-muted-foreground text-xs">
                              User: {log.userEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredLogs.length === 0 && !loading && (
              <div className="py-12 text-center">
                <Info className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  No logs found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
