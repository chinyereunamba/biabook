"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/utils/config";

export function Header() {
  return (
    <header className="bg-background/80 border-border sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={"/"} className="text-foreground text-lg font-bold">
              {appConfig.name}
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/browse"
              className="text-foreground/70 hover:text-accent text-sm transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/pricing"
              className="text-foreground/70 hover:text-accent text-sm transition-colors"
            >
              Pricing
            </Link>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href={"/login"}>Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
