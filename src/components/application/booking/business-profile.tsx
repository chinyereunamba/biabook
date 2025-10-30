"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ContactSharingComponent,
  SharingComponent,
} from "@/components/ui/sharing";
import { MapPin, Phone, Mail, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessProfile } from "@/hooks/use-business";

interface BusinessProfileProps {
  business: BusinessProfile;
  showSharing?: boolean;
  showContact?: boolean;
  className?: string;
}

export function BusinessProfileComponent({
  business,
  showSharing = false,
  showContact = false,
  className,
}: BusinessProfileProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="border-border bg-card rounded-xl border p-6">
        <div className="from-primary/20 to-accent/20 mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br">
          {/* <span className="text-4xl">{business.image}</span> */}
        </div>

        <h1 className="text-foreground mb-2 text-2xl font-bold">
          {business.name}
        </h1>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-foreground font-semibold">
            {business.rating}
          </span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-accent">
                ★
              </span>
            ))}
          </div>
          <span className="text-foreground/60 text-sm">
            ({business.reviews ?? 0})
          </span>
        </div>

        <p className="text-foreground/70 mb-4">{business.description}</p>
      </div>

      {/* Contact Sharing Component */}
      {showContact && (
        <ContactSharingComponent
          businessName={business.name}
          businessPhone={business.phone ?? undefined}
          businessEmail={business.email ?? undefined}
          businessLocation={business.location ?? undefined}
        />
      )}

      {/* Business Sharing Component */}
      {showSharing && (
        <SharingComponent
          title={`Book with ${business.name}`}
          url={typeof window !== "undefined" ? window.location.href : ""}
          businessName={business.name}
          businessPhone={business.phone ?? undefined}
        />
      )}
    </div>
  );
}
