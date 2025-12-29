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
      <main className="bg-background flex min-h-screen">{children}</main>
    </OnboardingGuard>
  );
}
