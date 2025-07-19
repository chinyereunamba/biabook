import { db } from "@/server/db";
import { categories } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export interface Category {
  id: string;
  name: string;
}

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    const result = await db.select().from(categories);
    return result;
  }

  async findById(id: string): Promise<Category | null> {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return result[0] || null;
  }

  async create(category: Category): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    const created = result[0];
    if (!created) {
      throw new Error("Failed to create category");
    }
    return created;
  }

  async update(
    id: string,
    category: Partial<Omit<Category, "id">>,
  ): Promise<Category | null> {
    const result = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();

    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    return result.length > 0;
  }
}

export const categoryRepository = new CategoryRepository();
