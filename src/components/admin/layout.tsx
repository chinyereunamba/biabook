"use client";

import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  Settings,
  Calendar,
  type LucideProps,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { performCompleteLogout } from "@/lib/session-utils";

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
  const pathname = usePathname();

  const { data: session } = useSession();
  const menuClass = toggleMenu ? "hidden" : "";

  const handleLogout = async () => {
    await performCompleteLogout("/login");
  };

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
                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full p-2">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3
                  className={cn("text-xl font-bold text-gray-900", menuClass)}
                >
                  BiaBook
                </h3>
              </div>
              <button
                className={cn(
                  "cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100",
                )}
                onClick={() => setToggleMenu(!toggleMenu)}
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            </header>
            <nav>
              <ul className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.link;
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.link}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium capitalize transition-all duration-200",
                          toggleMenu ? "justify-center px-2" : "",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        <link.icon className={cn("h-5 w-5 flex-shrink-0")} />
                        <span className={cn("truncate", menuClass)}>
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          <div className="space-y-4">
            <div
              className={cn(
                "relative flex w-full items-center justify-between rounded-lg bg-gray-50 p-3",
                toggleMenu && "flex-col-reverse items-center justify-center",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-3",
                  toggleMenu && "mt-4 justify-center",
                )}
              >
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className={cn("flex flex-col", menuClass)}>
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <button
                className={cn(
                  "cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-gray-200",
                  toggleMenu && "justify-center",
                )}
                onClick={() => setShowProfile(!showProfile)}
              >
                {showProfile ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                )}
              </button>
              {showProfile && (
                <div className="absolute -top-28 right-0 left-0 z-50 rounded-lg border bg-white p-2 shadow-lg">
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    onClick={() => setShowProfile(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg md:hidden">
        <div className="px-4 py-2">
          <ul className="flex justify-around">
            {navLinks.slice(0, 4).map((link) => {
              const isActive = pathname === link.link;
              return (
                <li key={link.name}>
                  <Link
                    href={link.link}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-gray-600 hover:text-gray-900",
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="text-xs font-medium capitalize">
                      {link.name}
                    </span>
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-xs font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full overflow-y-auto pb-16 md:pb-0">{children}</div>
    </main>
  );
}
