"use client";

import { Card } from "@/components/ui/card";

export function Benefits() {
  const benefits = [
    {
      title: "For Service Providers",
      items: [
        "Reduce no-shows with reminders",
        "Automate scheduling",
        "Increase bookings by 40%",
        "Save 5+ hours per week",
      ],
    },
    {
      title: "For Customers",
      items: [
        "Book 24/7 anytime",
        "No phone calls needed",
        "Instant confirmations",
        "Easy rescheduling",
      ],
    },
    {
      title: "For Business Growth",
      items: [
        "Real-time analytics",
        "Customer insights",
        "Revenue tracking",
        "Performance reports",
      ],
    },
  ];

  return (
    <section className="bg-secondary/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
            Why choose BookMe
          </h2>
          <p className="text-foreground/70 text-lg">
            Trusted by thousands of businesses worldwide
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, i) => (
            <Card
              key={i}
              className="bg-card border-border hover:border-primary/50 p-8 transition-colors"
            >
              <h3 className="text-foreground mb-6 text-xl font-bold">
                {benefit.title}
              </h3>
              <ul className="space-y-4">
                {benefit.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className="bg-primary/20 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                      <div className="bg-primary h-2 w-2 rounded-full"></div>
                    </div>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
