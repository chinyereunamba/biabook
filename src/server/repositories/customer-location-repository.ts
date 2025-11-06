import { db } from "@/server/db";
import { customerLocations, appointments } from "@/server/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export interface CustomerLocationData {
  appointmentId: string;
  latitude?: number;
  longitude?: number;
  zipCode?: string;
  distanceToBusiness?: number;
}

export interface CustomerLocationAnalytics {
  totalCustomers: number;
  averageDistance: number;
  commonZipCodes: Array<{ zipCode: string; count: number }>;
  locationData: Array<{
    latitude?: number;
    longitude?: number;
    zipCode?: string;
    distanceToBusiness?: number;
  }>;
}

export class CustomerLocationRepository {
  /**
   * Create a new customer location record
   */
  async create(data: CustomerLocationData) {
    const [result] = await db
      .insert(customerLocations)
      .values({
        appointmentId: data.appointmentId,
        latitude: data.latitude,
        longitude: data.longitude,
        zipCode: data.zipCode,
        distanceToBusiness: data.distanceToBusiness,
      })
      .returning();

    return result;
  }

  /**
   * Get customer location by appointment ID
   */
  async getByAppointmentId(appointmentId: string) {
    return await db.query.customerLocations.findFirst({
      where: eq(customerLocations.appointmentId, appointmentId),
    });
  }

  /**
   * Get aggregated location analytics for a business
   */
  async getLocationAnalytics(
    businessId: string,
  ): Promise<CustomerLocationAnalytics> {
    // Get all customer locations for appointments at this business
    const locations = await db
      .select({
        latitude: customerLocations.latitude,
        longitude: customerLocations.longitude,
        zipCode: customerLocations.zipCode,
        distanceToBusiness: customerLocations.distanceToBusiness,
      })
      .from(customerLocations)
      .innerJoin(
        appointments,
        eq(customerLocations.appointmentId, appointments.id),
      )
      .where(eq(appointments.businessId, businessId));

    // Calculate analytics
    const totalCustomers = locations.length;

    // Calculate average distance (only for records with distance data)
    const locationsWithDistance = locations.filter(
      (l) => l.distanceToBusiness !== null,
    );
    const averageDistance =
      locationsWithDistance.length > 0
        ? locationsWithDistance.reduce(
            (sum, l) => sum + (l.distanceToBusiness || 0),
            0,
          ) / locationsWithDistance.length
        : 0;

    // Get common zip codes
    const zipCodeCounts = new Map<string, number>();
    locations.forEach((location) => {
      if (location.zipCode) {
        zipCodeCounts.set(
          location.zipCode,
          (zipCodeCounts.get(location.zipCode) || 0) + 1,
        );
      }
    });

    const commonZipCodes = Array.from(zipCodeCounts.entries())
      .map(([zipCode, count]) => ({ zipCode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 zip codes

    return {
      totalCustomers,
      averageDistance: Math.round(averageDistance * 100) / 100, // Round to 2 decimal places
      commonZipCodes,
      locationData: locations.map((loc) => ({
        latitude: loc.latitude ?? undefined,
        longitude: loc.longitude ?? undefined,
        zipCode: loc.zipCode ?? undefined,
        distanceToBusiness: loc.distanceToBusiness ?? undefined,
      })),
    };
  }

  /**
   * Get customer locations for heat map visualization
   * Returns only coordinates (privacy-compliant aggregation)
   */
  async getHeatMapData(businessId: string) {
    const locations = await db
      .select({
        latitude: customerLocations.latitude,
        longitude: customerLocations.longitude,
      })
      .from(customerLocations)
      .innerJoin(
        appointments,
        eq(customerLocations.appointmentId, appointments.id),
      )
      .where(
        and(
          eq(appointments.businessId, businessId),
          isNotNull(customerLocations.latitude),
          isNotNull(customerLocations.longitude),
        ),
      );

    return locations.filter((l) => l.latitude !== null && l.longitude !== null);
  }
}

export const customerLocationRepository = new CustomerLocationRepository();
