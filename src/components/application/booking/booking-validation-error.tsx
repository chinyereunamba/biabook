"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlternativeBusinesses,
  type AlternativeBusiness,
} from "./alternative-businesses";
import {
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
  Navigation,
} from "lucide-react";

export interface BookingValidationErrorProps {
  type: "location" | "service_area" | "availability" | "general";
  title: string;
  message: string;
  suggestions?: string[];
  businessName: string;
  businessContact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  alternatives?: AlternativeBusiness[];
  customerLocation?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  serviceRadius?: number | null;
  onRetry?: () => void;
  onSkipValidation?: () => void;
  onContactBusiness?: () => void;
  className?: string;
}

export function BookingValidationError({
  type,
  title,
  message,
  suggestions = [],
  businessName,
  businessContact,
  alternatives = [],
  customerLocation,
  distance,
  serviceRadius,
  onRetry,
  onSkipValidation,
  onContactBusiness,
  className = "",
}: BookingValidationErrorProps) {
  const getErrorIcon = () => {
    switch (type) {
      case "location":
      case "service_area":
        return <MapPin className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getErrorColor = () => {
    switch (type) {
      case "location":
      case "service_area":
        return "border-orange-200 bg-orange-50";
      case "availability":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-red-200 bg-red-50";
    }
  };

  const getErrorTextColor = () => {
    switch (type) {
      case "location":
      case "service_area":
        return "text-orange-800";
      case "availability":
        return "text-yellow-800";
      default:
        return "text-red-800";
    }
  };

  const formatDistance = (dist: number) => {
    return dist < 1
      ? `${(dist * 5280).toFixed(0)} ft`
      : `${dist.toFixed(1)} miles`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Error Alert */}
      <Alert className={getErrorColor()}>
        {getErrorIcon()}
        <AlertDescription className={getErrorTextColor()}>
          <div className="space-y-2">
            <div>
              <strong>{title}</strong>
            </div>
            <p>{message}</p>

            {/* Distance and Service Area Info */}
            {type === "service_area" && distance !== undefined && (
              <div className="text-sm">
                <p>
                  You are <strong>{formatDistance(distance)}</strong> from{" "}
                  {businessName}.
                  {serviceRadius !== null && (
                    <span>
                      {" "}
                      Their service area is{" "}
                      <strong>{serviceRadius} miles</strong>.
                    </span>
                  )}
                  {serviceRadius === null && (
                    <span>
                      {" "}
                      They have an <strong>unlimited service area</strong>, but
                      there may be other restrictions.
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="text-sm">
                <p className="mb-1 font-medium">Suggestions:</p>
                <ul className="list-inside list-disc space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What would you like to do?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Retry Option */}
            {onRetry && (
              <Button onClick={onRetry} className="w-full" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}

            {/* Skip Validation Option (for location issues) */}
            {type === "service_area" && onSkipValidation && (
              <Button
                onClick={onSkipValidation}
                className="w-full"
                variant="outline"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Skip Location Check & Book Anyway
              </Button>
            )}

            {/* Contact Business */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Contact {businessName} directly:
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                {businessContact?.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      window.location.href = `tel:${businessContact.phone}`;
                      onContactBusiness?.();
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call {businessContact.phone}
                  </Button>
                )}

                {businessContact?.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      window.location.href = `mailto:${businessContact.email}?subject=Booking Inquiry - Outside Service Area`;
                      onContactBusiness?.();
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                )}
              </div>

              {businessContact?.address && customerLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const mapsUrl = `https://www.google.com/maps/dir/${customerLocation.latitude},${customerLocation.longitude}/${businessContact.address?.replace(/\s+/g, "+") || ""}`;
                    window.open(mapsUrl, "_blank");
                  }}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Get Directions to {businessName}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Businesses */}
      {alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alternative Options</CardTitle>
          </CardHeader>
          <CardContent>
            <AlternativeBusinesses
              alternatives={alternatives}
              originalBusinessName={businessName}
              customerLocation={customerLocation}
            />
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p className="mb-1 font-medium">Need Help?</p>
              <p>
                If you believe this is an error or have special circumstances,
                contact {businessName} directly. Many businesses can make
                exceptions for their service area or help you find alternative
                solutions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
