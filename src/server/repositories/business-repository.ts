import { eq, and, desc } from "drizzle-orm";
import { db } from "@/server/db";
import { businesses, categories, services } from "@/server/db/schema";

export type Business = typeof businesses.$inferSelect;
export type BusinessWithCategory = Business & {
  category: typeof categories.$inferSelect;
};
export type BusinessWithServices = BusinessWithCategory & {
  services: (typeof services.$inferSelect)[];
};

export class BusinessRepository {
  /**
   * Get all businesses
   */
  async findAll(): Promise<Business[]> {
    const result = await db.select().from(businesses);
    return result;
  }

  /**
   * Get business by id
   */

  async findById(id: string): Promise<Business | null> {
    if (!id?.trim()) {
      return null;
    }

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    return business ?? null;
  }

  /**
   * Get a business by ID with category information
   */
  async findByIdWithCategory(id: string): Promise<BusinessWithCategory | null> {
    if (!id?.trim()) {
      return null;
    }

    const result = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        description: businesses.description,
        location: businesses.location,
        phone: businesses.phone,
        email: businesses.email,
        categoryId: businesses.categoryId,
        ownerId: businesses.ownerId,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .where(eq(businesses.id, id))
      .limit(1);

    const business = result[0];
    if (!business) {
      return null;
    }

    return {
      ...business,
      category: business.category ?? { id: "", name: "Uncategorized" },
    };
  }

  /**
   * Get a business by ID with category and active services
   */
  async findByIdWithServices(id: string): Promise<BusinessWithServices | null> {
    if (!id?.trim()) {
      return null;
    }

    // First get the business with category
    const businessWithCategory = await this.findByIdWithCategory(id);
    if (!businessWithCategory) {
      return null;
    }

    // Then get active services for this business
    const businessServices = await db
      .select()
      .from(services)
      .where(and(eq(services.businessId, id), eq(services.isActive, true)))
      .orderBy(desc(services.createdAt));

    return {
      ...businessWithCategory,
      services: businessServices,
    };
  }

  /**
   * Get businesses by category
   */
  async findByCategory(categoryId: string): Promise<BusinessWithCategory[]> {
    if (!categoryId?.trim()) {
      return [];
    }

    const result = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        description: businesses.description,
        location: businesses.location,
        phone: businesses.phone,
        email: businesses.email,
        categoryId: businesses.categoryId,
        ownerId: businesses.ownerId,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .where(eq(businesses.categoryId, categoryId))
      .orderBy(desc(businesses.createdAt));

    return result.map((business) => ({
      ...business,
      category: business.category ?? { id: "", name: "Uncategorized" },
    }));
  }

  /**
   * Get all businesses with category information
   */
  async findAllWithCategory(): Promise<BusinessWithCategory[]> {
    const result = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        description: businesses.description,
        location: businesses.location,
        phone: businesses.phone,
        email: businesses.email,
        categoryId: businesses.categoryId,
        ownerId: businesses.ownerId,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .orderBy(desc(businesses.createdAt));

    return result.map((business) => ({
      ...business,
      category: business.category ?? { id: "", name: "Uncategorized" },
    }));
  }

  /**
   * Get businesses by owner ID
   */
  async findByOwnerId(ownerId: string): Promise<BusinessWithCategory[]> {
    if (!ownerId?.trim()) {
      return [];
    }

    const result = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        description: businesses.description,
        location: businesses.location,
        phone: businesses.phone,
        email: businesses.email,
        categoryId: businesses.categoryId,
        ownerId: businesses.ownerId,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .where(eq(businesses.ownerId, ownerId))
      .orderBy(desc(businesses.createdAt));

    return result.map((business) => ({
      ...business,
      category: business.category ?? { id: "", name: "Uncategorized" },
    }));
  }
}

// Export a singleton instance
export const businessRepository = new BusinessRepository();
