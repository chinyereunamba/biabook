"use client";

import { LayersThree01, LayersTwo01, Zap } from "@untitledui/icons";
import { PricingTierCardIcon } from "./base-components/pricing-tier-card";

export const PricingSimpleIcon = () => {
  const plans = [
    {
      title: "Basic plan",
      subtitle: "$10/mth",
      description: "Billed annually.",
      features: [
        "Access to all basic features",
        "Basic reporting and analytics",
        "Up to 10 individual users",
        "20 GB individual data",
        "Basic chat and email support",
      ],
      icon: Zap,
    },
    {
      title: "Business plan",
      subtitle: "$20/mth",
      description: "Billed annually.",
      features: [
        "200+ integrations",
        "Advanced reporting and analytics",
        "Up to 20 individual users",
        "40 GB individual data",
        "Priority chat and email support",
      ],
      icon: LayersTwo01,
    },
    {
      title: "Enterprise plan",
      subtitle: "$40/mth",
      description: "Billed annually.",
      features: [
        "Advanced custom fields",
        "Audit log and data history",
        "Unlimited individual users",
        "Unlimited individual data",
        "Personalized + priority service",
      ],
      icon: LayersThree01,
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex w-full max-w-3xl flex-col">
          <p className="text-brand-secondary md:text-md text-sm font-semibold">
            Pricing
          </p>
          <h2 className="text-display-md text-primary md:text-display-lg mt-3 font-semibold">
            Simple, transparent pricing
          </h2>
          <p className="text-tertiary mt-4 text-lg md:mt-6 md:text-xl">
            We believe Untitled should be accessible to all companies, no matter
            the size.
          </p>
        </div>

        <div className="mt-16 grid w-full grid-cols-1 gap-4 md:mt-24 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
          {plans.map((plan) => (
            <PricingTierCardIcon key={plan.title} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};
