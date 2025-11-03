import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { services } from "@/server/db/schema";
import { availabilityCacheService } from "@/server/cache/availability-cache";

export type Service = typeof services.$inferSelect;

export type CreateServiceInput = {
  businessId: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number; // cents
  category?: string;
  bufferTime?: number; // minutes between bookings
  isActive?: boolean;
};

export type UpdateServiceInput = Partial<
  Omit<CreateServiceInput, "businessId">
> & {
  id: string;
  businessId: string; // Required for authorization
};

export class ServiceRepository {
  /**
   * Create a new service
   */
  async create(input: CreateServiceInput): Promise<Service> {
    // Validate required fields
    if (!input.name?.trim()) {
      throw new Error("Service name is required");
    }
    if (!input.businessId?.trim()) {
      throw new Error("Business ID is required");
    }
    if (input.duration <= 0) {
      throw new Error("Service duration must be greater than 0");
    }
    if (input.price < 0) {
      throw new Error("Service price cannot be negative");
    }

    const serviceData = {
      businessId: input.businessId,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      duration: input.duration,
      price: input.price,
      category: input.category?.trim() ?? null,
      bufferTime: input.bufferTime ?? 0,
      isActive: input.isActive ?? true,
    };

    const [service] = await db.insert(services).values(serviceData).returning();

    if (!service) {
      throw new Error("Failed to create service");
    }

    // Invalidate cache after creating service (affects availability calculations)
    await availabilityCacheService.invalidateBusinessCache(input.businessId);

    return service;
  }

  /**
   * Get a service by ID
   */
  async findById(id: string): Promise<Service | null> {
    if (!id?.trim()) {
      return null;
    }

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    return service ?? null;
  }

  /**
   * Get a service by ID for a specific business (for authorization)
   */
  async findByIdAndBusinessId(
    id: string,
    businessId: string,
  ): Promise<Service | null> {
    if (!id?.trim() || !businessId?.trim()) {
      return null;
    }

    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.businessId, businessId)))
      .limit(1);

    return service ?? null;
  }

  /**
   * Get all services for a business
   */
  async findByBusinessId(
    businessId: string,
    includeInactive = false,
  ): Promise<Service[]> {
    if (!businessId?.trim()) {
      return [];
    }

    const conditions = [eq(services.businessId, businessId)];

    if (!includeInactive) {
      conditions.push(eq(services.isActive, true));
    }

    return await db
      .select()
      .from(services)
      .where(and(...conditions))
      .orderBy(desc(services.createdAt));
  }

  /**
   * Update a service
   */
  async update(input: UpdateServiceInput): Promise<Service> {
    if (!input.id?.trim()) {
      throw new Error("Service ID is required");
    }
    if (!input.businessId?.trim()) {
      throw new Error("Business ID is required");
    }

    // Check if service exists and belongs to the business
    const existingService = await this.findByIdAndBusinessId(
      input.id,
      input.businessId,
    );
    if (!existingService) {
      throw new Error("Service not found or access denied");
    }

    // Validate updated fields
    if (input.name !== undefined && !input.name?.trim()) {
      throw new Error("Service name cannot be empty");
    }
    if (input.duration !== undefined && input.duration <= 0) {
      throw new Error("Service duration must be greater than 0");
    }
    if (input.price !== undefined && input.price < 0) {
      throw new Error("Service price cannot be negative");
    }

    // Build update data (only include defined fields)
    const updateData: Partial<typeof services.$inferInsert> = {};

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.description !== undefined)
      updateData.description = input.description?.trim() ?? null;
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.category !== undefined)
      updateData.category = input.category?.trim() ?? null;
    if (input.bufferTime !== undefined)
      updateData.bufferTime = input.bufferTime;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return existingService;
    }

    const [updatedService] = await db
      .update(services)
      .set(updateData)
      .where(
        and(
          eq(services.id, input.id),
          eq(services.businessId, input.businessId),
        ),
      )
      .returning();

    if (!updatedService) {
      throw new Error("Failed to update service");
    }

    // Invalidate cache after updating service (affects availability calculations)
    await availabilityCacheService.invalidateServiceCache(
      input.id,
      input.businessId,
    );

    return updatedService;
  }

  /**
   * Delete a service (soft delete by setting isActive to false)
   */
  async softDelete(id: string, businessId: string): Promise<boolean> {
    if (!id?.trim() || !businessId?.trim()) {
      throw new Error("Service ID and Business ID are required");
    }

    // Check if service exists and belongs to the business
    const existingService = await this.findByIdAndBusinessId(id, businessId);
    if (!existingService) {
      throw new Error("Service not found or access denied");
    }

    const [updatedService] = await db
      .update(services)
      .set({ isActive: false })
      .where(and(eq(services.id, id), eq(services.businessId, businessId)))
      .returning();

    const success = !!updatedService;

    // Invalidate cache after soft deleting service
    if (success) {
      await availabilityCacheService.invalidateServiceCache(id, businessId);
    }

    return success;
  }

  /**
   * Hard delete a service (permanent deletion)
   * Note: This should be used carefully as it will also affect related appointments
   */
  async hardDelete(id: string, businessId: string): Promise<boolean> {
    if (!id?.trim() || !businessId?.trim()) {
      throw new Error("Service ID and Business ID are required");
    }

    // Check if service exists and belongs to the business
    const existingService = await this.findByIdAndBusinessId(id, businessId);
    if (!existingService) {
      throw new Error("Service not found or access denied");
    }

    const result = await db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.businessId, businessId)));

    const success = result.rowsAffected > 0;

    // Invalidate cache after hard deleting service
    if (success) {
      await availabilityCacheService.invalidateServiceCache(id, businessId);
    }

    return success;
  }

  /**
   * Get all services (for efficient bulk operations)
   */
  async findAll(includeInactive = false): Promise<Service[]> {
    const conditions = includeInactive ? [] : [eq(services.isActive, true)];

    return await db
      .select()
      .from(services)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(services.createdAt));
  }

  /**
   * Get active services count for a business
   */
  async getActiveServicesCount(businessId: string): Promise<number> {
    if (!businessId?.trim()) {
      return 0;
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(services)
      .where(
        and(eq(services.businessId, businessId), eq(services.isActive, true)),
      );

    return result[0]?.count ?? 0;
  }
}

// Export a singleton instance
export const serviceRepository = new ServiceRepository();
