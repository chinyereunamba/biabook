"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      desc: "Forever",
      features: ["Up to 50 bookings/month", "Basic booking page", "Email notifications", "Customer management"],
      cta: "Get started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$19",
      desc: "/month",
      features: [
        "Unlimited bookings",
        "WhatsApp notifications",
        "Custom booking page",
        "Analytics & reports",
        "Priority support",
      ],
      cta: "Start free trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$49",
      desc: "/month",
      features: ["Multiple locations", "Team management", "API access", "White-label options", "Dedicated support"],
      cta: "Contact sales",
      highlighted: false,
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-foreground/70">Start free, upgrade when you grow</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-xl border transition ${
                plan.highlighted ? "border-primary bg-primary/5 shadow-lg scale-105" : "border-border bg-card"
              }`}
            >
              <div className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-foreground/70 ml-2">{plan.desc}</span>
                </div>

                <Button
                  className={`w-full mb-8 ${
                    plan.highlighted
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                  }`}
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-foreground/60 mt-12">
          All plans include SSL security, 99.9% uptime, and mobile-responsive booking pages
        </p>
      </div>
    </section>
  )
}