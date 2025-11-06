"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  ExternalLink,
  Navigation,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export interface AlternativeBusiness {
  id: string;
  name: string;
  distance: number;
  estimatedTravelTime: number;
  // Additional business details that might be available
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  category?: string;
  services?: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
}

interface AlternativeBusinessesProps {
  alternatives: AlternativeBusiness[];
  originalBusinessName: string;
  customerLocation?: {
    latitude: number;
    longitude: number;
  };
  onBusinessSelect?: (businessId: string) => void;
  className?: string;
}

export function AlternativeBusinesses({
  alternatives,
  originalBusinessName,
  customerLocation,
  onBusinessSelect,
  className = "",
}: AlternativeBusinessesProps) {
  const [expandedBusiness, setExpandedBusiness] = useState<string | null>(null);

  if (alternatives.length === 0) {
    return (
      <Alert className={className}>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          No alternative businesses found in your area. You may want to contact{" "}
          {originalBusinessName} directly to discuss your location or consider
          traveling to their location.
        </AlertDescription>
      </Alert>
    );
  }

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  const formatDistance = (distance: number) => {
    return distance < 1
      ? `${(distance * 5280).toFixed(0)} ft`
      : `${distance.toFixed(1)} mi`;
  };

  const formatTravelTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const handleBusinessClick = (businessId: string) => {
    onBusinessSelect?.(businessId);
  };

  const toggleExpanded = (businessId: string) => {
    setExpandedBusiness(expandedBusiness === businessId ? null : businessId);
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Alternative Businesses Nearby
        </h3>
        <p className="text-sm text-gray-600">
          Since you're outside {originalBusinessName}'s service area, here are
          similar businesses that can serve your location:
        </p>
      </div>

      <div className="space-y-3">
        {alternatives.map((business) => (
          <Card key={business.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  {/* Business Name and Category */}
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="truncate font-semibold text-gray-900">
                      {business.name}
                    </h4>
                    {business.category && (
                      <Badge variant="secondary" className="text-xs">
                        {business.category}
                      </Badge>
                    )}
                  </div>

                  {/* Distance and Travel Time */}
                  <div className="mb-2 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{formatDistance(business.distance)} away</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        ~{formatTravelTime(business.estimatedTravelTime)} drive
                      </span>
                    </div>
                  </div>

                  {/* Rating and Price Range */}
                  <div className="mb-2 flex items-center gap-4">
                    {business.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {business.rating.toFixed(1)}
                        </span>
                        {business.reviewCount && (
                          <span className="text-gray-500">
                            ({business.reviewCount})
                          </span>
                        )}
                      </div>
                    )}
                    {business.priceRange && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <DollarSign className="h-3 w-3" />
                        <span>{business.priceRange}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {business.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                      {business.description}
                    </p>
                  )}

                  {/* Location */}
                  {business.location && (
                    <div className="mb-3 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{business.location}</span>
                    </div>
                  )}

                  {/* Services Preview */}
                  {business.services && business.services.length > 0 && (
                    <div className="mb-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">
                          Services:
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(business.id)}
                          className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                        >
                          {expandedBusiness === business.id
                            ? "Show less"
                            : `View all (${business.services.length})`}
                          <ChevronRight
                            className={`ml-1 h-3 w-3 transition-transform ${expandedBusiness === business.id ? "rotate-90" : ""}`}
                          />
                        </Button>
                      </div>

                      <div className="space-y-1">
                        {(expandedBusiness === business.id
                          ? business.services
                          : business.services.slice(0, 2)
                        ).map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-gray-600">
                              {service.name}
                            </span>
                            <div className="flex items-center gap-2 text-gray-500">
                              <span>{service.duration} min</span>
                              <span className="font-medium">
                                ${formatPrice(service.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {!expandedBusiness && business.services.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{business.services.length - 2} more services
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {(business.phone || business.email) && (
                    <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{business.phone}</span>
                        </a>
                      )}
                      {business.email && (
                        <a
                          href={`mailto:${business.email}`}
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <Mail className="h-3 w-3" />
                          <span>{business.email}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="ml-4 flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleBusinessClick(business.id)}
                    asChild
                  >
                    <Link
                      href={`/book/${business.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Book Here
                    </Link>
                  </Button>

                  {customerLocation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/dir/${customerLocation.latitude},${customerLocation.longitude}/${business.name.replace(/\s+/g, "+")}`;
                        window.open(mapsUrl, "_blank");
                      }}
                    >
                      <Navigation className="mr-1 h-3 w-3" />
                      Directions
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-4 rounded-lg bg-blue-50 p-3">
        <p className="text-sm text-blue-800">
          <strong>Need help choosing?</strong> Consider factors like distance,
          travel time, services offered, and customer ratings. You can also
          contact these businesses directly to discuss your specific needs.
        </p>
      </div>
    </div>
  );
}
