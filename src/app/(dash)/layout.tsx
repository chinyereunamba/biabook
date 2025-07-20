import Sidebar from "@/components/sidebar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-background flex min-h-screen">
      <div className="max-w-xs w-full min-h-screen">
        <Sidebar />
      </div>
      <div className="w-full">{children}</div>
    </main>
  );
}
