import { useState, useEffect } from "react";

interface Business {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  categoryName: string;
  location?: string;
  phone?: string;
  email?: string;
  totalAppointments: number;
  totalRevenue: number;
  createdAt: string;
}

interface BusinessSummary {
  total: number;
  active: number;
  inactive: number;
  totalRevenue: number;
}

export type { Business, BusinessSummary };
