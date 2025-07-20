"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessService } from "./business-profile";

interface ServiceCardProps {
  service: BusinessService;
  isSelected: boolean;
  onSelect: (serviceId: string) => void;
  className?: string;
}

export function ServiceCard({
  service,
  isSelected,
  onSelect,
  className,
}: ServiceCardProps) {
  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 transition-all",
        "touch-action-manipulation active:scale-[0.98]",
        "hover:border-purple-300 hover:shadow-sm",
        {
          "border-purple-500 bg-purple-50 shadow-sm": isSelected,
          "border-gray-200": !isSelected,
        },
        className,
      )}
      onClick={() => onSelect(service.id)}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {service.name}
              </h3>
              {service.category && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {service.category}
                </Badge>
              )}
            </div>
            {isSelected && (
              <CheckCircle className="ml-2 h-5 w-5 text-purple-600" />
            )}
          </div>

          {service.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
              {service.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{formatDuration(service.duration)}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-1 h-4 w-4" />
              <span>{formatPrice(service.price)}</span>
            </div>
            {service.bufferTime && service.bufferTime > 0 && (
              <div className="text-xs text-gray-500">
                +{service.bufferTime}m buffer
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:ml-4 sm:flex-col sm:items-end">
          <p className="text-xl font-bold text-gray-900">
            {formatPrice(service.price)}
          </p>
          <Button
            size="sm"
            variant={isSelected ? "primary" : "outline"}
            className="mt-2 min-w-[90px]"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(service.id);
            }}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
}
