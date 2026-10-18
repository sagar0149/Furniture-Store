import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

import { formatCurrency } from "@/lib/currency";

import {
  getOrderById,
  getOrderItems,
} from "@/repositories/order.repository";

import {
  getStoreSettings,
} from "@/repositories/store-settings.repository";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default async function OrderPage({
  params,
}: OrderPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  /*
   * Get the order.
   */
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  /*
   * Security:
   *
   * Customers can only view their own orders.
   */
  if (order.userId !== user.id) {
    notFound();
  }

  /*
   * Get the order items and current store
   * settings.
   */
  const [items, settings] =
    await Promise.all([
      getOrderItems(order.id),
      getStoreSettings(),
    ]);

  /*
   * IMPORTANT:
   *
   * The order stores the currency that was
   * used when the order was created.
   *
   * Historical orders must continue using
   * their original currency even if the
   * admin changes the store currency later.
   */
  const currency = order.currency;

  /*
   * Store name is dynamic and controlled by:
   *
   * Admin -> Settings -> Store Information
   */
  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

  /*
   * Calculate the total number of products.
   */
  const totalItems = items.reduce(
    (total, item) =>
      total + item.orderItem.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}

      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            {storeName}
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground"
            >
              Products
            </Link>

            <Link
              href="/cart"
              className="text-muted-foreground hover:text-foreground"
            >
              Cart
            </Link>

            <Link
              href="/account/orders"
              className="font-medium"
            >
              My Orders
            </Link>
          </nav>
        </div>
      </header>

      {/* Page */}

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Breadcrumb */}

        <div className="mb-6">
          <Link
            href="/account/orders"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to My Orders
          </Link>
        </div>

        {/* Page Header */}

        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Order Details
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Order {order.orderNumber}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {formatDate(order.createdAt)}
            </span>

            <span>•</span>

            <span>
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}
            </span>
          </div>
        </div>

        {/* Main Content */}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left Column */}

          <div className="space-y-8">
            {/* Order Items */}

            <section className="rounded-xl border p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Order Items
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Products included in this order.
                  </p>
                </div>

                <span className="shrink-0 text-sm text-muted-foreground">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div className="mt-6 divide-y">
                {items.map((item) => {
                  const quantity =
                    item.orderItem.quantity;

                  const unitPrice = Number(
                    item.orderItem.unitPrice,
                  );

                  const finalPrice = Number(
                    item.orderItem.finalPrice,
                  );

                  return (
                    <div
                      key={item.orderItem.id}
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border text-sm font-medium">
                        {quantity}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">
                          {
                            item.orderItem
                              .productNameSnapshot
                          }
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          SKU:{" "}
                          {
                            item.orderItem
                              .skuSnapshot
                          }
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {formatCurrency(
                            unitPrice,
                            currency,
                          )}{" "}
                          × {quantity}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold">
                          {formatCurrency(
                            finalPrice,
                            currency,
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Customer Information */}

            <section className="rounded-xl border p-6">
              <h2 className="text-xl font-semibold">
                Customer Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {order.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-medium">
                    {order.customerEmail}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {order.customerPhone}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Order Status
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {formatStatus(order.status)}
                  </p>
                </div>
              </div>
            </section>

            {/* Shipping Address */}

            <section className="rounded-xl border p-6">
              <h2 className="text-xl font-semibold">
                Shipping Address
              </h2>

              <div className="mt-5 text-sm leading-6">
                <p className="font-semibold">
                  {order.shippingFullName}
                </p>

                <p className="text-muted-foreground">
                  {order.shippingPhone}
                </p>

                <div className="mt-3">
                  <p>
                    {order.shippingAddressLine1}
                  </p>

                  {order.shippingAddressLine2 && (
                    <p>
                      {order.shippingAddressLine2}
                    </p>
                  )}

                  <p>
                    {order.shippingCity},{" "}
                    {order.shippingState}{" "}
                    {order.shippingPostalCode}
                  </p>

                  <p>
                    {order.shippingCountry}
                  </p>
                </div>

                {order.shippingLandmark && (
                  <p className="mt-3 text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Landmark:
                    </span>{" "}
                    {order.shippingLandmark}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Order Summary */}

          <aside className="h-fit rounded-xl border p-6 lg:sticky lg:top-6">
            <h2 className="text-xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              {/* Subtotal */}

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Subtotal
                </span>

                <span>
                  {formatCurrency(
                    Number(order.subtotal),
                    currency,
                  )}
                </span>
              </div>

              {/* Discount */}

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Discount
                </span>

                <span>
                  {formatCurrency(
                    Number(
                      order.discountAmount,
                    ),
                    currency,
                  )}
                </span>
              </div>

              {/* Shipping */}

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Shipping
                </span>

                <span>
                  {formatCurrency(
                    Number(
                      order.shippingAmount,
                    ),
                    currency,
                  )}
                </span>
              </div>

              {/* Tax */}

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Tax
                </span>

                <span>
                  {formatCurrency(
                    Number(order.taxAmount),
                    currency,
                  )}
                </span>
              </div>

              {/* Total */}

              <div className="border-t pt-5">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-lg font-semibold">
                    {formatCurrency(
                      Number(
                        order.totalAmount,
                      ),
                      currency,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}

            <div className="mt-6 rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Order Status
              </p>

              <p className="mt-1 font-semibold">
                {formatStatus(order.status)}
              </p>
            </div>

            {/* Payment */}

            <div className="mt-4 rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Payment
              </p>

              <p className="mt-1 font-semibold">
                Pending
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Online payment will be added
                in the next step.
              </p>
            </div>

            {/* Actions */}

            <div className="mt-6 space-y-3">
              <Link
                href="/account/orders"
                className="flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
              >
                Back to My Orders
              </Link>

              <Link
                href="/products"
                className="flex h-11 items-center justify-center rounded-md border px-5 text-sm font-medium hover:bg-muted"
              >
                Continue Shopping
              </Link>

              <Link
                href="/cart"
                className="flex h-11 items-center justify-center rounded-md border px-5 text-sm font-medium hover:bg-muted"
              >
                View Cart
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer */}

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()}{" "}
            {storeName}. All rights reserved.
          </p>

          <Link
            href="/products"
            className="hover:text-foreground"
          >
            Continue Shopping
          </Link>
        </div>
      </footer>
    </main>
  );
}