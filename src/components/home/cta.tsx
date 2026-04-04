"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 px-8 bg-background">
      <div className="max-w-7xl mx-auto bg-primary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-container rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-8">
            Ready to fill your calendar?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto font-sans leading-relaxed">
            Join thousands of Nigerian professionals who are taking back control of their time with BiaBook.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="px-10 py-6 bg-secondary text-secondary-foreground rounded-2xl font-bold text-xl hover:scale-105 transition-transform duration-200 shadow-2xl shadow-secondary/30 h-auto border-none"
              asChild
            >
              <Link href="/signup">Get started free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-10 py-6 bg-primary-container text-primary-foreground rounded-2xl font-bold text-xl hover:bg-white hover:text-primary transition-colors duration-200 h-auto border-none"
              asChild
            >
              <Link href="#">Talk to sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
