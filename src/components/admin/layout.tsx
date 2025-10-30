"use client";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  type LucideProps,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import style from "@/styles/admin-dashboard.module.css";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function LayoutComponent({
  children,
  navLinks,
}: {
  children: React.ReactNode;
  navLinks: {
    name: string;
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    link: string;
  }[];
}) {
  const [showProfile, setShowProfile] = useState(false);
  const [toggleMenu, setToggleMenu] = useState(false);

  const menuClass = toggleMenu ? "collapse transition-opacity" : "";

  return (
    <main className="flex h-screen w-full transition-all">
      <div
        className={cn(
          "hidden h-screen border border-r transition-all md:block",
          toggleMenu ? "w-20" : "w-64",
        )}
      >
        <div className="flex h-screen flex-col justify-between bg-white px-2.5 py-6">
          <div className="space-y-8">
            <header
              className={cn(
                "flex w-full items-center justify-between",
                toggleMenu && "flex-col-reverse items-center justify-center",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  toggleMenu && "mt-4 justify-center",
                )}
              >
                <span className="text-primary bg-accent/20 self-center rounded-full p-2 text-center font-semibold">
                  BN
                </span>
                <h3 className={cn("text-xl", menuClass)}>Biabook</h3>
              </div>
              <div
                className={cn("cursor-pointer")}
                onClick={() => setToggleMenu(!toggleMenu)}
              >
                <Menu className="h-8 w-8" />
              </div>
            </header>
            <nav>
              <ul className={style.navLinks}>
                {navLinks.map((link) => (
                  <li
                    key={link.name}
                    className={cn(
                      "hover:bg-accent/20 hover:text-primary text-muted-foreground cursor-pointer rounded-md px-2 py-3 font-medium capitalize",
                      toggleMenu && "justify-center",
                    )}
                  >
                    <Link href={link.link} className="flex items-center gap-2">
                      <link.icon className="text-muted-foreground h-6 w-6 self-center" />
                      <p className={menuClass}>{link.name}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="space-y-4">
            <div
              className={cn(
                "bg-accent/10 relative flex w-full items-center justify-between rounded-md px-2 py-3",
                toggleMenu && "flex-col-reverse items-center justify-center",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  toggleMenu && "mt-4 justify-center",
                )}
              >
                <span className="bg-primary rounded-full p-3 font-semibold text-white">
                  CU
                </span>
                <p className={menuClass}>Chinyere</p>
              </div>
              <div
                className={cn(
                  "cursor-pointer rounded-sm bg-white p-2 hover:bg-gray-100",
                  toggleMenu && "justify-center",
                )}
                onClick={() => setShowProfile(!showProfile)}
              >
                {showProfile ? (
                  <ChevronDown className="h-5 w-5 text-gray-700" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-700" />
                )}
              </div>
              {showProfile && (
                <div className="absolute -top-32 left-0 w-56 rounded-md bg-white p-4 shadow transition-all">
                  <ul className="space-y-2">
                    <li className="hover:bg-accent/20 hover:text-primary flex cursor-pointer items-center gap-2 rounded-md px-2 py-3">
                      <Settings />
                      <Link href={"/admin/settings"}>Settings</Link>
                    </li>
                    <li>
                      <Button className="w-full">
                        <LogOut /> Logout
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nvigition */}
      <div className="bg-blur-md fixed bottom-0 z-50 hidden w-full bg-white/80 max-md:block">
        <div className="p-4 shadow">
          <ul className="flex justify-between gap-2">
            {navLinks.map((link) => (
              <span
                key={link.name}
                className="hover:bg-accent/20 cursor-pointer rounded-md p-4"
              >
                <Link href={link.link}>
                  <link.icon className="hover:text-primary h-6 w-6" />
                </Link>
              </span>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full overflow-y-auto">{children}</div>
    </main>
  );
}
