import { describe, it, expect, beforeEach, vi } from 'vitest';
import { availabilityCalculationEngine } from '../availability-calculation';

// Mock the repositories
vi.mock('../weekly-availability-repository', () => ({
    weeklyAvailabilityRepository: {
        findByBusinessId: vi.fn(),
        findByBusinessIdAndDay: vi.fn(),
    }
}));

vi.mock('../availability-exception-repository', () => ({
    availabilityExceptionRepository: {
        findByBusinessIdAndDateRange: vi.fn(),
        findByBusinessIdAndDate: vi.fn(),
    }
}));

vi.mock('../service-repository', () => ({
    serviceRepository: {
        findById: vi.fn(),
    }
}));

describe('AvailabilityCalculationEngine', () => {
    it('should throw error if business ID is not provided', async () => {
        await expect(availabilityCalculationEngine.calculateAvailability('')).rejects.toThrow('Business ID is required');
    });
});