import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { LazyAnalyticsDashboard } from "@/components/application/analytics/lazy";
import { DashboardHeader } from "@/components/application/dashboard/dashboard-header";
import { DashboardShell } from "@/components/application/dashboard/dashboard-shell";
import { SiteHeader } from "@/components/site-header";
import * as React from "react";

export const metadata: Metadata = {
  title: "Analytics | BiaBook",
  description: "View your business analytics and insights",
};

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="bg-background w-full rounded-xl">
      <SiteHeader
        header="Analytics"
        desc="View your business performance metrics and insights"
      />
      <div className="grid gap-8 px-6 py-8">
        <LazyAnalyticsDashboard />
      </div>
    </div>
  );
}
