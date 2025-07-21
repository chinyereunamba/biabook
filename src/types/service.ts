export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number; // cents
  isActive: boolean;
  category?: string;
  bufferTime?: number; // minutes between bookings
  createdAt: Date;
  updatedAt: Date;
}
