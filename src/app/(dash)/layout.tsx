import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-background min-h-screen">
     
      {children}
    </main>
  );
}
