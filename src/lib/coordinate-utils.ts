/**
 * Coordinate validation and utility functions
 */

import type { Coordinates } from "@/types/location";
import { LocationValidationError } from "./location-validation";

/**
 * Earth's radius in miles (used for distance calculations)
 */
export const EARTH_RADIUS_MILES = 3959;

/**
 * Earth's radius in kilometers
 */
export const EARTH_RADIUS_KM = 6371;

/**
 * Maximum valid latitude value
 */
export const MAX_LATITUDE = 90;

/**
 * Minimum valid latitude value
 */
export const MIN_LATITUDE = -90;

/**
 * Maximum valid longitude value
 */
export const MAX_LONGITUDE = 180;

/**
 * Minimum valid longitude value
 */
export const MIN_LONGITUDE = -180;

/**
 * Validates that coordinates are within valid geographic bounds
 */
export function validateCoordinateBounds(
  latitude: number,
  longitude: number,
): void {
  if (latitude < MIN_LATITUDE || latitude > MAX_LATITUDE) {
    throw new LocationValidationError(
      `Latitude must be between ${MIN_LATITUDE} and ${MAX_LATITUDE}`,
      "latitude",
      latitude,
    );
  }

  if (longitude < MIN_LONGITUDE || longitude > MAX_LONGITUDE) {
    throw new LocationValidationError(
      `Longitude must be between ${MIN_LONGITUDE} and ${MAX_LONGITUDE}`,
      "longitude",
      longitude,
    );
  }
}

/**
 * Validates coordinate precision (ensures reasonable precision for location data)
 */
export function validateCoordinatePrecision(
  latitude: number,
  longitude: number,
): void {
  // Check for unreasonable precision (more than 8 decimal places)
  const latStr = latitude.toString();
  const lngStr = longitude.toString();

  const latDecimals = latStr.includes(".")
    ? (latStr.split(".")[1]?.length ?? 0)
    : 0;
  const lngDecimals = lngStr.includes(".")
    ? (lngStr.split(".")[1]?.length ?? 0)
    : 0;

  if (latDecimals > 8 || lngDecimals > 8) {
    throw new LocationValidationError(
      "Coordinate precision should not exceed 8 decimal places",
      "coordinates",
      { latitude, longitude },
    );
  }
}

/**
 * Normalizes coordinates to a standard precision (6 decimal places)
 */
export function normalizeCoordinates(coordinates: Coordinates): Coordinates {
  return {
    latitude: Math.round(coordinates.latitude * 1000000) / 1000000,
    longitude: Math.round(coordinates.longitude * 1000000) / 1000000,
    accuracy: coordinates.accuracy,
  };
}

/**
 * Checks if two coordinate points are approximately equal within a tolerance
 */
export function areCoordinatesEqual(
  coord1: Coordinates,
  coord2: Coordinates,
  toleranceMeters = 10,
): boolean {
  const distance = calculateDistanceInMeters(coord1, coord2);
  return distance <= toleranceMeters;
}

/**
 * Calculates the distance between two coordinate points using the Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  validateCoordinateBounds(from.latitude, from.longitude);
  validateCoordinateBounds(to.latitude, to.longitude);

  const lat1Rad = (from.latitude * Math.PI) / 180;
  const lat2Rad = (to.latitude * Math.PI) / 180;
  const deltaLatRad = ((to.latitude - from.latitude) * Math.PI) / 180;
  const deltaLngRad = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) *
      Math.sin(deltaLngRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

/**
 * Calculates the distance between two coordinate points in meters
 */
export function calculateDistanceInMeters(
  from: Coordinates,
  to: Coordinates,
): number {
  const distanceInMiles = calculateDistance(from, to);
  return distanceInMiles * 1609.34; // Convert miles to meters
}

/**
 * Calculates the distance between two coordinate points in kilometers
 */
export function calculateDistanceInKm(
  from: Coordinates,
  to: Coordinates,
): number {
  const distanceInMiles = calculateDistance(from, to);
  return distanceInMiles * 1.60934; // Convert miles to kilometers
}

/**
 * Creates a bounding box around a center point with a given radius
 * Returns the northeast and southwest corners of the bounding box
 */
export function createBoundingBox(
  center: Coordinates,
  radiusMiles: number,
): {
  northeast: Coordinates;
  southwest: Coordinates;
} {
  validateCoordinateBounds(center.latitude, center.longitude);

  if (radiusMiles <= 0) {
    throw new LocationValidationError(
      "Radius must be positive",
      "radius",
      radiusMiles,
    );
  }

  // Convert radius from miles to degrees (approximate)
  const latDelta = radiusMiles / 69; // 1 degree latitude ≈ 69 miles
  const lngDelta =
    radiusMiles / (69 * Math.cos((center.latitude * Math.PI) / 180));

  const northeast: Coordinates = {
    latitude: Math.min(center.latitude + latDelta, MAX_LATITUDE),
    longitude: Math.min(center.longitude + lngDelta, MAX_LONGITUDE),
  };

  const southwest: Coordinates = {
    latitude: Math.max(center.latitude - latDelta, MIN_LATITUDE),
    longitude: Math.max(center.longitude - lngDelta, MIN_LONGITUDE),
  };

  return { northeast, southwest };
}

/**
 * Checks if a coordinate point is within a bounding box
 */
export function isWithinBoundingBox(
  point: Coordinates,
  boundingBox: {
    northeast: Coordinates;
    southwest: Coordinates;
  },
): boolean {
  return (
    point.latitude >= boundingBox.southwest.latitude &&
    point.latitude <= boundingBox.northeast.latitude &&
    point.longitude >= boundingBox.southwest.longitude &&
    point.longitude <= boundingBox.northeast.longitude
  );
}

/**
 * Checks if a coordinate point is within a circular radius from a center point
 */
export function isWithinRadius(
  point: Coordinates,
  center: Coordinates,
  radiusMiles: number,
): boolean {
  const distance = calculateDistance(point, center);
  return distance <= radiusMiles;
}

/**
 * Converts degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates the bearing (direction) from one coordinate to another
 * Returns bearing in degrees (0-360)
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  validateCoordinateBounds(from.latitude, from.longitude);
  validateCoordinateBounds(to.latitude, to.longitude);

  const lat1Rad = degreesToRadians(from.latitude);
  const lat2Rad = degreesToRadians(to.latitude);
  const deltaLngRad = degreesToRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLngRad) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLngRad);

  const bearingRad = Math.atan2(y, x);
  const bearingDeg = radiansToDegrees(bearingRad);

  // Normalize to 0-360 degrees
  return (bearingDeg + 360) % 360;
}

/**
 * Formats coordinates for display
 */
export function formatCoordinates(
  coordinates: Coordinates,
  precision = 6,
): string {
  const lat = coordinates.latitude.toFixed(precision);
  const lng = coordinates.longitude.toFixed(precision);
  return `${lat}, ${lng}`;
}

/**
 * Parses coordinate string in various formats
 * Supports formats like: "40.7128, -74.0060", "40.7128,-74.0060", etc.
 */
export function parseCoordinateString(coordString: string): Coordinates {
  const cleaned = coordString.trim().replace(/\s+/g, " ");
  const parts = cleaned.split(/[,\s]+/);

  if (parts.length !== 2) {
    throw new LocationValidationError(
      "Coordinate string must contain exactly two numbers separated by comma or space",
      "coordinates",
      coordString,
    );
  }

  const latitude = parseFloat(parts[0]!);
  const longitude = parseFloat(parts[1]!);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new LocationValidationError(
      "Invalid coordinate values",
      "coordinates",
      coordString,
    );
  }

  validateCoordinateBounds(latitude, longitude);

  return { latitude, longitude };
}

/**
 * Generates a random coordinate within a bounding box (useful for testing)
 */
export function generateRandomCoordinate(boundingBox: {
  northeast: Coordinates;
  southwest: Coordinates;
}): Coordinates {
  const latitude =
    Math.random() *
      (boundingBox.northeast.latitude - boundingBox.southwest.latitude) +
    boundingBox.southwest.latitude;

  const longitude =
    Math.random() *
      (boundingBox.northeast.longitude - boundingBox.southwest.longitude) +
    boundingBox.southwest.longitude;

  return { latitude, longitude };
}
