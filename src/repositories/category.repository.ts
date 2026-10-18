import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { categories } from "@/db/schema";

export async function getAllCategories() {
  return db
    .select()
    .from(categories)
    .orderBy(
      asc(categories.displayOrder),
      asc(categories.name),
    );
}

export async function getActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(
      asc(categories.displayOrder),
      asc(categories.name),
    );
}

export async function getCategoryById(
  id: string,
) {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function getCategoryBySlug(
  slug: string,
) {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return result[0] ?? null;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  parentId?: string;
  displayOrder?: number;
}) {
  const result = await db
    .insert(categories)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      imagePublicId: data.imagePublicId,
      parentId: data.parentId,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  return result[0] ?? null;
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    imagePublicId?: string;
    parentId?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  },
) {
  const result = await db
    .update(categories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();

  return result[0] ?? null;
}

export async function deleteCategory(
  id: string,
) {
  const result = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({
      id: categories.id,
    });

  return result[0] ?? null;
}