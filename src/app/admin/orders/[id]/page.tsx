
import Link from "next/link";
import { notFound } from "next/navigation";

import { CancelOrderButton } from "@/components/admin/cancel-order-button";
import { updateAdminOrderStatusAction } from "@/actions/admin-orders";
import { requireAdmin } from "@/lib/auth/permissions";
import { formatCurrency } from "@/lib/currency";
import {
  getOrderById,
  getOrderItems,
} from "@/repositories/order.repository";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminOrderDetailsPage({
  params,
  searchParams,
}: Props) {
  await requireAdmin();

  const { id } = await params;
  const { updated } = await searchParams;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    notFound();
  }

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const items = await getOrderItems(order.id);
  const currency = order.currency;

  const isCancelled = order.status === "CANCELLED";
  const isDelivered = order.status === "DELIVERED";
  const canCancel = !isCancelled && !isDelivered;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/orders"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to Orders
        </Link>

        <div className="mb-8 mt-5">
          <p className="text-sm text-muted-foreground">
            Sales Management / Orders
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Order {order.orderNumber}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>

        {updated === "1" && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm"
          >
            Order status updated successfully.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items and Summary */}
          <section className="rounded-xl border bg-card p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold">Order Items</h2>

            {items.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No order items were found.
              </p>
            ) : (
              <div className="mt-4 divide-y">
                {items.map(({ orderItem }) => (
                  <div
                    key={orderItem.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="font-medium">
                        {orderItem.productNameSnapshot}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        SKU: {orderItem.skuSnapshot}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Quantity: {orderItem.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(orderItem.finalPrice, currency)}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Unit price:{" "}
                        {formatCurrency(orderItem.unitPrice, currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-3 border-t pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal, currency)}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Discount</span>
                <span>
                  −{formatCurrency(order.discountAmount, currency)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(order.shippingAmount, currency)}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.taxAmount, currency)}</span>
              </div>

              <div className="flex justify-between gap-4 border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount, currency)}</span>
              </div>
            </div>
          </section>

          {/* Order Status, Cancellation, Customer and Address */}
          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">Order Status</h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isCancelled
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : isDelivered
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Update the fulfillment status of this order.
              </p>

              {canCancel ? (
                <form
                  action={updateAdminOrderStatusAction}
                  className="mt-4 space-y-4"
                >
                  <input
                    type="hidden"
                    name="orderId"
                    value={order.id}
                  />

                  <label
                    htmlFor="status"
                    className="block text-sm font-medium"
                  >
                    New status
                  </label>

                  <select
                    id="status"
                    name="status"
                    defaultValue={order.status}
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    Save Status
                  </button>
                </form>
              ) : (
                <div className="mt-4 rounded-lg border p-3 text-sm text-muted-foreground">
                  {isCancelled
                    ? "This order has been cancelled."
                    : "This order has been delivered. Status updates and cancellation are disabled."}
                </div>
              )}
            </section>

            {/* Dedicated Cancellation Section */}
            {canCancel && (
              <section className="rounded-xl border border-red-300 bg-red-50/50 p-5 dark:border-red-900 dark:bg-red-950/20">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  >
                    !
                  </span>

                  <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
                    Danger Zone
                  </h2>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Permanently mark this order as cancelled. The system will
                  attempt to restore its product stock and record inventory
                  transactions. This action does not automatically refund
                  the customer.
                </p>

                <div className="mt-4">
                  <CancelOrderButton
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                  />
                </div>
              </section>
            )}

            {/* Customer Details */}
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Customer</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="mt-1 font-medium">{order.customerName}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="mt-1 break-all">{order.customerEmail}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="mt-1">
                    {order.customerPhone || "Not provided"}
                  </p>
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Shipping Address</h2>

              <div className="mt-4 space-y-1 text-sm">
                <p className="font-medium">{order.shippingFullName}</p>
                <p>{order.shippingPhone}</p>
                <p>{order.shippingAddressLine1}</p>

                {order.shippingAddressLine2 && (
                  <p>{order.shippingAddressLine2}</p>
                )}

                {order.shippingLandmark && (
                  <p>Landmark: {order.shippingLandmark}</p>
                )}

                <p>
                  {order.shippingCity}, {order.shippingState}
                </p>

                <p>{order.shippingPostalCode}</p>
                <p>{order.shippingCountry}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
