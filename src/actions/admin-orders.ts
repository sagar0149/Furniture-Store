
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/permissions";
import { updateOrderStatus } from "@/repositories/order.repository";

const ALLOWED_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

export async function updateAdminOrderStatusAction(
  formData: FormData,
) {
  await requireAdmin();

  const orderId = formData.get("orderId");
  const submittedStatus = formData.get("status");

  if (
    typeof orderId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)
  ) {
    throw new Error("Invalid order ID.");
  }

  if (
    typeof submittedStatus !== "string" ||
    !ALLOWED_STATUSES.includes(submittedStatus as OrderStatus)
  ) {
    throw new Error("Invalid order status.");
  }

  const updatedOrder = await updateOrderStatus(
    orderId,
    submittedStatus as OrderStatus,
  );

  if (!updatedOrder) {
    throw new Error("Order not found.");
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  redirect(`/admin/orders/${orderId}?updated=1`);
}
