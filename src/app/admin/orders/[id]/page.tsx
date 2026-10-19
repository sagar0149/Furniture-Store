
import Link from "next/link";
import { notFound } from "next/navigation";

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
  "CANCELLED",
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
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    notFound();
  }

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const items = await getOrderItems(order.id);

  const currency = order.currency;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/orders"
          className="text-sm text-muted-foreground hover:text-foreground"
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
          <section className="rounded-xl border p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold">
              Order Items
            </h2>

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
                        {formatCurrency(
                          orderItem.finalPrice,
                          currency,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Unit price:{" "}
                        {formatCurrency(
                          orderItem.unitPrice,
                          currency,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-3 border-t pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Subtotal
                </span>
                <span>
                  {formatCurrency(order.subtotal, currency)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Discount
                </span>
                <span>
                  −{formatCurrency(order.discountAmount, currency)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Shipping
                </span>
                <span>
                  {formatCurrency(order.shippingAmount, currency)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Tax
                </span>
                <span>
                  {formatCurrency(order.taxAmount, currency)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span>
                  {formatCurrency(order.totalAmount, currency)}
                </span>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-xl border p-5">
              <h2 className="text-lg font-semibold">
                Order Status
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Current status:{" "}
                {order.status.replaceAll("_", " ")}
              </p>

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
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Save Status
                </button>
              </form>

              <p className="mt-3 text-xs text-muted-foreground">
                Cancelling an order does not automatically issue a refund or restore stock.
              </p>
            </section>

            <section className="rounded-xl border p-5">
              <h2 className="text-lg font-semibold">
                Customer
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="mt-1 font-medium">
                    {order.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="mt-1 break-all">
                    {order.customerEmail}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="mt-1">
                    {order.customerPhone || "Not provided"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border p-5">
              <h2 className="text-lg font-semibold">
                Shipping Address
              </h2>

              <div className="mt-4 space-y-1 text-sm">
                <p className="font-medium">
                  {order.shippingFullName}
                </p>

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
