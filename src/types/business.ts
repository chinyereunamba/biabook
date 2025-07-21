export interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email: string;
  website?: string;
  logo?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
