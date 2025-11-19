"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  type Icon,
  type IconProps,
} from "@tabler/icons-react";
import {
  Book,
  LayoutDashboard,
  MapPin,
  Settings,
  ToolCase,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export type NavLink = {
  title: string;
  url: string;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
};

export type NavProps = {
  user: {};
  navMain: NavLink[];
  navSecondary: NavLink[];
};

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
    router.replace("/admin");
    return null;
  }

  const data: NavProps = {
    user: {
      ...session.user,
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
      {
        title: "Services",
        url: "/dashboard/services",
        icon: IconListDetails,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: IconChartBar,
      },
      {
        title: "appointments",
        url: "/dashboard/bookings",
        icon: IconFolder,
      },
      {
        title: "Locations",
        url: "/dashboard/locations",
        icon: IconUsers,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: IconSettings,
      },
      {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
      },
      {
        title: "Search",
        url: "#",
        icon: IconSearch,
      },
    ],
  };

  if (!session.user?.isOnboarded) {
    router.replace("/onboarding/welcome");
    return;
  } else
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 20)",
          } as React.CSSProperties
        }
      >
        <AppSidebar data={data} variant="inset" />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    );
}
