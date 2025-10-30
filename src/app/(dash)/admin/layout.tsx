"use client";
import LayoutComponent from "@/components/admin/layout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { CreditCard, LayoutDashboard, Settings, Users } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (session?.user && session?.user?.role !== "admin") {
    router.replace("/dashboard");
  }

  const navLinks = [
    { name: "dashboard", icon: LayoutDashboard, link: "/admin" },
    { name: "analysis", icon: Settings, link: "/admin/analysis" },
    { name: "users", icon: Users, link: "/admin/users" },
    { name: "payments", icon: CreditCard, link: "/admin/payments" },
  ];

  //   if (status == "authenticated") {
  return <LayoutComponent navLinks={navLinks}>{children}</LayoutComponent>;
  //   }

  //   return router.replace("/login");
}
