interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  categoryName: string | null;
  categoryId: string;
  ownerId: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  totalAppointments: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

interface BusinessSummary {
  total: number;
  active: number;
  inactive: number;
  totalRevenue: number;
}

export type { Business, BusinessSummary };
