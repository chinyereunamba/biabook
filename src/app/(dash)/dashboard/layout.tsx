import React from "react";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { businessRepository } from "@/server/repositories/business-repository";

export type NavProps = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Don't render if not authenticated (will redirect)
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Admin routes protection
  if (session?.user.role === "admin") {
    redirect("/admin");
  }

  // Handle onboarding state
  // Fallback to DB check if session says not onboarded (prevents redirect loop if session is stale)
  if (!session?.user.isOnboarded) {
    const businesses = await businessRepository.findByOwnerId(session.user.id!);
    if (businesses.length === 0) {
      redirect("/onboarding/welcome");
    }
  }

  const data: NavProps = {
    user: {
      name: session.user.name || "User",
      email: session.user.email || "",
      avatar: session.user.image || "/avatars/shadcn.jpg",
    },
  };

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
