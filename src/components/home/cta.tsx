"use client";

import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="from-primary to-primary/80 bg-gradient-to-r py-20 md:py-32">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-primary-foreground mb-6 text-4xl font-bold md:text-5xl">
          Ready to get started?
        </h2>
        <p className="text-primary-foreground/90 mb-8 text-lg">
          Join thousands of businesses managing their appointments with BookMe
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
}
