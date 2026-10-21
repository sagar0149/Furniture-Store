import { eq } from "drizzle-orm";

import { db } from "@/db";
import { products, inventoryTransactions } from "@/db/schema";

/**
 * Get a product's current stock quantity.
 */
export async function getProductStock(productId: string) {
  const result = await db
    .select({
      id: products.id,
      stockQuantity: products.stockQuantity,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Decrease stock and record a SALE transaction.
 * Call inside a database transaction.
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
  if (!Number.isSafeInteger(data.quantity) || data.quantity <= 0) {
    throw new Error("Quantity must be a positive whole number.");
  }

  const productResult = await tx
    .select({
      id: products.id,
      stockQuantity: products.stockQuantity,
    })
    .from(products)
    .where(eq(products.id, data.productId))
    .limit(1);

  const product = productResult[0];

  if (!product) {
    throw new Error("Product not found.");
  }

  const previousQuantity = product.stockQuantity;

  if (previousQuantity < data.quantity) {
    throw new Error(`Insufficient stock for product ${data.productId}.`);
  }

  const newQuantity = previousQuantity - data.quantity;

  const updatedProduct = await tx
    .update(products)
    .set({
      stockQuantity: newQuantity,
      updatedAt: new Date(),
    })
    .where(eq(products.id, data.productId))
    .returning({
      id: products.id,
      stockQuantity: products.stockQuantity,
    });

  if (!updatedProduct[0]) {
    throw new Error("Unable to update product stock.");
  }

  const transaction = await tx
    .insert(inventoryTransactions)
    .values({
      productId: data.productId,
      orderId: data.orderId,
      type: "SALE",
      quantityChange: -data.quantity,
      previousQuantity,
      newQuantity,
      reason: data.reason ?? "Product sold",
    })
    .returning();

  return {
    product: updatedProduct[0],
    transaction: transaction[0] ?? null,
  };
}

/**
 * Restore stock and record a CANCELLATION transaction.
 * Call inside the same database transaction as order cancellation.
 */
export async function restoreProductStock(
  tx: typeof db,
  data: {
    productId: string;
    orderId: string;
    quantity: number;
    reason?: string;
  },
) {
  if (!Number.isSafeInteger(data.quantity) || data.quantity <= 0) {
    throw new Error("Quantity must be a positive whole number.");
  }

  const productResult = await tx
    .select({
      id: products.id,
      stockQuantity: products.stockQuantity,
    })
    .from(products)
    .where(eq(products.id, data.productId))
    .limit(1);

  const product = productResult[0];

  if (!product) {
    throw new Error(`Product ${data.productId} was not found.`);
  }

  const previousQuantity = product.stockQuantity;
  const newQuantity = previousQuantity + data.quantity;

  if (!Number.isSafeInteger(newQuantity) || newQuantity > 2_000_000_000) {
    throw new Error("The resulting stock quantity is too large.");
  }

  const updatedProduct = await tx
    .update(products)
    .set({
      stockQuantity: newQuantity,
      updatedAt: new Date(),
    })
    .where(eq(products.id, data.productId))
    .returning({
      id: products.id,
      stockQuantity: products.stockQuantity,
    });

  if (!updatedProduct[0]) {
    throw new Error("Unable to restore product stock.");
  }

  const transaction = await tx
    .insert(inventoryTransactions)
    .values({
      productId: data.productId,
      orderId: data.orderId,
      type: "CANCELLATION",
      quantityChange: data.quantity,
      previousQuantity,
      newQuantity,
      reason: data.reason ?? "Stock restored after order cancellation",
    })
    .returning();

  return {
    product: updatedProduct[0],
    transaction: transaction[0] ?? null,
  };
}