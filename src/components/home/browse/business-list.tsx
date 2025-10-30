"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import type { BrowseBusiness } from "@/types/business";
import { useRouter } from "next/navigation";

export default function BrowseBusiness({
  businesses,
}: {
  businesses: BrowseBusiness[];
}) {
  const router = useRouter();
  return (
    <div className="bg-background min-h-screen">
      {/* Results */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-foreground text-2xl font-bold">
              {businesses.length} businesses found
            </h2>
            <select className="border-border bg-background text-foreground rounded-lg border px-4 py-2">
              <option>Sort by: Rating</option>
              <option>Sort by: Price</option>
              <option>Sort by: Distance</option>
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="border-border bg-card overflow-hidden rounded-xl border transition hover:shadow-lg"
              >
                <div className="from-primary/20 to-accent/20 flex h-48 items-center justify-center bg-gradient-to-br">
                  {/* <span className="text-6xl">{business.image}</span> */}
                </div>

                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-foreground text-lg font-semibold">
                      {business.name}
                    </h3>
                    <span className="bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs">
                      {business.category}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <Star className="fill-accent text-accent h-4 w-4" />
                    <span className="text-foreground font-semibold">
                      {business.rating}
                    </span>
                    <span className="text-foreground/60 text-sm">
                      ({business.reviews})
                    </span>
                  </div>

                  <div className="text-foreground/70 mb-3 flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {business.location}
                  </div>

                  <p className="text-foreground/70 mb-4 text-sm">
                    {business.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">
                      {business.priceRange}
                    </span>
                    <Button
                      onClick={() => router.push(`/book/${business.id}`)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
