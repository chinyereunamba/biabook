"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Clock,
  DollarSign 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface BusinessService {
  id: string;
  name: string;
  description?: string | null;
  duration: number; // minutes
  price: number; // cents
  category?: string | null;
  bufferTime?: number | null;
}

export interface BusinessProfile {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  category: {
    id: string;
    name: string;
  };
  services: BusinessService[];
}

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

  return (
    <div className={cn("space-y-6", className)}>
      {/* Business Header */}
      <Card>
        <CardContent>
          <div className="flex items-start space-x-4">
            {/* Business Logo/Avatar */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 flex-shrink-0">
              <span className="text-2xl font-bold text-purple-600">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Business Info */}
            <div className="flex-1 min-w-0">
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
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
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
            <div className="grid gap-4">
              {business.services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                
                return (
                  <div
                    key={service.id}
                    className={cn(
                      "relative rounded-lg border p-4 transition-all cursor-pointer",
                      "hover:border-purple-300 hover:shadow-sm",
                      {
                        "border-purple-500 bg-purple-50 shadow-sm": isSelected,
                        "border-gray-200": !isSelected,
                      }
                    )}
                    onClick={() => onServiceSelect(service.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {service.name}
                            </h3>
                            {service.category && (
                              <Badge 
                                variant="outline" 
                                className="mt-1 text-xs"
                              >
                                {service.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xl font-bold text-gray-900">
                              {formatPrice(service.price)}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>{formatDuration(service.duration)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {service.description && (
                          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                        
                        {service.bufferTime && service.bufferTime > 0 && (
                          <p className="mt-2 text-xs text-gray-500">
                            +{service.bufferTime}m buffer time between appointments
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Duration: {formatDuration(service.duration)}</span>
                        <span>•</span>
                        <span>Price: {formatPrice(service.price)}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={isSelected ? "primary" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onServiceSelect(service.id);
                        }}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}