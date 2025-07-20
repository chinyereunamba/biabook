"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessService } from "./business-profile";
import { ServiceGrid } from "./service-grid";
import { ServiceDetails } from "./service-details";

interface ServiceSelectionProps {
  services: BusinessService[];
  selectedServiceId?: string;
  onServiceSelect: (serviceId: string) => void;
  onContinue?: () => void;
  showContinueButton?: boolean;
  className?: string;
}

export function ServiceSelection({
  services,
  selectedServiceId,
  onServiceSelect,
  onContinue,
  showContinueButton = false,
  className,
}: ServiceSelectionProps) {
  const [detailsService, setDetailsService] = useState<BusinessService | null>(null);
  
  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const selectedService = services.find(s => s.id === selectedServiceId);
  
  const handleServiceClick = (serviceId: string) => {
    // If it's already selected and clicked again, show details
    if (selectedServiceId === serviceId) {
      const service = services.find(s => s.id === serviceId);
      if (service) setDetailsService(service);
    } else {
      // Otherwise just select it
      onServiceSelect(serviceId);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <DollarSign className="h-5 w-5" />
            <span>Choose a Service</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select the service you'd like to book
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {services.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Clock className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">No services available</p>
              <p className="text-sm text-gray-400">
                This business hasn't added any services yet.
              </p>
            </div>
          ) : (
            <ServiceGrid
              services={services}
              selectedServiceId={selectedServiceId}
              onServiceSelect={handleServiceClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Selected Service Summary - Fixed to bottom on mobile */}
      {selectedService && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg sm:relative sm:p-0 sm:bg-transparent sm:border-0 sm:shadow-none">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-purple-900 truncate">
                    Selected: {selectedService.name}
                  </h4>
                  <div className="mt-1 flex items-center space-x-3 text-sm text-purple-700">
                    <span>{formatDuration(selectedService.duration)}</span>
                    <span>•</span>
                    <span className="font-semibold">
                      ${formatPrice(selectedService.price)}
                    </span>
                  </div>
                </div>
                
                {showContinueButton && onContinue && (
                  <Button 
                    onClick={onContinue}
                    className="whitespace-nowrap ml-4"
                    size="sm"
                  >
                    <span className="hidden sm:inline">Continue to Date & Time</span>
                    <span className="sm:hidden">Continue</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Service Details Modal */}
      <ServiceDetails
        service={detailsService}
        isOpen={!!detailsService}
        onClose={() => setDetailsService(null)}
        onSelect={onServiceSelect}
      />
    </div>
  );
}