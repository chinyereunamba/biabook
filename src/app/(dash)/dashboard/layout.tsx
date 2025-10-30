"use client";
import React from "react";
import DashboardShell from "@/components/dashboard-shell";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LayoutComponent from "@/components/admin/layout";
import {
  Book,
  CreditCard,
  LayoutDashboard,
  Settings,
  ToolCase,
  Users,
} from "lucide-react";

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
  //}
const navLinks = [
  { name: "dashboard", icon: LayoutDashboard, link: "/dashboard" },
  { name: "analysis", icon: Settings, link: "/dashboard/analysis" },
  { name: "services", icon: ToolCase, link: "/dashboard/services" },
  { name: "Booked", icon: Book, link: "/dashboard/bookings" },
];

  return <LayoutComponent navLinks={navLinks}>{children}</LayoutComponent>;
}
