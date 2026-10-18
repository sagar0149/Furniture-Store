import {
  eq,
} from "drizzle-orm";

import { db } from "@/db";

import {
  products,
  inventoryTransactions,
} from "@/db/schema";

/**
 * Get a product's current stock quantity.
 */
export async function getProductStock(
  productId: string,
) {
  const result = await db
    .select({
      id: products.id,
      stockQuantity:
        products.stockQuantity,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Decrease product stock and record
 * an inventory transaction.
 *
 * This function should be called inside
 * a database transaction.
 */
export async function decreaseProductStock(
  tx: typeof db,
  data: {
    productId: string;
    orderId: string;
    quantity: number;
    reason?: string;
  },
) {
  const productResult = await tx
    .select({
      id: products.id,
      stockQuantity:
        products.stockQuantity,
    })
    .from(products)
    .where(eq(products.id, data.productId))
    .limit(1);

  const product = productResult[0];

  if (!product) {
    throw new Error(
      "Product not found.",
    );
  }

  const previousQuantity =
    product.stockQuantity;

  if (
    previousQuantity < data.quantity
  ) {
    throw new Error(
      `Insufficient stock for product ${data.productId}.`,
    );
  }

  const newQuantity =
    previousQuantity - data.quantity;

  const updatedProduct = await tx
    .update(products)
    .set({
      stockQuantity: newQuantity,
      updatedAt: new Date(),
    })
    .where(eq(products.id, data.productId))
    .returning({
      id: products.id,
      stockQuantity:
        products.stockQuantity,
    });

  if (!updatedProduct[0]) {
    throw new Error(
      "Unable to update product stock.",
    );
  }

  const transaction =
    await tx
      .insert(inventoryTransactions)
      .values({
        productId: data.productId,
        orderId: data.orderId,
        type: "SALE",
        quantityChange:
          -data.quantity,
        previousQuantity,
        newQuantity,
        reason:
          data.reason ??
          "Product sold",
      })
      .returning();

  return {
    product:
      updatedProduct[0],
    transaction:
      transaction[0] ?? null,
  };
}