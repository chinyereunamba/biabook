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
      {children}
    </main>
  );
}
