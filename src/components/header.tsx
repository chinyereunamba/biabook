"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Calendar } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-primary/40 sticky top-4 z-50 container mx-auto w-full rounded-2xl border p-3 backdrop-blur">
      <div className="flex h-14 items-center">
        <div className="mr-4 hidden items-center gap-6 md:flex">
          <Link href={"/"} className="flex items-center space-x-2">
            <Calendar className="text-primary h-8 w-8" />
            <span className="text-2xl font-bold">BookMe</span>
          </Link>
        </div>

        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span className="font-bold">BookMe</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                <Link
                  href="/#features"
                  className="text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/booking"
                  className="text-foreground/60"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Booking
                </Link>
                <Link
                  href="/dashboard"
                  className="text-foreground/60"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-3">
            <div className="flex items-center gap-2">
              <Link
                href="/business"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Book a service
              </Link>
             
              <Link
                href="/#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
            </div>
            <Button asChild size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
