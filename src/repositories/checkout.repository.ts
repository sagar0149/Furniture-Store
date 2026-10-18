import {
  and,
  eq,
  sql,
} from "drizzle-orm";

import { db } from "@/db";

import {
  cartItems,
  inventoryTransactions,
  orders,
  orderItems,
  products,
} from "@/db/schema";

/**
 * Type used for the checkout database client.
 *
 * This allows the repository functions to work
 * with either the normal database client or a
 * transaction client.
 */
type CheckoutDatabase = typeof db;

/**
 * Get the current user's cart items with their
 * latest product information.
 */
export async function getCheckoutCartItems(
  userId: string,
) {
  const result = await db
    .select({
      cartItem: cartItems,
      product: products,
    })
    .from(cartItems)
    .innerJoin(
      products,
      eq(
        cartItems.productId,
        products.id,
      ),
    )
    .where(
      sql`${cartItems.cartId} IN (
        SELECT id
        FROM carts
        WHERE user_id = ${userId}
      )`,
    );

  return result;
}

/**
 * Lock products and validate stock before
 * creating the order.
 *
 * FOR UPDATE prevents another checkout from
 * changing the same product stock while this
 * checkout is being processed.
 */
async function lockAndValidateProductStock(
  tx: CheckoutDatabase,
  items: Array<{
    cartItem: typeof cartItems.$inferSelect;
    product: typeof products.$inferSelect;
  }>,
) {
  for (const item of items) {
    const product = item.product;

    if (!product.isActive) {
      throw new Error(
        `${product.name} is no longer available.`,
      );
    }

    const lockedProductResult =
      await tx
        .select({
          id: products.id,
          stockQuantity:
            products.stockQuantity,
        })
        .from(products)
        .where(
          eq(
            products.id,
            product.id,
          ),
        )
        .for("update");

    const lockedProduct =
      lockedProductResult[0];

    if (!lockedProduct) {
      throw new Error(
        `${product.name} could not be found.`,
      );
    }

    const currentStock =
      Number(
        lockedProduct.stockQuantity,
      );

    const requestedQuantity =
      item.cartItem.quantity;

    if (currentStock <= 0) {
      throw new Error(
        `${product.name} is currently out of stock.`,
      );
    }

    if (
      requestedQuantity >
      currentStock
    ) {
      throw new Error(
        `Only ${currentStock} ${product.name} item${
          currentStock === 1
            ? ""
            : "s"
        } available.`,
      );
    }
  }
}

/**
 * Create an order and its order items.
 *
 * This function is intended to run inside a
 * database transaction.
 */
export async function createCheckoutOrder(
  tx: CheckoutDatabase,
  data: {
    order: {
      orderNumber: string;
      userId: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;

      shippingFullName: string;
      shippingPhone: string;
      shippingAddressLine1: string;
      shippingAddressLine2?: string;
      shippingCity: string;
      shippingState: string;
      shippingPostalCode: string;
      shippingCountry: string;
      shippingLandmark?: string;

      subtotal: string;
      discountAmount: string;
      shippingAmount: string;
      taxAmount: string;
      totalAmount: string;

      notes?: string;
      placedAt?: Date;
    };

    items: Array<{
      cartItem: typeof cartItems.$inferSelect;
      product: typeof products.$inferSelect;
    }>;
  },
) {
  /*
   * Lock all products first.
   *
   * This prevents two customers from buying
   * the same remaining stock simultaneously.
   */
  await lockAndValidateProductStock(
    tx,
    data.items,
  );

  /*
   * Create the order.
   */
  const orderResult =
    await tx
      .insert(orders)
      .values({
        orderNumber:
          data.order.orderNumber,

        userId:
          data.order.userId,

        customerName:
          data.order.customerName,

        customerEmail:
          data.order.customerEmail,

        customerPhone:
          data.order.customerPhone,

        shippingFullName:
          data.order.shippingFullName,

        shippingPhone:
          data.order.shippingPhone,

        shippingAddressLine1:
          data.order
            .shippingAddressLine1,

        shippingAddressLine2:
          data.order
            .shippingAddressLine2,

        shippingCity:
          data.order.shippingCity,

        shippingState:
          data.order.shippingState,

        shippingPostalCode:
          data.order
            .shippingPostalCode,

        shippingCountry:
          data.order.shippingCountry,

        shippingLandmark:
          data.order.shippingLandmark,

        subtotal:
          data.order.subtotal,

        discountAmount:
          data.order.discountAmount,

        shippingAmount:
          data.order.shippingAmount,

        taxAmount:
          data.order.taxAmount,

        totalAmount:
          data.order.totalAmount,

        notes:
          data.order.notes,

        placedAt:
          data.order.placedAt ??
          new Date(),
      })
      .returning();

  const order =
    orderResult[0];

  if (!order) {
    throw new Error(
      "Unable to create your order.",
    );
  }

  /*
   * Create order item snapshots and
   * decrease inventory.
   */
  for (const item of data.items) {
    const product =
      item.product;

    const quantity =
      item.cartItem.quantity;

    /*
     * Re-read the locked product so the
     * inventory operation uses the same
     * locked stock state.
     */
    const lockedProductResult =
      await tx
        .select({
          id: products.id,
          stockQuantity:
            products.stockQuantity,
        })
        .from(products)
        .where(
          eq(
            products.id,
            product.id,
          ),
        )
        .for("update");

    const lockedProduct =
      lockedProductResult[0];

    if (!lockedProduct) {
      throw new Error(
        `${product.name} could not be found.`,
      );
    }

    const currentStock =
      Number(
        lockedProduct.stockQuantity,
      );

    if (
      currentStock <
      quantity
    ) {
      throw new Error(
        `Insufficient stock for ${product.name}.`,
      );
    }

    const unitPrice =
      Number(
        product.salePrice ??
          product.regularPrice,
      );

    if (
      !Number.isFinite(
        unitPrice,
      ) ||
      unitPrice < 0
    ) {
      throw new Error(
        `Invalid price for ${product.name}.`,
      );
    }

    const finalPrice =
      Math.round(
        unitPrice *
          quantity *
          100,
      ) / 100;

    /*
     * Create order item snapshot.
     */
    const orderItemResult =
      await tx
        .insert(orderItems)
        .values({
          orderId:
            order.id,

          productId:
            product.id,

          productNameSnapshot:
            product.name,

          skuSnapshot:
            product.sku,

          quantity,

          unitPrice:
            unitPrice.toFixed(2),

          discountAmount:
            "0.00",

          finalPrice:
            finalPrice.toFixed(2),
        })
        .returning();

    if (
      !orderItemResult[0]
    ) {
      throw new Error(
        `Unable to create order item for ${product.name}.`,
      );
    }

    /*
     * Calculate the new stock.
     */
    const newQuantity =
      currentStock -
      quantity;

    /*
     * Update product stock.
     *
     * The WHERE condition also checks the
     * current stock so we never reduce it
     * below zero.
     */
    const updatedProductResult =
      await tx
        .update(products)
        .set({
          stockQuantity:
            newQuantity,

          updatedAt:
            new Date(),
        })
        .where(
          and(
            eq(
              products.id,
              product.id,
            ),
            sql`${products.stockQuantity} >= ${quantity}`,
          ),
        )
        .returning({
          id: products.id,
          stockQuantity:
            products.stockQuantity,
        });

    if (
      !updatedProductResult[0]
    ) {
      throw new Error(
        `Unable to update stock for ${product.name}.`,
      );
    }

    /*
     * Record inventory movement.
     */
    const inventoryResult =
      await tx
        .insert(
          inventoryTransactions,
        )
        .values({
          productId:
            product.id,

          orderId:
            order.id,

          type: "SALE",

          quantityChange:
            -quantity,

          previousQuantity:
            currentStock,

          newQuantity,

          reason:
            `Sale for order ${order.orderNumber}`,
        })
        .returning();

    if (
      !inventoryResult[0]
    ) {
      throw new Error(
        `Unable to record inventory transaction for ${product.name}.`,
      );
    }
  }

  /*
   * Clear the user's cart after every
   * order item and inventory update has
   * succeeded.
   */
  await tx
    .delete(cartItems)
    .where(
      sql`${cartItems.cartId} IN (
        SELECT id
        FROM carts
        WHERE user_id = ${data.order.userId}
      )`,
    );

  return order;
}