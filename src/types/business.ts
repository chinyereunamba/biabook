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

export interface BrowseBusiness {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  location: string;
  phone: string;
  email: string;
  services: string[];
  serviceCount: number;
  rating: number;
  reviews: number;
  priceRange: string;
}
