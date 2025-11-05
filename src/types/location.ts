/**
 * Location-related TypeScript models and interfaces
 */

// Core coordinate interface
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Address interface
export interface Address {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Location input interface for business setup
export interface LocationInput extends Address {
  coordinates?: Coordinates;
}

// Business location model
export interface BusinessLocationModel {
  id: string;
  businessId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  serviceRadius?: number; // in miles, undefined for unlimited
  createdAt: Date;
  updatedAt: Date;
}

// Customer location model
export interface CustomerLocationModel {
  id: string;
  appointmentId: string;
  latitude?: number;
  longitude?: number;
  zipCode?: string;
  distanceToBusiness?: number; // in miles
  createdAt: Date;
}

// Location cache model
export interface LocationCacheModel {
  id: string;
  addressHash: string;
  latitude: number;
  longitude: number;
  timezone: string;
  expiresAt: Date;
  createdAt: Date;
}

// Search filters for proximity search
export interface SearchFilters {
  radius: number; // in miles
  services?: string[];
  priceRange?: [number, number];
  rating?: number;
  sortBy: "distance" | "rating" | "price";
}

// Business search result with location data
export interface BusinessSearchResult {
  business: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    phone?: string;
    email?: string;
    categoryId: string;
  };
  distance: number; // in miles
  estimatedTravelTime?: number; // in minutes
  coordinates: Coordinates;
  location: BusinessLocationModel;
}

// Address validation result
export interface AddressValidation {
  isValid: boolean;
  formattedAddress?: string;
  coordinates?: Coordinates;
  timezone?: string;
  errors?: string[];
}

// Location error codes
export enum LocationErrorCode {
  GEOLOCATION_DENIED = "GEOLOCATION_DENIED",
  GEOLOCATION_UNAVAILABLE = "GEOLOCATION_UNAVAILABLE",
  GEOCODING_FAILED = "GEOCODING_FAILED",
  INVALID_COORDINATES = "INVALID_COORDINATES",
  OUTSIDE_SERVICE_AREA = "OUTSIDE_SERVICE_AREA",
  TIMEZONE_DETECTION_FAILED = "TIMEZONE_DETECTION_FAILED",
  MAP_LOADING_FAILED = "MAP_LOADING_FAILED",
}

// Location error class
export class LocationError extends Error {
  constructor(
    public code: LocationErrorCode,
    message: string,
    public fallbackAction?: string,
  ) {
    super(message);
    this.name = "LocationError";
  }
}

// Service interfaces for location functionality
export interface BusinessLocationService {
  updateLocation(
    businessId: string,
    locationData: LocationInput,
  ): Promise<BusinessLocationModel>;
  validateAddress(address: string): Promise<AddressValidation>;
  getCoordinates(address: string): Promise<Coordinates>;
  setServiceRadius(businessId: string, radius: number): Promise<void>;
  getBusinessLocation(
    businessId: string,
  ): Promise<BusinessLocationModel | null>;
}

export interface ProximitySearchService {
  searchNearby(
    location: Coordinates,
    filters: SearchFilters,
  ): Promise<BusinessSearchResult[]>;
  calculateDistance(from: Coordinates, to: Coordinates): Promise<number>;
  getBusinessesInRadius(
    center: Coordinates,
    radius: number,
  ): Promise<BusinessSearchResult[]>;
  validateServiceArea(
    businessId: string,
    customerLocation: Coordinates,
  ): Promise<boolean>;
}

export interface GeolocationService {
  getCurrentLocation(): Promise<Coordinates>;
  geocodeAddress(address: string): Promise<Coordinates>;
  reverseGeocode(coordinates: Coordinates): Promise<Address>;
  requestLocationPermission(): Promise<boolean>;
}

export interface TimezoneService {
  detectTimezone(coordinates: Coordinates): Promise<string>;
  convertToBusinessTime(
    customerTime: Date,
    businessTimezone: string,
  ): Promise<Date>;
  convertToCustomerTime(
    businessTime: Date,
    customerTimezone: string,
  ): Promise<Date>;
  formatTimeWithTimezone(time: Date, timezone: string): string;
  updateAppointmentTimezones(
    businessId: string,
    newTimezone: string,
  ): Promise<void>;
}
