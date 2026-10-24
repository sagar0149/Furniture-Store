import {
  asc,
  count,
  desc,
  eq,
} from "drizzle-orm";

import { db } from "@/db";
import {
  products,
  promotionProducts,
  promotions,
} from "@/db/schema";

export async function getAdminPromotions() {
  const rows = await db
    .select()
    .from(promotions)
    .orderBy(
      asc(promotions.displayOrder),
      desc(promotions.createdAt),
    );

  return Promise.all(
    rows.map(async (promotion) => {
      const productRows = await db
        .select({
          id: promotionProducts.productId,
        })
        .from(promotionProducts)
        .where(
          eq(
            promotionProducts.promotionId,
            promotion.id,
          ),
        );

      return {
        ...promotion,
        productIds: productRows.map((row) => row.id),
      };
    }),
  );
}

export async function getAdminPromotionById(id: string) {
  const rows = await db
    .select()
    .from(promotions)
    .where(eq(promotions.id, id))
    .limit(1);

  if (!rows[0]) {
    return null;
  }

  const productRows = await db
    .select({
      id: promotionProducts.productId,
    })
    .from(promotionProducts)
    .where(eq(promotionProducts.promotionId, id));

  return {
    ...rows[0],
    productIds: productRows.map((row) => row.id),
  };
}

export async function getPromotionProductOptions() {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
    })
    .from(products)
    .orderBy(asc(products.name));
}

export async function getPromotionCounts() {
  const [totalResult, enabledResult] = await Promise.all([
    db.select({ value: count() }).from(promotions),
    db
      .select({ value: count() })
      .from(promotions)
      .where(eq(promotions.enabled, true)),
  ]);

  return {
    total: Number(totalResult[0]?.value ?? 0),
    enabled: Number(enabledResult[0]?.value ?? 0),
  };
}

export async function setPromotionEnabled(
  id: string,
  enabled: boolean,
) {
  const rows = await db
    .update(promotions)
    .set({
      enabled,
      updatedAt: new Date(),
    })
    .where(eq(promotions.id, id))
    .returning({ id: promotions.id });

  return rows[0] ?? null;
}

export async function deletePromotion(id: string) {
  const rows = await db
    .delete(promotions)
    .where(eq(promotions.id, id))
    .returning({ id: promotions.id });

  return rows[0] ?? null;
}
