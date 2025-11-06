import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Building2,
  DollarSign,
  Activity,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AnalyticsCharts from "@/components/admin/analytics-charts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics & Insights | BiaBook Admin",
  description: "Deep dive into platform performance and trends",
};

export default async function AdminAnalysisPage() {
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
            <h1 className="text-foreground text-2xl font-bold">
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Deep dive into platform performance and trends
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading analytics...</span>
              </div>
            </div>
          }
        >
          <AnalyticsCharts />
        </Suspense>
      </div>
    </div>
  );
}
