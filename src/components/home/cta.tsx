"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 px-8 bg-background">
      <div className="max-w-7xl mx-auto bg-primary rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-container/20 via-transparent to-transparent"></div>
        <div className="relative z-10">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Ready to grow your <br /><span className="text-secondary-container italic">artisan business?</span>
          </h2>
          <p className="text-white text-xl mb-12 max-w-2xl mx-auto font-sans leading-relaxed">
            Join Nigeria's leading professionals and start booking clients with modern precision. No setup fee, no stress.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              variant="artisan"
              size="xl"
              className="bg-white text-primary hover:bg-white/90 shadow-2xl"
              asChild
            >
              <Link href="/signup">Get Started Now</Link>
            </Button>
            <Button
              variant="artisan-outline"
              size="xl"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
