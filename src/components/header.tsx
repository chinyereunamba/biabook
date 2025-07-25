"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Calendar, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  businessName?: string;
  showBackButton?: boolean;
  showWhatsAppContact?: boolean;
  onBack?: () => void;
  className?: string;
}

export function Header({
  businessName,
  showBackButton = false,
  onBack,
  className,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll event listener to detect when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 60;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={cn(
        // Mobile-first responsive header
        "sticky top-0 z-50 w-full transition-all duration-300",
        className,
        scrolled && "top-4",
      )}
    >
      <div
        className={cn(
          "container mx-auto rounded-2xl px-4 py-2 transition-all duration-300",
          scrolled
            ? "border-bborder-neutral-200 bg-white/95 shadow-md backdrop-blur-sm supports-[backdrop-filter]:bg-white/80"
            : "",
        )}
      >
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button and logo */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="md:hidden"
                aria-label="Go back"
              >
                <X className="size-5" />
              </Button>
            ) : (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex h-16 items-center border-b border-neutral-200 px-6">
                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calendar className="text-primary size-6" />
                      <span className="text-lg font-semibold">BookMe</span>
                    </Link>
                  </div>

                  <nav className="p-6">
                    <div className="space-y-1">
                      <Link
                        href="/business"
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Book a Service
                      </Link>
                      <Link
                        href="/#features"
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Features
                      </Link>
                      <Link
                        href="/#pricing"
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Pricing
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </div>

                    <div className="mt-8 border-t border-neutral-200 pt-6">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Calendar className="text-primary size-6" />
              <span className="text-lg font-semibold">
                {businessName ?? "BookMe"}
              </span>
            </Link>
          </div>
          <div className="flex gap-6">
            {/* Desktop navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/business"
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
              >
                Book a Service
              </Link>
              <Link
                href="/#features"
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
              >
                Pricing
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="hidden md:flex"
                onClick={() => (window.location.href = "/login")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
