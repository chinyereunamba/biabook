/**
 * Distance calculation utilities for location-based features
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DistanceResult {
  distance: number; // in miles
  estimatedTravelTime?: number; // in minutes
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param from Starting coordinates
 * @param to Destination coordinates
 * @returns Distance in miles
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 3959; // Earth's radius in miles

  const lat1Rad = toRadians(from.latitude);
  const lat2Rad = toRadians(to.latitude);
  const deltaLatRad = toRadians(to.latitude - from.latitude);
  const deltaLonRad = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Estimate travel time based on distance
 * Uses average driving speed assumptions
 * @param distance Distance in miles
 * @returns Estimated travel time in minutes
 */
export function estimateTravelTime(distance: number): number {
  // Average speeds based on distance ranges
  let avgSpeed: number;

  if (distance <= 5) {
    avgSpeed = 25; // City driving
  } else if (distance <= 20) {
    avgSpeed = 35; // Suburban driving
  } else {
    avgSpeed = 50; // Highway driving
  }

  const timeInHours = distance / avgSpeed;
  return Math.round(timeInHours * 60); // Convert to minutes
}

/**
 * Calculate distance with travel time estimation
 * @param from Starting coordinates
 * @param to Destination coordinates
 * @returns Distance and estimated travel time
 */
export function calculateDistanceWithTime(
  from: Coordinates,
  to: Coordinates,
): DistanceResult {
  const distance = calculateDistance(from, to);
  const estimatedTravelTime = estimateTravelTime(distance);

  return {
    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
    estimatedTravelTime,
  };
}

/**
 * Create a bounding box around a center point with given radius
 * Used for optimizing database queries before calculating exact distances
 * @param center Center coordinates
 * @param radiusMiles Radius in miles
 * @returns Bounding box coordinates
 */
export function createBoundingBox(
  center: Coordinates,
  radiusMiles: number,
): BoundingBox {
  // Approximate degrees per mile (varies by latitude, but good enough for bounding box)
  const latDegreesPerMile = 1 / 69;
  const lonDegreesPerMile = 1 / (69 * Math.cos(toRadians(center.latitude)));

  const latOffset = radiusMiles * latDegreesPerMile;
  const lonOffset = radiusMiles * lonDegreesPerMile;

  return {
    north: center.latitude + latOffset,
    south: center.latitude - latOffset,
    east: center.longitude + lonOffset,
    west: center.longitude - lonOffset,
  };
}

/**
 * Check if coordinates are within a bounding box
 * @param coordinates Coordinates to check
 * @param boundingBox Bounding box to check against
 * @returns True if coordinates are within the bounding box
 */
export function isWithinBoundingBox(
  coordinates: Coordinates,
  boundingBox: BoundingBox,
): boolean {
  return (
    coordinates.latitude >= boundingBox.south &&
    coordinates.latitude <= boundingBox.north &&
    coordinates.longitude >= boundingBox.west &&
    coordinates.longitude <= boundingBox.east
  );
}

/**
 * Sort locations by distance from a reference point
 * @param locations Array of locations with coordinates
 * @param referencePoint Reference coordinates
 * @returns Sorted array with distance information
 */
export function sortByDistance<T extends { coordinates: Coordinates }>(
  locations: T[],
  referencePoint: Coordinates,
): Array<T & { distance: number; estimatedTravelTime: number }> {
  return locations
    .map((location) => {
      const result = calculateDistanceWithTime(
        referencePoint,
        location.coordinates,
      );
      return {
        ...location,
        distance: result.distance,
        estimatedTravelTime: result.estimatedTravelTime || 0,
      };
    })
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter locations within a specified radius
 * @param locations Array of locations with coordinates
 * @param center Center coordinates
 * @param radiusMiles Maximum radius in miles
 * @returns Filtered array of locations within radius
 */
export function filterByRadius<T extends { coordinates: Coordinates }>(
  locations: T[],
  center: Coordinates,
  radiusMiles: number,
): T[] {
  return locations.filter((location) => {
    const distance = calculateDistance(center, location.coordinates);
    return distance <= radiusMiles;
  });
}

/**
 * Convert degrees to radians
 * @param degrees Degrees to convert
 * @returns Radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate coordinates
 * @param coordinates Coordinates to validate
 * @returns True if coordinates are valid
 */
export function validateCoordinates(coordinates: Coordinates): boolean {
  return (
    typeof coordinates.latitude === "number" &&
    typeof coordinates.longitude === "number" &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180 &&
    !isNaN(coordinates.latitude) &&
    !isNaN(coordinates.longitude)
  );
}
