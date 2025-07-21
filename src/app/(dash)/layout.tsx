import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-background flex min-h-screen">
      {/* Desktop sidebar - fixed width */}
      <div className="hidden md:block md:w-64 md:flex-shrink-0">
        <Sidebar />
      </div>
      {/* Main content area */}
      <div className="flex w-full flex-col">
        <DashboardHeader />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </main>
  );
}
