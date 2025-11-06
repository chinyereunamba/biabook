"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LayoutComponent from "@/components/admin/layout";
import { Book, LayoutDashboard, Settings, ToolCase } from "lucide-react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (status === "unauthenticated" || !session) {
    return null;
  }

  // Don't render if admin (will redirect to admin dashboard)
  if (session.user?.role === "admin") {
    return null;
  }

  const navLinks = [
    { name: "dashboard", icon: LayoutDashboard, link: "/dashboard" },
    { name: "analysis", icon: Settings, link: "/dashboard/analytics" },
    { name: "services", icon: ToolCase, link: "/dashboard/services" },
    { name: "bookings", icon: Book, link: "/dashboard/bookings" },
  ];
  if (!session.user?.isOnboarded) {
    router.replace("/onboarding/welcome");
    return;
  } else
    return <LayoutComponent navLinks={navLinks}>{children}</LayoutComponent>;
}
