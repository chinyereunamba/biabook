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
      {/* Business Header */}
      <Card>
        <CardContent>
          <div className="items-start space-y-4">
            <div className="flex items-center gap-4">
              {/* Business Logo/Avatar */}
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                <span className="text-2xl font-bold text-purple-600">
                  {business.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Business Info */}
              <div className="flex">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {business.name}
                  </h1>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1"></div>
            <div className="mt-1 flex items-center space-x-3">
              <Badge variant="secondary">{business.category.name}</Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 (124 reviews)</span>
              </div>
            </div>

            {business.description && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {business.description}
              </p>
            )}

            {/* Contact Info */}
            <div className="mt-4 space-y-2">
              {business.location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span>{business.location}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span>{business.phone}</span>
                </div>
              )}
              {business.email && (
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span>{business.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
