import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { LazyAnalyticsDashboard } from "@/components/application/analytics/lazy";
import { DashboardHeader } from "@/components/application/dashboard/dashboard-header";
import { DashboardShell } from "@/components/application/dashboard/dashboard-shell";

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
    <DashboardShell>
      <DashboardHeader
        heading="Analytics"
        subheading="View your business performance metrics and insights"
        showExport={true}
      />
      <div className="grid gap-8">
        <LazyAnalyticsDashboard />
      </div>
    </DashboardShell>
  );
}
