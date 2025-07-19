import { eq, and, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { weeklyAvailability } from "@/server/db/schema";
import {
    isValidTimeFormat,
    isValidDayOfWeek,
    isEndTimeAfterStartTime,
    isTimeOverlapping
} from "./utils/availability-validation";

export type WeeklyAvailability = typeof weeklyAvailability.$inferSelect;

export type CreateWeeklyAvailabilityInput = {
    businessId: string;
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    isAvailable?: boolean;
};

export type UpdateWeeklyAvailabilityInput = Partial<Omit<CreateWeeklyAvailabilityInput, 'businessId' | 'dayOfWeek'>> & {
    id: string;
    businessId: string; // Required for authorization
};

export type UpsertWeeklyAvailabilityInput = Omit<CreateWeeklyAvailabilityInput, 'businessId'> & {
    businessId: string;
};

export class WeeklyAvailabilityRepository {
    /**
     * Create a new weekly availability entry
     */
    async create(input: CreateWeeklyAvailabilityInput): Promise<WeeklyAvailability> {
        // Validate required fields
        if (!input.businessId?.trim()) {
            throw new Error("Business ID is required");
        }
        if (!isValidDayOfWeek(input.dayOfWeek)) {
            throw new Error("Day of week must be between 0 (Sunday) and 6 (Saturday)");
        }
        if (!isValidTimeFormat(input.startTime)) {
            throw new Error("Start time must be in HH:MM format");
        }
        if (!isValidTimeFormat(input.endTime)) {
            throw new Error("End time must be in HH:MM format");
        }
        if (!isEndTimeAfterStartTime(input.startTime, input.endTime)) {
            throw new Error("End time must be after start time");
        }

        // Check for overlapping availability for the same day
        const existingAvailability = await this.findByBusinessIdAndDay(input.businessId, input.dayOfWeek);
        if (existingAvailability.length > 0) {
            for (const existing of existingAvailability) {
                if (isTimeOverlapping(input.startTime, input.endTime, existing.startTime, existing.endTime)) {
                    throw new Error("This time range overlaps with existing availability for this day");
                }
            }
        }

        const availabilityData = {
            businessId: input.businessId,
            dayOfWeek: input.dayOfWeek,
            startTime: input.startTime,
            endTime: input.endTime,
            isAvailable: input.isAvailable ?? true,
        };

        const [availability] = await db.insert(weeklyAvailability).values(availabilityData).returning();

        if (!availability) {
            throw new Error("Failed to create weekly availability");
        }

        return availability;
    }

    /**
     * Get a weekly availability entry by ID
     */
    async findById(id: string): Promise<WeeklyAvailability | null> {
        if (!id?.trim()) {
            return null;
        }

        const [availability] = await db
            .select()
            .from(weeklyAvailability)
            .where(eq(weeklyAvailability.id, id))
            .limit(1);

        return availability || null;
    }

    /**
     * Get a weekly availability entry by ID for a specific business (for authorization)
     */
    async findByIdAndBusinessId(id: string, businessId: string): Promise<WeeklyAvailability | null> {
        if (!id?.trim() || !businessId?.trim()) {
            return null;
        }

        const [availability] = await db
            .select()
            .from(weeklyAvailability)
            .where(and(eq(weeklyAvailability.id, id), eq(weeklyAvailability.businessId, businessId)))
            .limit(1);

        return availability || null;
    }

    /**
     * Get all weekly availability entries for a business
     */
    async findByBusinessId(businessId: string, onlyAvailable = false): Promise<WeeklyAvailability[]> {
        if (!businessId?.trim()) {
            return [];
        }

        const conditions = [eq(weeklyAvailability.businessId, businessId)];

        if (onlyAvailable) {
            conditions.push(eq(weeklyAvailability.isAvailable, true));
        }

        return await db
            .select()
            .from(weeklyAvailability)
            .where(and(...conditions))
            .orderBy(weeklyAvailability.dayOfWeek);
    }

    /**
     * Get all weekly availability entries for a business on a specific day
     */
    async findByBusinessIdAndDay(businessId: string, dayOfWeek: number): Promise<WeeklyAvailability[]> {
        if (!businessId?.trim() || dayOfWeek < 0 || dayOfWeek > 6) {
            return [];
        }

        return await db
            .select()
            .from(weeklyAvailability)
            .where(and(
                eq(weeklyAvailability.businessId, businessId),
                eq(weeklyAvailability.dayOfWeek, dayOfWeek)
            ))
            .orderBy(weeklyAvailability.startTime);
    }

    /**
     * Update a weekly availability entry
     */
    async update(input: UpdateWeeklyAvailabilityInput): Promise<WeeklyAvailability> {
        if (!input.id?.trim()) {
            throw new Error("Weekly availability ID is required");
        }
        if (!input.businessId?.trim()) {
            throw new Error("Business ID is required");
        }

        // Check if availability exists and belongs to the business
        const existingAvailability = await this.findByIdAndBusinessId(input.id, input.businessId);
        if (!existingAvailability) {
            throw new Error("Weekly availability not found or access denied");
        }

        // Validate updated fields
        if (input.startTime && !isValidTimeFormat(input.startTime)) {
            throw new Error("Start time must be in HH:MM format");
        }
        if (input.endTime && !isValidTimeFormat(input.endTime)) {
            throw new Error("End time must be in HH:MM format");
        }

        const startTime = input.startTime || existingAvailability.startTime;
        const endTime = input.endTime || existingAvailability.endTime;

        if (!isEndTimeAfterStartTime(startTime, endTime)) {
            throw new Error("End time must be after start time");
        }

        // Check for overlapping availability for the same day (excluding this entry)
        const otherAvailability = await db
            .select()
            .from(weeklyAvailability)
            .where(and(
                eq(weeklyAvailability.businessId, input.businessId),
                eq(weeklyAvailability.dayOfWeek, existingAvailability.dayOfWeek),
                sql`${weeklyAvailability.id} != ${input.id}`
            ));

        for (const other of otherAvailability) {
            if (isTimeOverlapping(startTime, endTime, other.startTime, other.endTime)) {
                throw new Error("This time range overlaps with existing availability for this day");
            }
        }

        // Build update data (only include defined fields)
        const updateData: Partial<typeof weeklyAvailability.$inferInsert> = {};

        if (input.startTime !== undefined) updateData.startTime = input.startTime;
        if (input.endTime !== undefined) updateData.endTime = input.endTime;
        if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable;

        // Only update if there are changes
        if (Object.keys(updateData).length === 0) {
            return existingAvailability;
        }

        const [updatedAvailability] = await db
            .update(weeklyAvailability)
            .set(updateData)
            .where(and(eq(weeklyAvailability.id, input.id), eq(weeklyAvailability.businessId, input.businessId)))
            .returning();

        if (!updatedAvailability) {
            throw new Error("Failed to update weekly availability");
        }

        return updatedAvailability;
    }

    /**
     * Delete a weekly availability entry
     */
    async delete(id: string, businessId: string): Promise<boolean> {
        if (!id?.trim() || !businessId?.trim()) {
            throw new Error("Weekly availability ID and Business ID are required");
        }

        // Check if availability exists and belongs to the business
        const existingAvailability = await this.findByIdAndBusinessId(id, businessId);
        if (!existingAvailability) {
            throw new Error("Weekly availability not found or access denied");
        }

        const result = await db
            .delete(weeklyAvailability)
            .where(and(eq(weeklyAvailability.id, id), eq(weeklyAvailability.businessId, businessId)));

        return result.rowsAffected > 0;
    }

    /**
     * Delete all weekly availability entries for a business
     */
    async deleteAllForBusiness(businessId: string): Promise<boolean> {
        if (!businessId?.trim()) {
            throw new Error("Business ID is required");
        }

        const result = await db
            .delete(weeklyAvailability)
            .where(eq(weeklyAvailability.businessId, businessId));

        return result.rowsAffected > 0;
    }

    /**
     * Upsert weekly availability (create if not exists, update if exists)
     * This is useful for bulk setting availability for a business
     */
    async upsert(input: UpsertWeeklyAvailabilityInput): Promise<WeeklyAvailability> {
        // Find existing availability for this day
        const existingAvailability = await this.findByBusinessIdAndDay(input.businessId, input.dayOfWeek);

        // If no existing availability, create new
        if (existingAvailability.length === 0) {
            return await this.create(input);
        }

        // Check for overlapping times with other entries for this day
        for (const existing of existingAvailability) {
            if (isTimeOverlapping(input.startTime, input.endTime, existing.startTime, existing.endTime)) {
                // If exact match, update this entry
                if (input.startTime === existing.startTime && input.endTime === existing.endTime) {
                    return await this.update({
                        id: existing.id,
                        businessId: input.businessId,
                        isAvailable: input.isAvailable
                    });
                } else {
                    throw new Error("This time range overlaps with existing availability for this day");
                }
            }
        }

        // No overlap, create new entry
        return await this.create(input);
    }

    /**
     * Bulk set weekly availability for a business
     * This replaces all existing availability for the specified days
     */
    async bulkSet(businessId: string, availabilityEntries: Omit<CreateWeeklyAvailabilityInput, 'businessId'>[]): Promise<WeeklyAvailability[]> {
        if (!businessId?.trim()) {
            throw new Error("Business ID is required");
        }

        if (!availabilityEntries.length) {
            throw new Error("At least one availability entry is required");
        }

        // Validate all entries
        for (const entry of availabilityEntries) {
            if (!isValidDayOfWeek(entry.dayOfWeek)) {
                throw new Error("Day of week must be between 0 (Sunday) and 6 (Saturday)");
            }
            if (!isValidTimeFormat(entry.startTime)) {
                throw new Error("Start time must be in HH:MM format");
            }
            if (!isValidTimeFormat(entry.endTime)) {
                throw new Error("End time must be in HH:MM format");
            }
            if (!isEndTimeAfterStartTime(entry.startTime, entry.endTime)) {
                throw new Error("End time must be after start time");
            }
        }

        // Group entries by day of week
        const entriesByDay = availabilityEntries.reduce<Record<number, typeof availabilityEntries>>((acc, entry) => {
            const day = entry.dayOfWeek;
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(entry);
            return acc;
        }, {});

        // Check for overlapping times within the same day
        for (const dayOfWeek in entriesByDay) {
            const entries = entriesByDay[dayOfWeek] || [];
            for (let i = 0; i < entries.length; i++) {
                for (let j = i + 1; j < entries.length; j++) {
                    const entry1 = entries[i];
                    const entry2 = entries[j];
                    if (entry1 && entry2 && isTimeOverlapping(
                        entry1.startTime,
                        entry1.endTime,
                        entry2.startTime,
                        entry2.endTime
                    )) {
                        throw new Error(`Overlapping time ranges for day ${dayOfWeek}`);
                    }
                }
            }
        }

        // Start a transaction
        const result = await db.transaction(async (tx) => {
            // Delete all existing availability for this business
            await tx
                .delete(weeklyAvailability)
                .where(eq(weeklyAvailability.businessId, businessId));

            // Insert all new availability entries
            const insertPromises = availabilityEntries.map(entry =>
                tx.insert(weeklyAvailability).values({
                    businessId,
                    dayOfWeek: entry.dayOfWeek,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                    isAvailable: entry.isAvailable ?? true,
                }).returning()
            );

            const insertResults = await Promise.all(insertPromises);
            // Filter out any undefined results and ensure we have a valid array
            return insertResults
                .map(result => result[0])
                .filter((item): item is WeeklyAvailability => item !== undefined);
        });

        return result;
    }

    /**
     * Check if a business has any availability set
     */
    async hasAvailability(businessId: string): Promise<boolean> {
        if (!businessId?.trim()) {
            return false;
        }

        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(weeklyAvailability)
            .where(eq(weeklyAvailability.businessId, businessId));

        return (result[0]?.count || 0) > 0;
    }

    // Using shared validation utilities from availability-validation.ts
}

// Export a singleton instance
export const weeklyAvailabilityRepository = new WeeklyAvailabilityRepository();