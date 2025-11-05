"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Clock,
  ExternalLink,
  Navigation,
  Star,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

export interface AlternativeBusiness {
  id: string;
  name: string;
  distance: number;
  estimatedTravelTime: number;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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

  const getDirectionsUrl = (business: AlternativeBusiness) => {
    if (!customerLocation) return null;

    const destination = business.address
      ? `${business.address}, ${business.city}, ${business.state} ${business.zipCode}`
      : business.name;

    return `https://www.google.com/maps/dir/${customerLocation.latitude},${customerLocation.longitude}/${encodeURIComponent(destination)}`;
  };

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

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Alternative Businesses Near You
        </h3>
        <p className="text-sm text-gray-600">
          Since you're outside {originalBusinessName}'s service area, here are
          similar businesses that can serve your location:
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {alternatives.map((business) => (
          <Card key={business.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{business.name}</CardTitle>
                  {business.address && (
                    <p className="mt-1 text-sm text-gray-600">
                      {business.address}, {business.city}, {business.state}{" "}
                      {business.zipCode}
                    </p>
                  )}
                </div>
                {business.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
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
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Distance and Travel Time */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{formatDistance(business.distance)} away</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    ~{formatTravelTime(business.estimatedTravelTime)} drive
                  </span>
                </div>
              </div>

              {/* Services Preview */}
              {business.services && business.services.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900">
                    Services Available
                  </h4>
                  <div className="space-y-1">
                    {business.services.slice(0, 3).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">
                            {service.duration} min
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            ${formatPrice(service.price)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {business.services.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{business.services.length - 3} more services
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(business.phone || business.email) && (
                <div className="flex items-center gap-4 text-sm">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{business.phone}</span>
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Mail className="h-3 w-3" />
                      <span>Email</span>
                    </a>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => onBusinessSelect?.(business.id)}
                  className="flex-1"
                  size="sm"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Book Here
                </Button>

                {getDirectionsUrl(business) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = getDirectionsUrl(business);
                      if (url) window.open(url, "_blank");
                    }}
                  >
                    <Navigation className="mr-1 h-3 w-3" />
                    Directions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Help */}
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          <strong>Can't find what you're looking for?</strong> You can also
          contact {originalBusinessName} directly to discuss whether they can
          make an exception for your location, or search for more businesses in
          your area.
        </AlertDescription>
      </Alert>
    </div>
  );
}
