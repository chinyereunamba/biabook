"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  RefreshCw,
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

interface LogStats {
  total: number;
  error: number;
  warning: number;
  success: number;
  info: number;
}

export default function LogsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logStats, setLogStats] = useState<LogStats>({
    total: 0,
    error: 0,
    warning: 0,
    success: 0,
    info: 0,
  });

  // Read initial states from the URL
  const searchTerm = searchParams.get("search") || "";
  const filterLevel = searchParams.get("level") || "all";
  const filterCategory = searchParams.get("category") || "all";

  // Update URL when a param changes
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    fetchLogs();
  }, [filterLevel, filterCategory, searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filterLevel !== "all" && { level: filterLevel }),
        ...(filterCategory !== "all" && { category: filterCategory }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setLogStats(data.stats);
      } else {
        console.error("Failed to fetch logs:", response.statusText);
        setLogs([]);
        setLogStats({ total: 0, error: 0, warning: 0, success: 0, info: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
      setLogStats({ total: 0, error: 0, warning: 0, success: 0, info: 0 });
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

  const categories = Array.from(new Set(logs.map((log) => log.category)));

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "Level", "Category", "Message", "Details", "User Email"],
      ...logs.map((log) => [
        log.timestamp,
        log.level,
        log.category,
        log.message,
        log.details || "",
        log.userEmail || "",
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading logs...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-5">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Logs
                </p>
                <h3 className="text-foreground mt-2 text-2xl font-bold">
                  {logStats.total}
                </h3>
              </div>
              <div className="rounded-lg bg-gray-500/10 p-3">
                <Info className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Info
                </p>
                <h3 className="text-foreground mt-2 text-2xl font-bold">
                  {logStats.info}
                </h3>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Info className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Success
                </p>
                <h3 className="text-foreground mt-2 text-2xl font-bold">
                  {logStats.success}
                </h3>
              </div>
              <div className="rounded-lg bg-green-500/10 p-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Warnings
                </p>
                <h3 className="text-foreground mt-2 text-2xl font-bold">
                  {logStats.warning}
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
                  {logStats.error}
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
            <span>System Logs ({logs.length})</span>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={fetchLogs}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <select
                value={filterLevel}
                onChange={(e) => updateParam("level", e.target.value)}
                className="bg-input border-border text-foreground rounded-lg border px-3 py-2 text-sm"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => updateParam("category", e.target.value)}
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
                onChange={(e) => updateParam("search", e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => {
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

          {logs.length === 0 && !loading && (
            <div className="py-12 text-center">
              <Info className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                No logs found
              </h3>
              <p className="text-muted-foreground">
                No logs match your current filters. Try adjusting your search
                criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
