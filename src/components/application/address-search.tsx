"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Coordinates, Address } from "@/types/location";

export interface AddressSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface AddressSearchProps {
  onAddressSelected: (coordinates: Coordinates, address: Address) => void;
  onError?: (error: Error) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function AddressSearch({
  onAddressSelected,
  onError,
  placeholder = "Enter your address or zip code",
  className,
  disabled = false,
  autoFocus = false,
}: AddressSearchProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [sessionToken] = useState(() => crypto.randomUUID());

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchInput: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        if (searchInput.length < 3) {
          setSuggestions([]);
          setIsOpen(false);
          return;
        }

        setIsLoading(true);
        try {
          const response = await fetch("/api/location/autocomplete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              input: searchInput,
              sessionToken,
            }),
          });

          const data = await response.json();

          if (data.success) {
            setSuggestions(data.data);
            setIsOpen(data.data.length > 0);
            setSelectedIndex(-1);
          } else {
            throw new Error(data.error || "Failed to get address suggestions");
          }
        } catch (error) {
          console.error("Address search error:", error);
          onError?.(
            error instanceof Error ? error : new Error("Search failed"),
          );
          setSuggestions([]);
          setIsOpen(false);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [sessionToken, onError],
  );

  // Handle input change
  const handleInputChange = (value: string) => {
    setInput(value);
    debouncedSearch(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    setInput(suggestion.description);
    setIsOpen(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/location/place-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: suggestion.placeId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onAddressSelected(data.data.coordinates, data.data.address);
      } else {
        throw new Error(data.error || "Failed to get place details");
      }
    } catch (error) {
      console.error("Place details error:", error);
      onError?.(
        error instanceof Error
          ? error
          : new Error("Failed to get location details"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle direct address geocoding (when user presses Enter without selecting a suggestion)
  const handleDirectGeocode = async () => {
    if (!input.trim() || input.length < 3) return;

    setIsLoading(true);
    setIsOpen(false);

    try {
      const response = await fetch("/api/location/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: input.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Get address details by reverse geocoding
        const reverseResponse = await fetch("/api/location/geocode", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: data.data.latitude,
            longitude: data.data.longitude,
          }),
        });

        const reverseData = await reverseResponse.json();

        if (reverseData.success) {
          onAddressSelected(data.data, reverseData.data);
        } else {
          // Still provide coordinates even if reverse geocoding fails
          onAddressSelected(data.data, {
            address: input.trim(),
            city: "",
            state: "",
            zipCode: "",
            country: "US",
          });
        }
      } else {
        throw new Error(data.error || "Failed to find location");
      }
    } catch (error) {
      console.error("Direct geocoding error:", error);
      onError?.(
        error instanceof Error ? error : new Error("Failed to find location"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleDirectGeocode();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]!);
        } else {
          handleDirectGeocode();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear input
  const clearInput = () => {
    setInput("");
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="pr-10 pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute top-1/2 right-8 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
        {input && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearInput}
            className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <Card
          ref={suggestionsRef}
          className="absolute top-full z-50 mt-1 w-full shadow-lg"
        >
          <CardContent className="p-0">
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.placeId}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={cn(
                    "flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-gray-50",
                    selectedIndex === index && "bg-gray-50",
                  )}
                >
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">
                      {suggestion.mainText}
                    </div>
                    <div className="text-sm text-gray-500">
                      {suggestion.secondaryText}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Simplified zip code search component
export interface ZipCodeSearchProps {
  onLocationSelected: (coordinates: Coordinates, zipCode: string) => void;
  onError?: (error: Error) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ZipCodeSearch({
  onLocationSelected,
  onError,
  placeholder = "Enter ZIP code",
  className,
  disabled = false,
}: ZipCodeSearchProps) {
  const [zipCode, setZipCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanZipCode = zipCode.trim();
    if (!cleanZipCode) return;

    // Basic ZIP code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(cleanZipCode)) {
      onError?.(
        new Error("Please enter a valid ZIP code (e.g., 12345 or 12345-6789)"),
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/location/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: cleanZipCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onLocationSelected(data.data, cleanZipCode);
      } else {
        throw new Error(data.error || "Failed to find ZIP code location");
      }
    } catch (error) {
      console.error("ZIP code search error:", error);
      onError?.(
        error instanceof Error
          ? error
          : new Error("Failed to find ZIP code location"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <div className="relative flex-1">
        <Input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          maxLength={10}
          pattern="\d{5}(-\d{4})?"
        />
      </div>
      <Button
        type="submit"
        disabled={disabled || isLoading || !zipCode.trim()}
        className="px-6"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
