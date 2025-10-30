"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-background/80 border-border sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-primary to-accent flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br">
              <span className="text-primary-foreground text-lg font-bold">
                B
              </span>
            </div>
            <span className="text-foreground text-lg font-bold">BookMe</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#"
              className="text-foreground/70 hover:text-accent text-sm transition-colors"
            >
              Services
            </Link>
            <Link
              href="#"
              className="text-foreground/70 hover:text-accent text-sm transition-colors"
            >
              Features
            </Link>
            <Link
              href="#"
              className="text-foreground/70 hover:text-accent text-sm transition-colors"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/70 hover:text-foreground"
            >
              <Link href={"/login"}>Sign In</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href={"/signup"}>Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
