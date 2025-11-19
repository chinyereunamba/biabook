"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccessibleButton } from "@/hooks/use-accessibility";
import { KEYBOARD_KEYS } from "@/lib/accessibility";
import type { BusinessService } from "@/hooks/use-business";

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

  // Enhanced accessibility for service card
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (
      event.key === KEYBOARD_KEYS.ENTER ||
      event.key === KEYBOARD_KEYS.SPACE
    ) {
      event.preventDefault();
      onSelect(service.id);
    }
  };

  const cardLabel = `${service.name} service, ${formatDuration(service.duration)}, $${formatPrice(service.price)}${isSelected ? ", currently selected" : ""}`;

  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-lg border p-4 transition-all",
        "touch-action-manipulation active:scale-[0.98]",
        "hover:border-purple-300 hover:shadow-sm",
        "focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none",
        {
          "border-purple-500 bg-purple-50 shadow-sm": isSelected,
          "border-gray-200": !isSelected,
        },
        className,
      )}
      role="button"
      tabIndex={0}
      aria-label={cardLabel}
      aria-pressed={isSelected}
      onClick={() => onSelect(service.id)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-text text-lg font-semibold">
                {service.name}
              </h3>
              {service.category && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {service.category}
                </Badge>
              )}
            </div>
          </div>

          {service.description && (
            <p className="text-text mt-2 line-clamp-2 text-sm leading-relaxed">
              {service.description}
            </p>
          )}

          <div className="text-text mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{formatDuration(service.duration)}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-1 h-4 w-4" />
              <span>{formatPrice(service.price)}</span>
            </div>
            {service.bufferTime && service.bufferTime > 0 && (
              <div className="text-text text-xs">
                +{service.bufferTime}m buffer
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:ml-4 sm:flex-col sm:items-end">
          <p className="text-text text-xl font-bold" aria-hidden="true">
            {formatPrice(service.price)}
          </p>
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className="mt-2 min-w-[90px]"
            aria-label={`${isSelected ? "Selected" : "Select"} ${service.name} service`}
            aria-pressed={isSelected}
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
