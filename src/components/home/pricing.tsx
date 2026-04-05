"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "/forever",
      features: [
        "10 Bookings/mo",
        "Custom Booking Link",
        "Email Notifications",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "₦9,900",
      period: "/mo",
      features: [
        "Unlimited Bookings",
        "WhatsApp Automations",
        "Payment Collection",
        "Google Calendar Sync",
      ],
      cta: "Go Pro Now",
      highlighted: true,
    },
    {
      name: "Business",
      price: "₦24,900",
      period: "/mo",
      features: [
        "Up to 5 Staff Members",
        "Multiple Locations",
        "Advanced Analytics",
        "Priority 24/7 Support",
      ],
      cta: "Choose Business",
      highlighted: false,
    },
  ];

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">Simple, honest pricing.</h2>
          <p className="text-on-surface-variant text-lg font-sans">No hidden fees. No credit card required to start.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`p-10 rounded-[2.5rem] flex flex-col transition-all duration-500 ${plan.highlighted
                ? "bg-primary transform scale-105 shadow-2xl shadow-primary/20 relative overflow-hidden"
                : "bg-surface"
                }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-secondary-container px-6 py-2 rounded-bl-2xl text-secondary-foreground text-xs font-black tracking-widest uppercase font-sans">
                  Popular
                </div>
              )}
              <h3 className={`text-xl font-bold mb-4 font-display ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-4xl font-extrabold font-display ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`}>
                  {plan.price}
                </span>
                <span className={`font-medium font-sans ${plan.highlighted ? "text-primary-foreground/70" : "text-on-surface-variant"}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, j) => (
                  <li key={j} className={`flex items-center gap-3 font-sans ${plan.highlighted ? "text-primary-foreground" : "text-on-surface-variant"}`}>
                    <Check className={`w-5 h-5 ${plan.highlighted ? "text-secondary-container" : "text-primary"}`} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlighted ? "secondary" : "artisan"}
                size="lg"
                className={plan.highlighted ? "bg-white text-primary hover:bg-white/90" : ""}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}