"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Star, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceCard } from "./service-card";
import type { BusinessProfile } from "@/hooks/use-business";

interface BusinessProfileProps {
  business: BusinessProfile;
  selectedServiceId?: string;
  onServiceSelect: (serviceId: string) => void;
  className?: string;
}

export function BusinessProfileComponent({
  business,
  selectedServiceId,
  onServiceSelect,
  className,
}: BusinessProfileProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Business Header */}
      <Card>
        <CardContent>
          <div className="flex items-start space-x-4">
            {/* Business Logo/Avatar */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
              <span className="text-2xl font-bold text-purple-600">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Business Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {business.name}
                  </h1>
                  <div className="mt-1 flex items-center space-x-3">
                    <Badge variant="secondary">{business.category.name}</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8 (124 reviews)</span>
                    </div>
                  </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Services</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose a service to book your appointment
          </p>
        </CardHeader>
        <CardContent>
          {business.services.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-2 text-gray-400">
                <Clock className="mx-auto h-12 w-12" />
              </div>
              <p className="text-gray-500">No services available</p>
              <p className="text-sm text-gray-400">
                This business hasn&apos;t added any services yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {business.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={selectedServiceId === service.id}
                  onSelect={onServiceSelect}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
