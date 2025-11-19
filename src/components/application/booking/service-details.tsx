"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, X, Calendar, Info } from "lucide-react";
import type { BusinessService } from "@/hooks/use-business";

interface ServiceDetailsProps {
  service: BusinessService | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (serviceId: string) => void;
}

export function ServiceDetails({
  service,
  isOpen,
  onClose,
  onSelect,
}: ServiceDetailsProps) {
  if (!service) return null;

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} minutes`
      : `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{service.name}</DialogTitle>
          {service.category && (
            <Badge variant="outline" className="mt-1 w-fit">
              {service.category}
            </Badge>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Service Details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Duration:</span>
              <span>{formatDuration(service.duration)}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Price:</span>
              <span>${formatPrice(service.price)}</span>
            </div>

            {service.bufferTime && service.bufferTime > 0 && (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Buffer Time:</span>
                <span>{service.bufferTime} minutes</span>
              </div>
            )}
          </div>

          {/* Description */}
          {service.description && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2">
                <Info className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium text-gray-700">Description</h3>
              </div>
              <p className="text-sm whitespace-pre-line text-gray-600">
                {service.description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button
            variant="default"
            onClick={() => {
              onSelect(service.id);
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            Select Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
