
"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inventoryTransactions, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/permissions";

export type InventoryActionResult = {
  success: boolean;
  message: string;
};

export async function adjustInventoryAction(
  input: unknown
): Promise<InventoryActionResult> {
  // Keep authentication outside the catch block so redirects work correctly.
  await requireAdmin();

  try {
    if (!input || typeof input !== "object") {
      return { success: false, message: "Invalid request." };
    }

    const data = input as Record<string, unknown>;
    const { productId, quantity, type, reason } = data;

    if (
      typeof productId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        productId
      )
    ) {
      return { success: false, message: "Invalid product ID." };
    }

    if (
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0 ||
      quantity > 1_000_000
    ) {
      return {
        success: false,
        message: "Quantity must be a whole number between 0 and 1,000,000.",
      };
    }

    if (type !== "RESTOCK" && type !== "ADJUSTMENT") {
      return { success: false, message: "Invalid adjustment type." };
    }

    if (
      typeof reason !== "string" ||
      !reason.trim() ||
      reason.trim().length > 500
    ) {
      return {
        success: false,
        message: "Enter a reason of up to 500 characters.",
      };
    }

    await db.transaction(async (tx) => {
      const result = await tx
        .select({
          id: products.id,
          stockQuantity: products.stockQuantity,
        })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      const product = result[0];

      if (!product) {
        throw new Error("Product not found.");
      }

      const previousQuantity = product.stockQuantity;

      // RESTOCK adds the entered amount.
      // ADJUSTMENT sets the stock to the entered total.
      const newQuantity =
        type === "RESTOCK"
          ? previousQuantity + quantity
          : quantity;

      if (
        !Number.isSafeInteger(newQuantity) ||
        newQuantity > 2_000_000_000
      ) {
        throw new Error("The resulting stock quantity is too large.");
      }

      if (newQuantity === previousQuantity) {
        throw new Error("The new stock quantity is unchanged.");
      }

      await tx
        .update(products)
        .set({
          stockQuantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      await tx.insert(inventoryTransactions).values({
        productId,
        orderId: null,
        type,
        quantityChange: newQuantity - previousQuantity,
        previousQuantity,
        newQuantity,
        reason: reason.trim(),
      });
    });

    return {
      success: true,
      message: "Inventory updated successfully.",
    };
  } catch (error) {
    console.error("Inventory adjustment failed:", error);

    return {
      success: false,
      message:
        error instanceof Error &&
        error.message === "The new stock quantity is unchanged."
          ? error.message
          : "Unable to update inventory. Please try again.",
    };
  }
}
