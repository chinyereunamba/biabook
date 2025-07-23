"use client";

import { useState } from "react";
import { ServiceCard } from "./service-card";
import { cn } from "@/lib/utils";
import type { BusinessService } from "./business-profile";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceGridProps {
  services: BusinessService[];
  selectedServiceId?: string;
  onServiceSelect: (serviceId: string) => void;
  className?: string;
}

export function ServiceGrid({
  services,
  selectedServiceId,
  onServiceSelect,
  className,
}: ServiceGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(
    new Set(
      services
        .map((service) => service.category)
        .filter((category): category is string => !!category),
    ),
  );

  // Filter services based on search and category
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      searchQuery === ""
        ? true
        : service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (service.description &&
            service.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === null || service.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {categories.length > 0 && (
          <div className="scrollbar-hide -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-2">
            <Badge
              variant={activeCategory === null ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap",
                activeCategory === null
                  ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                  : "",
              )}
              onClick={() => setActiveCategory(null)}
            >
              All Services
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={cn(
                  "cursor-pointer whitespace-nowrap",
                  activeCategory === category
                    ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                    : "",
                )}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No services found</p>
          <p className="text-sm text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={selectedServiceId === service.id}
              onSelect={onServiceSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
