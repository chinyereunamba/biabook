"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-16 pb-24 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative z-10">
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-primary leading-[1.1] tracking-tight mb-6">
            Scheduling, <br /><span className="text-secondary">simplified</span> for Nigeria.
          </h1>
          <p className="text-on-surface-variant text-xl md:text-2xl max-w-lg mb-10 leading-relaxed">
            Save hours of back-and-forth messaging. Automate your bookings and reduce no-shows by 94% with BiaBook.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="px-8 py-6 bg-gradient-to-r from-primary to-primary-container text-primary-foreground rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-200 shadow-xl shadow-primary/10 h-auto"
              asChild
            >
              <Link href="/signup">Start for Free</Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-6 bg-surface-container-highest text-on-surface rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-200 h-auto border-none"
              asChild
            >
              <Link href="#">See a Demo</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img
                className="w-12 h-12 rounded-full border-4 border-background object-cover"
                alt="Nigerian professional"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCok-DaCUsMkg9C8RGn2eSqDEl4e47ZbtvtePHeiYSatfvN98PXPiS5-mOrEERwX1cx2_prjkytRhKOuygVZipsBpKcgQB4Es7GGpXEtAppEz5B8XN-UerTmicsLczg6vXmKKuRp4jPi-ZHZ5t-hQYP5uBjgDnbviHOnZZ3Z1uGcbzHUT4xO_q5geQQnVjAsUlva5kiZQAxeIq3ykloKIgtzHvut132_2FcIi3F7LSCAuI2BtlVqog4z8nTJl7Cy9rvA_bdMkTDXogx"
              />
              <img
                className="w-12 h-12 rounded-full border-4 border-background object-cover"
                alt="Entrepreneur"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCo4gz_c-tlX0dGnYTRbsKxi_I5Nhv1a40i1J3wCmWR3FprhI61XaHUPl_2ulfaLsBYBnpBRKv_t5hgVs8DL4L44GvkrSbngJcLT238kh1-OmFE_HSBZMmRaKtz-8FvXU_zlzjpsshRm6vCo-oXn-6NQADMSY4QY16616u8BJOLncz-EtJxneHZQX4tRCDfKALuYJ9kGdhMCruF_tQW2uP1t5997FyKV-AzJXyXmIhjD8AsTf55VekEY4gwWeHMvSRLDQ3pTTaz27W1"
              />
              <img
                className="w-12 h-12 rounded-full border-4 border-background object-cover"
                alt="Business owner"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnyQWSd8RDJkJSrAhox6As8-LNmQWlXiZTPc1dC018TXZZMpMgQ-p9KJHgxBrAKNZl8jxzfYO4yHZdNFQWhIVjPTOpXObslMMEJoYK8HEtbRNvVGx-ZPhos5dMtZbifalhttLtHWCRj9LD-Vhgw07PJY_WecTuyAw59E8sF8LLEn6QCxv2J-x2408P8ZqlmGciJJnc960yKiH5-LOkLFeDcrfnjZIDA4lEFOsfFwlNPv-dbABn873Yu-Ku7tHew4_OKkaueaflWspm"
              />
            </div>
            <p className="text-sm font-medium text-on-surface-variant">
              Join <span className="text-primary font-bold">12,000+</span> businesses growing in Nigeria
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-secondary/10 asymmetric-shape -rotate-6 transform scale-110"></div>
          <div className="relative bg-surface-container-lowest rounded-[2.5rem] p-4 shadow-2xl shadow-primary/5">
            <img
              className="rounded-[2rem] w-full aspect-[4/5] object-cover"
              alt="Salon in Lagos"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZhyz7FS7Bcd56bSbZFY8p1lZfxQ878oXWi0aB8R9dkFiBf6TPiWQJ5llGeHIMyaWEjI2KHodSFnpVbCpVL_aB8G1HJk2Lx66I0eOYwTpErBaFf1clocaHj_I5RqbThxu1EeA3Xp72g4tis_UmuZe2PtDPhyNppDFb0VWf1lAbH1Dp4SEC6aP-EmaRQnet99XGsCC5wudTf0hrlkiy-3Ht2ENeofgztKQ-EdiGWQfXkd0ewHwvt2R1JTLhbeQ1Xisx4ugTeu3Ewq-k"
            />
            <div className="absolute -bottom-8 -left-8 bg-surface-container shadow-xl p-6 rounded-2xl max-w-[200px]">
              <span className="material-symbols-outlined text-secondary text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              <p className="text-sm font-bold text-primary">New Appointment</p>
              <p className="text-xs text-on-surface-variant">Hair Braiding • 2:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
