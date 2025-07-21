"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Calendar,
  Home,
  Package,
  Package2,
  Settings,
  ShoppingCart,
  X,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import UserProfile from "./user-profile";

export interface SidebarProps {
  businessName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/dashboard/bookings",
    label: "Bookings",
    icon: ShoppingCart,
    badge: "6",
  },
  {
    href: "/dashboard/services",
    label: "Services",
    icon: Package,
  },
  {
    href: "/dashboard/availability",
    label: "Availability",
    icon: Calendar,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Sidebar({
  businessName = "BiaBook",
  isOpen = false,
  onClose,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-screen w-full flex-col overflow-y-auto bg-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Package2 className="text-primary size-6" />
          <span className="text-lg font-semibold">{businessName}</span>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  // Mobile-first touch-friendly navigation items
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                  "min-h-[44px]", // Touch target
                  isActive
                    ? "bg-primary/10 text-primary-700"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="ml-auto flex size-6 items-center justify-center rounded-full text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Upgrade card */}
      <div className="border-t border-neutral-200 p-6">
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upgrade to Pro</CardTitle>
            <CardDescription className="text-sm">
              Unlock all features and get unlimited access to our support team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" className="w-full">
              Upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* User profile */}
      <div className="border-t border-neutral-200 p-6">
        <UserProfile />
      </div>
    </div>
  );

  // Desktop sidebar
  if (!isOpen && !onClose) {
    return (
      <div
        className={cn(
          "sticky top-0 left-0 h-screen w-full border-r border-neutral-200",
          className,
        )}
      >
        {sidebarContent}
      </div>
    );
  }

  // Mobile sidebar overlay
  if (isOpen && onClose) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Sidebar */}
        <div
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-80 transform transition-transform duration-300 ease-in-out md:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full",
            className,
          )}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  return null;
}
