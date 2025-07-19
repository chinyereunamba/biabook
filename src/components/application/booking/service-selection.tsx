"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessService } from "./business-profile";

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
  const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
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

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Choose a Service</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select the service you'd like to book
          </p>
        </CardHeader>
        <CardContent className="p-6">
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
            <div className="space-y-4">
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                
                return (
                  <Card
                    key={service.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      {
                        "ring-2 ring-purple-500 border-purple-500": isSelected,
                        "hover:border-purple-300": !isSelected,
                      }
                    )}
                    onClick={() => onServiceSelect(service.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {service.name}
                              </h3>
                              {service.category && (
                                <Badge 
                                  variant="secondary" 
                                  className="mt-1"
                                >
                                  {service.category}
                                </Badge>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-6 w-6 text-purple-600" />
                            )}
                          </div>
                          
                          {service.description && (
                            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                              {service.description}
                            </p>
                          )}
                          
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{formatDuration(service.duration)}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-4 w-4" />
                              <span>{formatPrice(service.price)}</span>
                            </div>
                          </div>
                          
                          {service.bufferTime && service.bufferTime > 0 && (
                            <p className="mt-2 text-xs text-gray-500">
                              +{service.bufferTime}m buffer time
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-6 text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(service.price)}
                          </p>
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onServiceSelect(service.id);
                            }}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Service Summary */}
      {selectedService && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-purple-900">
                  Selected Service
                </h4>
                <p className="text-purple-800">{selectedService.name}</p>
                <div className="mt-1 flex items-center space-x-3 text-sm text-purple-700">
                  <span>{formatDuration(selectedService.duration)}</span>
                  <span>•</span>
                  <span className="font-semibold">
                    {formatPrice(selectedService.price)}
                  </span>
                </div>
              </div>
              
              {showContinueButton && onContinue && (
                <Button onClick={onContinue}>
                  Continue to Date & Time
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}