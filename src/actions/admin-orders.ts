
"use server";

import { and, eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/permissions";
import { updateOrderStatus } from "@/repositories/order.repository";
import { restoreProductStock } from "@/repositories/inventory.repository";

const ALLOWED_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

type AllowedOrderStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(status: string): status is AllowedOrderStatus {
  return ALLOWED_STATUSES.includes(status as AllowedOrderStatus);
}

/**
 * Update an order's status.
 * Cancellation must use cancelAdminOrderAction.
 */
export async function updateAdminOrderStatusAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!orderId || !isAllowedStatus(status)) {
    revalidatePath("/admin/orders");
    return;
  }

  try {
    const result = await db
      .select({
        id: orders.id,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const order = result[0];

    if (!order || order.status === "CANCELLED") {
      revalidatePath(`/admin/orders/${orderId}`);
      return;
    }

    await updateOrderStatus(orderId, status);

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("Failed to update order status:", error);
    revalidatePath(`/admin/orders/${orderId}`);
  }
}

/**
 * Cancel an order and restore its stock in the same transaction.
 * This action does not issue a payment refund.
 */
export async function cancelAdminOrderAction(orderId: string) {
  await requireAdmin();

  const normalizedOrderId = orderId.trim();

  if (!normalizedOrderId) {
    return {
      success: false,
      message: "A valid order ID is required.",
    };
  }

  try {
    await db.transaction(async (tx) => {
      const updatedOrders = await tx
        .update(orders)
        .set({
          status: "CANCELLED",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.id, normalizedOrderId),
            notInArray(orders.status, ["CANCELLED", "DELIVERED"]),
          ),
        )
        .returning({ id: orders.id });

      if (updatedOrders.length === 0) {
        const existingOrders = await tx
          .select({
            id: orders.id,
            status: orders.status,
          })
          .from(orders)
          .where(eq(orders.id, normalizedOrderId))
          .limit(1);

        const existingOrder = existingOrders[0];

        if (!existingOrder) {
          throw new Error("ORDER_NOT_FOUND");
        }

        if (existingOrder.status === "CANCELLED") {
          throw new Error("ORDER_ALREADY_CANCELLED");
        }

        if (existingOrder.status === "DELIVERED") {
          throw new Error("DELIVERED_ORDER_CANNOT_BE_CANCELLED");
        }

        throw new Error("ORDER_CANCELLATION_FAILED");
      }

      const items = await tx
        .select({
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          productName: orderItems.productNameSnapshot,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, normalizedOrderId));

      for (const item of items) {
        if (!item.productId) continue;

        await restoreProductStock(tx as unknown as typeof db, {
          productId: item.productId,
          orderId: normalizedOrderId,
          quantity: item.quantity,
          reason: `Stock restored after cancellation: ${item.productName}`,
        });
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${normalizedOrderId}`);
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Order cancelled successfully and stock has been restored.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "ORDER_NOT_FOUND") {
      return { success: false, message: "Order not found." };
    }

    if (message === "ORDER_ALREADY_CANCELLED") {
      return {
        success: false,
        message: "This order has already been cancelled.",
      };
    }

    if (message === "DELIVERED_ORDER_CANNOT_BE_CANCELLED") {
      return {
        success: false,
        message: "A delivered order cannot be cancelled.",
      };
    }

    if (message === "ORDER_CANCELLATION_FAILED") {
      return {
        success: false,
        message: "The order could not be cancelled.",
      };
    }

    console.error("Failed to cancel order:", error);

    return {
      success: false,
      message: "Unable to cancel the order. Please try again.",
    };
  }
}