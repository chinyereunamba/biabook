export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  duration: number; // minutes
  price: number; // cents
  isActive: boolean;
  category?: string | null;
  bufferTime?: number | null; // minutes between bookings
  createdAt: Date;
  updatedAt: Date | null;
}
