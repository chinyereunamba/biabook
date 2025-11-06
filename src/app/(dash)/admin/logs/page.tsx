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
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LogsTable from "@/components/admin/logs-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Logs | BiaBook Admin",
  description: "Monitor system activities and troubleshoot issues",
};

export default async function AdminLogsPage() {
  // Check authentication and admin role
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
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
        </div>
      </div>

      <div className="px-6 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading logs...</span>
              </div>
            </div>
          }
        >
          <LogsTable />
        </Suspense>
      </div>
    </div>
  );
}
