"use client";
import React from "react";
import DashboardShell from "@/components/dashboard-shell";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (session?.user && session?.user.needsOnboarding) {
    router.replace("/onboarding/welcome");
  }

  // if (status == "unauthenticated") {
  //   router.replace("/login");
  // }

  return <DashboardShell>{children}</DashboardShell>;
}
