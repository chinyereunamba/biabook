export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address?: string;
  phone: string | null;
  email: string | null;
  website?: string;
  logo?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date | null;
}
