"use client";

import React from "react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="space-y-6">{children}</div>
    </div>
  );
}
