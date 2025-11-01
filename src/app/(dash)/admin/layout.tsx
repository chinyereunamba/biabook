"use client";

import LayoutComponent from "@/components/admin/layout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
  Building2,
  LayoutDashboard,
  Settings,
  Users,
  TrendingUp,
  FileText,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.replace("/login");
      return;
    }

    // For now, allow all authenticated users to access admin
    // In production, you'd check: session.user.role !== "admin"
    // if (session.user && session.user.role !== "admin") {
    //   router.replace("/dashboard");
    // }
  }, [session, status, router]);

  const navLinks = [
    { name: "dashboard", icon: LayoutDashboard, link: "/admin" },
    { name: "businesses", icon: Building2, link: "/admin/businesses" },
    { name: "users", icon: Users, link: "/admin/users" },
    { name: "analysis", icon: TrendingUp, link: "/admin/analysis" },
    { name: "logs", icon: FileText, link: "/admin/logs" },
    { name: "settings", icon: Settings, link: "/admin/settings" },
  ];

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return <LayoutComponent navLinks={navLinks}>{children}</LayoutComponent>;
}
