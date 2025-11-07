/**
 * Address autocomplete component with Google Places API integration
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationSecurityValidator } from "@/lib/location-security-validator";
import { locationRateLimiter } from "@/lib/location-rate-limiter";
import { LocationErrorHandler } from "@/lib/location-error-handler";
import { AddressAutocompleteFallback } from "./address-autocomplete-fallback";

export interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export interface AddressDetails {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (details: AddressDetails) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  countryRestriction?: string; // ISO country code
  types?: string[]; // Place types to restrict results
}

/**
 * Address autocomplete component with security validation and rate limiting
 */
export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter your address",
  className,
  disabled = false,
  required = false,
  id,
  countryRestriction = "us",
  types = ["address"],
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string>("");
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Initialize Google Places service
  const [placesService, setPlacesService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [placesDetailsService, setPlacesDetailsService] =
    useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setApiAvailable(false);
      return;
    }

    // Load Google Maps API if not already loaded
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeServices;
      script.onerror = () => {
        setApiAvailable(false);
        console.error("Failed to load Google Maps API");
      };
      document.head.appendChild(script);
    } else if (window.google) {
      initializeServices();
    }
  }, []);

  const initializeServices = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setPlacesService(new window.google.maps.places.AutocompleteService());

      // Create a dummy div for PlacesService (required by Google Maps API)
      const dummyDiv = document.createElement("div");
      const map = new window.google.maps.Map(dummyDiv);
      setPlacesDetailsService(new window.google.maps.places.PlacesService(map));
      setApiAvailable(true);
    } else {
      setApiAvailable(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        searchAddresses(query);
      }, 300);
    },
    [placesService],
  );

  const searchAddresses = async (query: string) => {
    if (!query.trim() || !placesService || query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    try {
      // Check rate limit
      const identifier = "user_session"; // In real app, use actual user/session ID
      locationRateLimiter.enforceLimit("geocoding", identifier);

      // Validate input for security
      const validation = LocationSecurityValidator.validateLocationInput(
        {
          address: query,
          city: "",
          state: "",
          zipCode: "",
          country: countryRestriction,
        },
        { userAgent: navigator.userAgent },
      );

      if (!validation.isValid) {
        const securityError = validation.errors.find(
          (e) => e.severity === "high",
        );
        if (securityError) {
          setError("Invalid address format");
          return;
        }
      }

      if (validation.securityFlags.length > 0) {
        console.warn("Security flags detected:", validation.securityFlags);
      }

      setIsLoading(true);
      setError("");

      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        componentRestrictions: { country: countryRestriction },
        types: types,
      };

      placesService.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);

        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          const formattedSuggestions: AddressSuggestion[] = predictions.map(
            (prediction) => ({
              placeId: prediction.place_id,
              description: prediction.description,
              mainText: prediction.structured_formatting.main_text,
              secondaryText:
                prediction.structured_formatting.secondary_text || "",
              types: prediction.types,
            }),
          );

          setSuggestions(formattedSuggestions);
          setIsOpen(true);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
          setIsOpen(false);

          if (
            status ===
            window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
          ) {
            setError("No addresses found");
          } else if (
            status ===
            window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT
          ) {
            setError("Search limit reached. Please try again later.");
          } else {
            setError("Address search failed");
          }
        }

        // Record usage
        locationRateLimiter.recordRequest(
          "geocoding",
          identifier,
          status === window.google.maps.places.PlacesServiceStatus.OK,
        );
      });
    } catch (error) {
      setIsLoading(false);
      setSuggestions([]);
      setIsOpen(false);

      if (error instanceof Error) {
        const locationError = LocationErrorHandler.createError(
          "GEOCODING_FAILED" as any,
          error.message,
          error,
        );
        setError(LocationErrorHandler.getUserMessage(locationError));
      } else {
        setError("Address search failed");
      }
    }
  };

  const getPlaceDetails = async (
    placeId: string,
  ): Promise<AddressDetails | null> => {
    if (!placesDetailsService) return null;

    return new Promise((resolve) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: ["address_components", "formatted_address", "geometry"],
      };

      placesDetailsService.getDetails(request, (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          const addressDetails = parseAddressComponents(place);
          resolve(addressDetails);
        } else {
          resolve(null);
        }
      });
    });
  };

  const parseAddressComponents = (
    place: google.maps.places.PlaceResult,
  ): AddressDetails => {
    const components = place.address_components || [];
    let address = "";
    let city = "";
    let state = "";
    let zipCode = "";
    let country = "";

    components.forEach((component) => {
      const types = component.types;

      if (types.includes("street_number")) {
        address = component.long_name + " " + address;
      } else if (types.includes("route")) {
        address = address + component.long_name;
      } else if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.short_name;
      } else if (types.includes("postal_code")) {
        zipCode = component.long_name;
      } else if (types.includes("country")) {
        country = component.short_name;
      }
    });

    // Fallback to formatted address if components are missing
    if (!address && place.formatted_address) {
      address = place.formatted_address;
    }

    const coordinates = place.geometry?.location
      ? {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        }
      : undefined;

    return {
      address: address.trim(),
      city,
      state,
      zipCode,
      country,
      coordinates,
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setError("");

    if (newValue.trim()) {
      debouncedSearch(newValue);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = async (suggestion: AddressSuggestion) => {
    setIsLoading(true);
    setIsOpen(false);
    setSuggestions([]);

    try {
      const details = await getPlaceDetails(suggestion.placeId);

      if (details) {
        onChange(details.address);
        onAddressSelect?.(details);
      } else {
        onChange(suggestion.description);
        setError("Could not get address details");
      }
    } catch (error) {
      onChange(suggestion.description);
      setError("Failed to get address details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

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
          handleSuggestionClick(suggestions[selectedIndex]!);
        }
        break;

      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show fallback if API is not available
  if (apiAvailable === false) {
    return (
      <AddressAutocompleteFallback
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
      />
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "pr-10 pl-10",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500",
            className,
          )}
          disabled={disabled}
          required={required}
          autoComplete="address-line1"
        />
        {isLoading && (
          <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform animate-spin text-gray-400" />
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.placeId}
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm hover:bg-gray-50",
                  index === selectedIndex && "bg-gray-50",
                )}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-gray-900">
                      {suggestion.mainText}
                    </div>
                    {suggestion.secondaryText && (
                      <div className="truncate text-gray-500">
                        {suggestion.secondaryText}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
