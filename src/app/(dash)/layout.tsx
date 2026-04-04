import OnboardingGuard from "@/components/auth/onboarding-guard";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard requireOnboarded={true}>
      <div className="flex min-h-screen bg-neutral-50/50">
        <Sidebar className="hidden md:block w-72" />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </OnboardingGuard>
  );
}
