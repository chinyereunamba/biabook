"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <nav className="bg-background/80 backdrop-blur-xl fixed w-full top-0 z-50 border-b border-border/50">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-primary font-display">
          BiaBook
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#"
            className="text-secondary font-bold border-b-2 border-secondary pb-1 font-sans tracking-tight text-sm"
          >
            Product
          </Link>
          <Link
            href="#"
            className="text-primary hover:text-secondary transition-colors font-sans tracking-tight font-bold text-sm"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-primary hover:text-secondary transition-colors font-sans tracking-tight font-bold text-sm"
          >
            Blog
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            className="px-6 py-2 bg-gradient-to-r from-primary to-primary-container text-primary-foreground rounded-xl font-bold text-sm hover:scale-105 transition-transform duration-200 border-none h-auto"
            asChild
          >
            <Link href="/signup">Start for Free</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
