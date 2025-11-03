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

  useEffect(() => {
    if (status === "loading") return;

    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    // Redirect admin users to admin dashboard
    if (session?.user?.role === "admin") {
      router.replace("/admin");
      return;
    }

    // Redirect to onboarding if user needs onboarding
    if (session?.user && session.user.needsOnboarding) {
      router.replace("/onboarding/welcome");
      return;
    }
  }, [session, status, router]);

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
    { name: "analysis", icon: Settings, link: "/dashboard/analysis" },
    { name: "services", icon: ToolCase, link: "/dashboard/services" },
    { name: "bookings", icon: Book, link: "/dashboard/bookings" },
  ];

  return <LayoutComponent navLinks={navLinks}>{children}</LayoutComponent>;
}
