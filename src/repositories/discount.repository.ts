
import {
  and,
  desc,
  eq,
  gte,
  inArray,
  lte,
  or,
} from "drizzle-orm";

import { db } from "@/db";

import {
  categories,
  discountCategories,
  discountProducts,
  discounts,
  products,
} from "@/db/schema";

export type DiscountType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT";

export type DiscountInput = {
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  startAt: Date;
  endAt: Date;
  enabled: boolean;
  productIds: string[];
  categoryIds: string[];
};

function validateDiscountInput(
  input: DiscountInput,
) {
  if (!input.name.trim()) {
    throw new Error("Discount name is required.");
  }

  if (
    !Number.isFinite(input.value) ||
    input.value <= 0
  ) {
    throw new Error(
      "Discount value must be greater than zero.",
    );
  }

  if (
    input.type === "PERCENTAGE" &&
    input.value > 100
  ) {
    throw new Error(
      "Percentage discount cannot exceed 100%.",
    );
  }

  if (
    !(input.startAt instanceof Date) ||
    !(input.endAt instanceof Date) ||
    !Number.isFinite(input.startAt.getTime()) ||
    !Number.isFinite(input.endAt.getTime()) ||
    input.endAt <= input.startAt
  ) {
    throw new Error(
      "End date must be later than start date.",
    );
  }

  if (
    !Array.isArray(input.productIds) ||
    !Array.isArray(input.categoryIds)
  ) {
    throw new Error(
      "Invalid product or category selection.",
    );
  }
}

async function validateTargets(
  productIds: string[],
  categoryIds: string[],
) {
  const uniqueProductIds = [
    ...new Set(productIds),
  ];

  const uniqueCategoryIds = [
    ...new Set(categoryIds),
  ];

  if (uniqueProductIds.length > 0) {
    const foundProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(
        inArray(
          products.id,
          uniqueProductIds,
        ),
      );

    if (
      foundProducts.length !==
      uniqueProductIds.length
    ) {
      throw new Error(
        "One or more selected products do not exist.",
      );
    }
  }

  if (uniqueCategoryIds.length > 0) {
    const foundCategories = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        inArray(
          categories.id,
          uniqueCategoryIds,
        ),
      );

    if (
      foundCategories.length !==
      uniqueCategoryIds.length
    ) {
      throw new Error(
        "One or more selected categories do not exist.",
      );
    }
  }

  return {
    productIds: uniqueProductIds,
    categoryIds: uniqueCategoryIds,
  };
}

export async function getAdminDiscounts() {
  const rows = await db
    .select()
    .from(discounts)
    .orderBy(desc(discounts.createdAt));

  return Promise.all(
    rows.map(async (discount) => {
      const [productRows, categoryRows] =
        await Promise.all([
          db
            .select({
              id: discountProducts.productId,
            })
            .from(discountProducts)
            .where(
              eq(
                discountProducts.discountId,
                discount.id,
              ),
            ),

          db
            .select({
              id: discountCategories.categoryId,
            })
            .from(discountCategories)
            .where(
              eq(
                discountCategories.discountId,
                discount.id,
              ),
            ),
        ]);

      return {
        ...discount,
        productIds: productRows.map(
          (item) => item.id,
        ),
        categoryIds: categoryRows.map(
          (item) => item.id,
        ),
      };
    }),
  );
}

export async function getAdminDiscountById(
  id: string,
) {
  const [discount] = await db
    .select()
    .from(discounts)
    .where(eq(discounts.id, id))
    .limit(1);

  if (!discount) {
    return null;
  }

  const [productRows, categoryRows] =
    await Promise.all([
      db
        .select({
          id: discountProducts.productId,
        })
        .from(discountProducts)
        .where(
          eq(
            discountProducts.discountId,
            id,
          ),
        ),

      db
        .select({
          id: discountCategories.categoryId,
        })
        .from(discountCategories)
        .where(
          eq(
            discountCategories.discountId,
            id,
          ),
        ),
    ]);

  return {
    ...discount,
    productIds: productRows.map(
      (item) => item.id,
    ),
    categoryIds: categoryRows.map(
      (item) => item.id,
    ),
  };
}

export async function createAdminDiscount(
  input: DiscountInput,
) {
  validateDiscountInput(input);

  const targets = await validateTargets(
    input.productIds,
    input.categoryIds,
  );

  return db.transaction(async (tx) => {
    const [discount] = await tx
      .insert(discounts)
      .values({
        name: input.name.trim(),
        description:
          input.description?.trim() || null,
        type: input.type,
        value: input.value.toFixed(2),
        startAt: input.startAt,
        endAt: input.endAt,
        enabled: input.enabled,
        updatedAt: new Date(),
      })
      .returning();

    if (!discount) {
      throw new Error(
        "Unable to create the discount.",
      );
    }

    if (targets.productIds.length > 0) {
      await tx
        .insert(discountProducts)
        .values(
          targets.productIds.map(
            (productId) => ({
              discountId: discount.id,
              productId,
            }),
          ),
        );
    }

    if (targets.categoryIds.length > 0) {
      await tx
        .insert(discountCategories)
        .values(
          targets.categoryIds.map(
            (categoryId) => ({
              discountId: discount.id,
              categoryId,
            }),
          ),
        );
    }

    return discount;
  });
}

export async function updateAdminDiscount(
  id: string,
  input: DiscountInput,
) {
  validateDiscountInput(input);

  const targets = await validateTargets(
    input.productIds,
    input.categoryIds,
  );

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: discounts.id })
      .from(discounts)
      .where(eq(discounts.id, id))
      .limit(1);

    if (!existing) {
      throw new Error(
        "Discount not found.",
      );
    }

    const [updated] = await tx
      .update(discounts)
      .set({
        name: input.name.trim(),
        description:
          input.description?.trim() || null,
        type: input.type,
        value: input.value.toFixed(2),
        startAt: input.startAt,
        endAt: input.endAt,
        enabled: input.enabled,
        updatedAt: new Date(),
      })
      .where(eq(discounts.id, id))
      .returning();

    await tx
      .delete(discountProducts)
      .where(
        eq(
          discountProducts.discountId,
          id,
        ),
      );

    await tx
      .delete(discountCategories)
      .where(
        eq(
          discountCategories.discountId,
          id,
        ),
      );

    if (targets.productIds.length > 0) {
      await tx
        .insert(discountProducts)
        .values(
          targets.productIds.map(
            (productId) => ({
              discountId: id,
              productId,
            }),
          ),
        );
    }

    if (targets.categoryIds.length > 0) {
      await tx
        .insert(discountCategories)
        .values(
          targets.categoryIds.map(
            (categoryId) => ({
              discountId: id,
              categoryId,
            }),
          ),
        );
    }

    return updated;
  });
}

export async function setAdminDiscountEnabled(
  id: string,
  enabled: boolean,
) {
  const [updated] = await db
    .update(discounts)
    .set({
      enabled,
      updatedAt: new Date(),
    })
    .where(eq(discounts.id, id))
    .returning();

  if (!updated) {
    throw new Error("Discount not found.");
  }

  return updated;
}

export async function deleteAdminDiscount(
  id: string,
) {
  const [deleted] = await db
    .delete(discounts)
    .where(eq(discounts.id, id))
    .returning({
      id: discounts.id,
    });

  if (!deleted) {
    throw new Error("Discount not found.");
  }

  return deleted;
}

/**
 * Returns currently eligible discounts.
 *
 * A discount with no product/category targets
 * applies store-wide. Targeted discounts apply
 * when a product matches either target list.
 */
export async function getEligibleDiscounts(
  productIds: string[],
  now: Date = new Date(),
) {
  const uniqueProductIds = [
    ...new Set(productIds),
  ];

  if (uniqueProductIds.length === 0) {
    return [];
  }

  const activeDiscounts = await db
    .select()
    .from(discounts)
    .where(
      and(
        eq(discounts.enabled, true),
        lte(discounts.startAt, now),
        gte(discounts.endAt, now),
      ),
    );

  const eligible = [];

  for (const discount of activeDiscounts) {
    const [targetProducts, targetCategories] =
      await Promise.all([
        db
          .select({
            id: discountProducts.productId,
          })
          .from(discountProducts)
          .where(
            eq(
              discountProducts.discountId,
              discount.id,
            ),
          ),

        db
          .select({
            id: discountCategories.categoryId,
          })
          .from(discountCategories)
          .where(
            eq(
              discountCategories.discountId,
              discount.id,
            ),
          ),
      ]);

    const hasTargets =
      targetProducts.length > 0 ||
      targetCategories.length > 0;

    if (!hasTargets) {
      eligible.push(discount);
      continue;
    }

    const targetedProductIds =
      targetProducts.map((item) => item.id);

    const targetedCategoryIds =
      targetCategories.map((item) => item.id);

    const matchingProducts = await db
      .select({
        id: products.id,
      })
      .from(products)
      .where(
        and(
          inArray(
            products.id,
            uniqueProductIds,
          ),
          or(
            targetedProductIds.length > 0
              ? inArray(
                  products.id,
                  targetedProductIds,
                )
              : undefined,
            targetedCategoryIds.length > 0
              ? inArray(
                  products.categoryId,
                  targetedCategoryIds,
                )
              : undefined,
          ),
        ),
      );

    if (matchingProducts.length > 0) {
      eligible.push(discount);
    }
  }

  return eligible;
}

export async function getEligibleDiscountsForProducts(
  productIds: string[],
  now: Date = new Date(),
) {
  const uniqueProductIds = [
    ...new Set(productIds),
  ];

  if (uniqueProductIds.length === 0) {
    return new Map<
      string,
      Awaited<ReturnType<typeof getEligibleDiscounts>>
    >();
  }

  const activeDiscounts = await db
    .select()
    .from(discounts)
    .where(
      and(
        eq(discounts.enabled, true),
        lte(discounts.startAt, now),
        gte(discounts.endAt, now),
      ),
    );

  const result = new Map<
    string,
    Awaited<ReturnType<typeof getEligibleDiscounts>>
  >();

  for (const productId of uniqueProductIds) {
    result.set(
      productId,
      await getEligibleDiscounts([productId], now),
    );
  }

  return result;
}
