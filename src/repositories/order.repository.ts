import {
  asc,
  eq,
} from "drizzle-orm";

import { db } from "@/db";

import {
  orders,
  orderItems,
  products,
} from "@/db/schema";

type DbOrTransaction = typeof db;

export async function getOrderById(
  orderId: string,
) {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  return result[0] ?? null;
}

export async function getOrderByNumber(
  orderNumber: string,
) {
  const result = await db
    .select()
    .from(orders)
    .where(
      eq(
        orders.orderNumber,
        orderNumber,
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function getOrdersByUserId(
  userId: string,
) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(asc(orders.createdAt));
}

export async function getOrderItems(
  orderId: string,
) {
  return db
    .select({
      orderItem: orderItems,
      product: products,
    })
    .from(orderItems)
    .innerJoin(
      products,
      eq(
        orderItems.productId,
        products.id,
      ),
    )
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.createdAt));
}

export async function createOrder(
  data: {
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

    /**
     * Currency used for this order.
     *
     * Examples:
     * USD, NPR, EUR, GBP, INR
     */
    currency: string;

    subtotal: string;
    discountAmount?: string;
    shippingAmount?: string;
    taxAmount?: string;
    totalAmount: string;

    notes?: string;
    placedAt?: Date;
  },
  tx: DbOrTransaction = db,
) {
  const result = await tx
    .insert(orders)
    .values({
      orderNumber:
        data.orderNumber,

      userId:
        data.userId,

      customerName:
        data.customerName,

      customerEmail:
        data.customerEmail,

      customerPhone:
        data.customerPhone,

      shippingFullName:
        data.shippingFullName,

      shippingPhone:
        data.shippingPhone,

      shippingAddressLine1:
        data.shippingAddressLine1,

      shippingAddressLine2:
        data.shippingAddressLine2,

      shippingCity:
        data.shippingCity,

      shippingState:
        data.shippingState,

      shippingPostalCode:
        data.shippingPostalCode,

      shippingCountry:
        data.shippingCountry,

      shippingLandmark:
        data.shippingLandmark,

      /**
       * Store the currency together
       * with the order.
       *
       * This is important because the
       * store currency may change later.
       * Historical orders should keep
       * their original currency.
       */
      currency:
        data.currency,

      subtotal:
        data.subtotal,

      discountAmount:
        data.discountAmount ?? "0",

      shippingAmount:
        data.shippingAmount ?? "0",

      taxAmount:
        data.taxAmount ?? "0",

      totalAmount:
        data.totalAmount,

      notes:
        data.notes,

      placedAt:
        data.placedAt ?? new Date(),
    })
    .returning();

  return result[0] ?? null;
}

export async function createOrderItem(
  data: {
    orderId: string;
    productId: string;
    productNameSnapshot: string;
    skuSnapshot: string;
    quantity: number;
    unitPrice: string;
    discountAmount?: string;
    finalPrice: string;
  },
  tx: DbOrTransaction = db,
) {
  const result = await tx
    .insert(orderItems)
    .values({
      orderId:
        data.orderId,

      productId:
        data.productId,

      productNameSnapshot:
        data.productNameSnapshot,

      skuSnapshot:
        data.skuSnapshot,

      quantity:
        data.quantity,

      unitPrice:
        data.unitPrice,

      discountAmount:
        data.discountAmount ?? "0",

      finalPrice:
        data.finalPrice,
    })
    .returning();

  return result[0] ?? null;
}

export async function updateOrderStatus(
  orderId: string,
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED",
) {
  const result = await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  return result[0] ?? null;
}