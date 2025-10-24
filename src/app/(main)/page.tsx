import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { Benefits } from "@/components/home/benefits";
import { Testimonial } from "@/components/home/testimonial";
import { Pricing } from "@/components/home/pricing";
import { CTA } from "@/components/home/cta";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      
      <Hero />
      <Features />
      <Benefits />
      <Testimonial />
      <Pricing />
      <CTA />
     
    </div>
  );
}
