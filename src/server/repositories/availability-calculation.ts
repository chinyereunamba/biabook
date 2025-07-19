import { weeklyAvailabilityRepository } from "./weekly-availability-repository";
import type { WeeklyAvailability } from "./weekly-availability-repository";
import { availabilityExceptionRepository } from "./availability-exception-repository";
import type { AvailabilityException } from "./availability-exception-repository";
import { serviceRepository } from "./service-repository";
import {
    isValidDateFormat,
    generateDateRange,
    getDayOfWeekFromDate,
    timeStringToMinutes,
    minutesToTimeString,
} from "./utils/availability-validation";

export interface TimeSlot {
    date: string; // YYYY-MM-DD format
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    available: boolean;
}

export interface AvailabilitySlot {
    date: string; // YYYY-MM-DD format
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    slots: TimeSlot[];
}

export interface AvailabilityOptions {
    slotDuration?: number; // minutes
    bufferTime?: number; // minutes
    startDate?: string; // YYYY-MM-DD format, defaults to today
    days?: number; // number of days to calculate, defaults to 30
    startTime?: string; // HH:MM format, minimum time to show
    endTime?: string; // HH:MM format, maximum time to show
}

export class AvailabilityCalculationEngine {
    /**
     * Calculate available time slots for a business and service
     */
    async calculateAvailability(
        businessId: string,
        serviceId?: string,
        options: AvailabilityOptions = {}
    ): Promise<AvailabilitySlot[]> {
        // Validate inputs
        if (!businessId?.trim()) {
            throw new Error("Business ID is required");
        }

        // Set default options
        const defaultOptions: Required<AvailabilityOptions> = {
            slotDuration: serviceId ? await this.getServiceDuration(serviceId) : 60, // Default 60 minutes if no service specified
            bufferTime: serviceId ? await this.getServiceBufferTime(serviceId) : 0,
            startDate: this.getTodayDateString() as string,
            days: 30,
            startTime: "00:00",
            endTime: "23:59",
        };

        const config = { ...defaultOptions, ...options };

        // Validate dates
        if (!isValidDateFormat(config.startDate)) {
            throw new Error("Invalid start date format");
        }

        // Get weekly availability
        const weeklyAvailability = await weeklyAvailabilityRepository.findByBusinessId(businessId, true);
        if (weeklyAvailability.length === 0) {
            throw new Error("No weekly availability set for this business");
        }

        // Get exceptions for the date range
        const endDate = this.addDaysToDate(config.startDate, config.days - 1) as string;
        const exceptions = await availabilityExceptionRepository.findByBusinessIdAndDateRange(
            businessId,
            config.startDate,
            endDate
        );

        // Generate date range
        const dateRange = generateDateRange(config.startDate, endDate);

        // Calculate availability for each date
        const availabilitySlots: AvailabilitySlot[] = [];

        for (const date of dateRange) {
            const dayOfWeek = getDayOfWeekFromDate(date);
            if (dayOfWeek === -1) continue; // Skip invalid dates

            // Check if there's an exception for this date
            const exception = exceptions.find(e => e.date === date);

            // If there's an exception and it's marked as unavailable, skip this date
            if (exception && !exception.isAvailable) {
                availabilitySlots.push({
                    date,
                    dayOfWeek,
                    slots: [], // No slots available on this date
                });
                continue;
            }

            // Get the day's availability (either from exception or weekly schedule)
            const dayAvailability = this.getDayAvailability(weeklyAvailability, exception, dayOfWeek);
            if (!dayAvailability) {
                availabilitySlots.push({
                    date,
                    dayOfWeek,
                    slots: [], // No slots available on this date
                });
                continue;
            }

            // Generate time slots for this day
            const slots = this.generateTimeSlots(
                dayAvailability.startTime,
                dayAvailability.endTime,
                config.slotDuration,
                config.bufferTime,
                config.startTime,
                config.endTime
            );

            availabilitySlots.push({
                date,
                dayOfWeek,
                slots,
            });
        }

        return availabilitySlots;
    }

    /**
     * Get service duration in minutes
     */
    private async getServiceDuration(serviceId: string): Promise<number> {
        const service = await serviceRepository.findById(serviceId);
        if (!service) {
            throw new Error("Service not found");
        }
        return service.duration;
    }

    /**
     * Get service buffer time in minutes
     */
    private async getServiceBufferTime(serviceId: string): Promise<number> {
        const service = await serviceRepository.findById(serviceId);
        if (!service) {
            throw new Error("Service not found");
        }
        return service.bufferTime || 0;
    }

    /**
     * Get today's date in YYYY-MM-DD format
     */
    private getTodayDateString(): string | undefined {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        return dateString;
    }

    /**
     * Add days to a date and return in YYYY-MM-DD format
     */
    private addDaysToDate(dateStr: string, days: number): string | undefined {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        const result = date.toISOString().split('T')[0];
        return result;
    }

    /**
     * Get availability for a specific day, considering exceptions
     */
    private getDayAvailability(
        weeklyAvailability: WeeklyAvailability[],
        exception: AvailabilityException | undefined,
        dayOfWeek: number
    ): { startTime: string; endTime: string } | null {
        // If there's an exception with specific hours, use that
        if (exception && exception.isAvailable && exception.startTime && exception.endTime) {
            return {
                startTime: exception.startTime,
                endTime: exception.endTime,
            };
        }

        // Otherwise, use the weekly schedule
        const daySchedule = weeklyAvailability.find(d => d.dayOfWeek === dayOfWeek);
        if (!daySchedule || !daySchedule.isAvailable) {
            return null; // Day is not available
        }

        return {
            startTime: daySchedule.startTime,
            endTime: daySchedule.endTime,
        };
    }

    /**
     * Generate time slots for a day
     */
    private generateTimeSlots(
        startTime: string,
        endTime: string,
        slotDuration: number,
        bufferTime: number,
        minTime: string,
        maxTime: string
    ): TimeSlot[] {
        const slots: TimeSlot[] = [];

        // Convert times to minutes since midnight
        const startMinutes = Math.max(timeStringToMinutes(startTime), timeStringToMinutes(minTime));
        const endMinutes = Math.min(timeStringToMinutes(endTime), timeStringToMinutes(maxTime));
        const totalDuration = slotDuration + bufferTime;

        // Generate slots
        for (let time = startMinutes; time + slotDuration <= endMinutes; time += totalDuration) {
            const slotStart = minutesToTimeString(time);
            const slotEnd = minutesToTimeString(time + slotDuration);

            slots.push({
                date: "", // Will be filled by the caller
                startTime: slotStart,
                endTime: slotEnd,
                available: true,
            });
        }

        return slots;
    }

    /**
     * Check if a specific time slot is available
     * This would be extended to check against existing appointments
     */
    async isTimeSlotAvailable(
        businessId: string,
        date: string,
        startTime: string,
        endTime: string
    ): Promise<boolean> {
        // Validate inputs
        if (!businessId?.trim() || !isValidDateFormat(date)) {
            return false;
        }

        // Get day of week
        const dayOfWeek = getDayOfWeekFromDate(date);
        if (dayOfWeek === -1) return false;

        // Check for exception
        const exception = await availabilityExceptionRepository.findByBusinessIdAndDate(businessId, date);
        if (exception) {
            // If day is marked as unavailable, slot is not available
            if (!exception.isAvailable) {
                return false;
            }

            // If day has special hours, check if slot is within those hours
            if (exception.startTime && exception.endTime) {
                return (
                    timeStringToMinutes(startTime) >= timeStringToMinutes(exception.startTime) &&
                    timeStringToMinutes(endTime) <= timeStringToMinutes(exception.endTime)
                );
            }
        }

        // Check weekly availability
        const weeklyAvailability = await weeklyAvailabilityRepository.findByBusinessIdAndDay(businessId, dayOfWeek);
        if (weeklyAvailability.length === 0) {
            return false; // No availability set for this day
        }

        // Check if slot is within any of the available time ranges for this day
        for (const availability of weeklyAvailability) {
            if (
                availability.isAvailable &&
                timeStringToMinutes(startTime) >= timeStringToMinutes(availability.startTime) &&
                timeStringToMinutes(endTime) <= timeStringToMinutes(availability.endTime)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get next available time slot for a service
     */
    async getNextAvailableSlot(
        businessId: string,
        serviceId: string,
        startDate?: string
    ): Promise<{ date: string; startTime: string; endTime: string } | null> {
        const service = await serviceRepository.findById(serviceId);
        if (!service) {
            throw new Error("Service not found");
        }

        const options: AvailabilityOptions = {
            slotDuration: service.duration,
            bufferTime: service.bufferTime || 0,
            startDate: startDate || this.getTodayDateString(),
            days: 30,
        };

        const availability = await this.calculateAvailability(businessId, serviceId, options);

        // Find the first available slot
        for (const day of availability) {
            if (day.slots.length > 0) {
                const firstSlot = day.slots[0];
                if (firstSlot) {
                    return {
                        date: day.date,
                        startTime: firstSlot.startTime,
                        endTime: firstSlot.endTime,
                    };
                }
            }
        }

        return null; // No available slots found
    }
}

// Export a singleton instance
export const availabilityCalculationEngine = new AvailabilityCalculationEngine();