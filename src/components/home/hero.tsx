"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-background place-content-center relative grid min-h-[70vh] overflow-hidden py-24 md:py-40">
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl"></div>
        <div className="bg-accent/10 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl"></div>
      </div> */}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-foreground text-6xl leading-tight font-bold md:text-7xl">
                Booking made <span className="">effortless</span>
              </h1>
              <p className="text-foreground/70 text-xl leading-relaxed">
                Let your customers book appointments instantly. Automated
                reminders, smart scheduling, and beautiful management dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground group"
              >
                <Link href="/signup" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-secondary bg-transparent"
              >
                Watch Demo
              </Button> */}
            </div>

            <div className="flex items-center gap-8 pt-4">
              {/* <div>
                <p className="text-foreground text-2xl font-bold">10K+</p>
                <p className="text-foreground/60 text-sm">Active Businesses</p>
              </div>
              <div>
                <p className="text-foreground text-2xl font-bold">500K+</p>
                <p className="text-foreground/60 text-sm">Bookings Monthly</p>
              </div> */}
              {/* <div>
                <p className="text-foreground/70 text-lg">Stats coming soon</p>
              </div> */}
            </div>
          </div>

          <div className="relative h-96 min-h-96 md:h-full">
            {/* <div className="from-primary/20 to-accent/20 absolute inset-0 rounded-2xl bg-gradient-to-br blur-2xl"></div> */}
            <div className="bg-card border-border relative rounded-2xl border p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="bg-muted h-3 w-3/4 rounded-full"></div>
                <div className="bg-muted h-3 w-1/2 rounded-full"></div>
                <div className="space-y-3 pt-4">
                  <div className="flex gap-2">
                    <div className="bg-primary/20 h-12 w-12 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted h-2 w-3/4 rounded"></div>
                      <div className="bg-muted h-2 w-1/2 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-accent/20 h-12 w-12 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted h-2 w-3/4 rounded"></div>
                      <div className="bg-muted h-2 w-1/2 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
