import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "@/server/db";
import { availabilityExceptions } from "@/server/db/schema";
import {
    isValidTimeFormat,
    isValidDateFormat,
    isEndTimeAfterStartTime
} from "./utils/availability-validation";

export type AvailabilityException = typeof availabilityExceptions.$inferSelect;

export type CreateAvailabilityExceptionInput = {
    businessId: string;
    date: string; // YYYY-MM-DD format
    startTime?: string; // HH:MM format, null if closed all day
    endTime?: string; // HH:MM format, null if closed all day
    isAvailable?: boolean;
    reason?: string;
};

export type UpdateAvailabilityExceptionInput = Partial<Omit<CreateAvailabilityExceptionInput, 'businessId' | 'date'>> & {
    id: string;
    businessId: string; // Required for authorization
};

export class AvailabilityExceptionRepository {
    /**
     * Create a new availability exception
     */
    async create(input: CreateAvailabilityExceptionInput): Promise<AvailabilityException> {
        // Validate required fields
        if (!input.businessId?.trim()) {
            throw new Error("Business ID is required");
        }
        if (!isValidDateFormat(input.date)) {
            throw new Error("Date must be in YYYY-MM-DD format");
        }

        // If providing times, validate them
        if (input.startTime && !isValidTimeFormat(input.startTime)) {
            throw new Error("Start time must be in HH:MM format");
        }
        if (input.endTime && !isValidTimeFormat(input.endTime)) {
            throw new Error("End time must be in HH:MM format");
        }

        // If both times are provided, validate end time is after start time
        if (input.startTime && input.endTime && !isEndTimeAfterStartTime(input.startTime, input.endTime)) {
            throw new Error("End time must be after start time");
        }

        // Check for existing exception on the same date
        const existingException = await this.findByBusinessIdAndDate(input.businessId, input.date);
        if (existingException) {
            throw new Error("An exception already exists for this date");
        }

        const exceptionData = {
            businessId: input.businessId,
            date: input.date,
            startTime: input.startTime || null,
            endTime: input.endTime || null,
            isAvailable: input.isAvailable ?? false, // Default to unavailable for exceptions
            reason: input.reason?.trim() || null,
        };

        const [exception] = await db.insert(availabilityExceptions).values(exceptionData).returning();

        if (!exception) {
            throw new Error("Failed to create availability exception");
        }

        return exception;
    }

    /**
     * Get an availability exception by ID
     */
    async findById(id: string): Promise<AvailabilityException | null> {
        if (!id?.trim()) {
            return null;
        }

        const [exception] = await db
            .select()
            .from(availabilityExceptions)
            .where(eq(availabilityExceptions.id, id))
            .limit(1);

        return exception || null;
    }

    /**
     * Get an availability exception by ID for a specific business (for authorization)
     */
    async findByIdAndBusinessId(id: string, businessId: string): Promise<AvailabilityException | null> {
        if (!id?.trim() || !businessId?.trim()) {
            return null;
        }

        const [exception] = await db
            .select()
            .from(availabilityExceptions)
            .where(and(eq(availabilityExceptions.id, id), eq(availabilityExceptions.businessId, businessId)))
            .limit(1);

        return exception || null;
    }

    /**
     * Get an availability exception by date for a specific business
     */
    async findByBusinessIdAndDate(businessId: string, date: string): Promise<AvailabilityException | null> {
        if (!businessId?.trim() || !isValidDateFormat(date)) {
            return null;
        }

        const [exception] = await db
            .select()
            .from(availabilityExceptions)
            .where(and(eq(availabilityExceptions.businessId, businessId), eq(availabilityExceptions.date, date)))
            .limit(1);

        return exception || null;
    }

    /**
     * Get all availability exceptions for a business
     */
    async findByBusinessId(businessId: string): Promise<AvailabilityException[]> {
        if (!businessId?.trim()) {
            return [];
        }

        return await db
            .select()
            .from(availabilityExceptions)
            .where(eq(availabilityExceptions.businessId, businessId))
            .orderBy(availabilityExceptions.date);
    }

    /**
     * Get all availability exceptions for a business within a date range
     */
    async findByBusinessIdAndDateRange(
        businessId: string,
        startDate: string,
        endDate: string
    ): Promise<AvailabilityException[]> {
        if (!businessId?.trim() || !isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
            return [];
        }

        return await db
            .select()
            .from(availabilityExceptions)
            .where(and(
                eq(availabilityExceptions.businessId, businessId),
                gte(availabilityExceptions.date, startDate),
                lte(availabilityExceptions.date, endDate)
            ))
            .orderBy(availabilityExceptions.date);
    }

    /**
     * Update an availability exception
     */
    async update(input: UpdateAvailabilityExceptionInput): Promise<AvailabilityException> {
        if (!input.id?.trim()) {
            throw new Error("Availability exception ID is required");
        }
        if (!input.businessId?.trim()) {
            throw new Error("Business ID is required");
        }

        // Check if exception exists and belongs to the business
        const existingException = await this.findByIdAndBusinessId(input.id, input.businessId);
        if (!existingException) {
            throw new Error("Availability exception not found or access denied");
        }

        // Validate updated fields
        if (input.startTime && !isValidTimeFormat(input.startTime)) {
            throw new Error("Start time must be in HH:MM format");
        }
        if (input.endTime && !isValidTimeFormat(input.endTime)) {
            throw new Error("End time must be in HH:MM format");
        }

        // If both times are provided or we're updating one while keeping the other
        const startTime = input.startTime !== undefined ? input.startTime : existingException.startTime;
        const endTime = input.endTime !== undefined ? input.endTime : existingException.endTime;

        if (startTime && endTime && !isEndTimeAfterStartTime(startTime, endTime)) {
            throw new Error("End time must be after start time");
        }

        // Build update data (only include defined fields)
        const updateData: Partial<typeof availabilityExceptions.$inferInsert> = {};

        if (input.startTime !== undefined) updateData.startTime = input.startTime || null;
        if (input.endTime !== undefined) updateData.endTime = input.endTime || null;
        if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable;
        if (input.reason !== undefined) updateData.reason = input.reason?.trim() || null;

        // Only update if there are changes
        if (Object.keys(updateData).length === 0) {
            return existingException;
        }

        const [updatedException] = await db
            .update(availabilityExceptions)
            .set(updateData)
            .where(and(eq(availabilityExceptions.id, input.id), eq(availabilityExceptions.businessId, input.businessId)))
            .returning();

        if (!updatedException) {
            throw new Error("Failed to update availability exception");
        }

        return updatedException;
    }

    /**
     * Delete an availability exception
     */
    async delete(id: string, businessId: string): Promise<boolean> {
        if (!id?.trim() || !businessId?.trim()) {
            throw new Error("Availability exception ID and Business ID are required");
        }

        // Check if exception exists and belongs to the business
        const existingException = await this.findByIdAndBusinessId(id, businessId);
        if (!existingException) {
            throw new Error("Availability exception not found or access denied");
        }

        const result = await db
            .delete(availabilityExceptions)
            .where(and(eq(availabilityExceptions.id, id), eq(availabilityExceptions.businessId, businessId)));

        return result.rowsAffected > 0;
    }

    /**
     * Delete all availability exceptions for a business
     */
    async deleteAllForBusiness(businessId: string): Promise<boolean> {
        if (!businessId?.trim()) {
            throw new Error("Business ID is required");
        }

        const result = await db
            .delete(availabilityExceptions)
            .where(eq(availabilityExceptions.businessId, businessId));

        return result.rowsAffected > 0;
    }

    /**
     * Delete all availability exceptions for a business within a date range
     */
    async deleteByBusinessIdAndDateRange(
        businessId: string,
        startDate: string,
        endDate: string
    ): Promise<boolean> {
        if (!businessId?.trim() || !isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
            throw new Error("Business ID and valid date range are required");
        }

        const result = await db
            .delete(availabilityExceptions)
            .where(and(
                eq(availabilityExceptions.businessId, businessId),
                gte(availabilityExceptions.date, startDate),
                lte(availabilityExceptions.date, endDate)
            ));

        return result.rowsAffected > 0;
    }

    /**
     * Upsert an availability exception (create if not exists, update if exists)
     */
    async upsert(input: CreateAvailabilityExceptionInput): Promise<AvailabilityException> {
        // Find existing exception for this date
        const existingException = await this.findByBusinessIdAndDate(input.businessId, input.date);

        // If no existing exception, create new
        if (!existingException) {
            return await this.create(input);
        }

        // Update existing exception
        return await this.update({
            id: existingException.id,
            businessId: input.businessId,
            startTime: input.startTime,
            endTime: input.endTime,
            isAvailable: input.isAvailable,
            reason: input.reason
        });
    }

    // Using shared validation utilities from availability-validation.ts
}

// Export a singleton instance
export const availabilityExceptionRepository = new AvailabilityExceptionRepository();