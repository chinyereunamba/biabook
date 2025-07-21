"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Package2 } from "lucide-react";
import UserProfile from "./user-profile";
import Sidebar from "./sidebar";
import Link from "next/link";

export default function DashboardHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <Package2 className="text-primary h-6 w-6" />
          <span className="text-lg font-semibold">BookMe</span>
        </Link>
      </div>

      <div className="md:hidden flex items-center gap-4">
        <UserProfile />
      </div>

      {/* Mobile sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="md:hidden"
      />
    </header>
  );
}
