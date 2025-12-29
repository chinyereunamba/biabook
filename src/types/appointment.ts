export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: Date;
  version?: number;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  serviceName: string;
  servicePrice: number;
}
