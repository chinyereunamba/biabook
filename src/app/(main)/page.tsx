import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { Features } from "@/components/home/features";
import { Benefits } from "@/components/home/benefits";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonial } from "@/components/home/testimonial";
import { Pricing } from "@/components/home/pricing";
import { CTA } from "@/components/home/cta";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Hero />
      <Stats />
      <Features />
      <Benefits />
      <HowItWorks />
      <Testimonial />
      <Pricing />
      <CTA />
    </div>
  );
}
