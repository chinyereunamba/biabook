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
