import { Pricing } from "@/components/home/pricing";
import { CompetitorComparison } from "@/components/home/comparison-table";
import { PlanComparison } from "@/components/home/plan-comparison";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Simple & Transparent Plans | BiaBook",
  description:
    "Choose the perfect plan for your business. Start free with up to 50 bookings/month. Upgrade to Pro for unlimited bookings and WhatsApp notifications at $19/month.",
  openGraph: {
    title: "BiaBook Pricing - Start Free, Upgrade When You Grow",
    description:
      "Simple pricing for appointment booking. Free plan available. Pro at $19/month with unlimited bookings.",
    type: "website",
  },
};

export default function PricingPage() {
  return (
    <main>
      <Pricing />
      <CompetitorComparison />
      <PlanComparison />
    </main>
  );
}
