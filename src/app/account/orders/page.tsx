import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

import {
  getOrdersByUserId,
} from "@/repositories/order.repository";

import {
  getStoreSettings,
} from "@/repositories/store-settings.repository";

import {
  formatCurrency,
} from "@/lib/currency";

function formatDate(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(value);
}

function getStatusLabel(
  status: string,
) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default async function OrdersPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * Get the user's orders and the
   * currently configured store settings.
   *
   * Currency and store name are controlled
   * from the Admin Settings page.
   */
  const [
    orders,
    settings,
  ] = await Promise.all([
    getOrdersByUserId(user.id),
    getStoreSettings(),
  ]);

  const currency =
    settings?.currency ?? "USD";

  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

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
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            View your previous orders and
            track their status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h2 className="text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You have not placed any orders
              yet.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  {/* Order information */}

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Order Number
                    </p>

                    <h2 className="mt-1 break-all text-lg font-semibold">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(
                        order.createdAt,
                      )}
                    </p>
                  </div>

                  {/* Status */}

                  <div className="shrink-0">
                    <span className="inline-flex rounded-full border px-3 py-1 text-xs font-medium">
                      {getStatusLabel(
                        order.status,
                      )}
                    </span>
                  </div>
                </div>

                {/* Order summary */}

                <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-3">
                  {/* Total */}

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Total
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatCurrency(
                        Number(
                          order.totalAmount,
                        ),
                        currency,
                      )}
                    </p>
                  </div>

                  {/* Shipping */}

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Shipping
                    </p>

                    <p className="mt-1 text-sm">
                      {order.shippingCity},{" "}
                      {order.shippingState}
                    </p>
                  </div>

                  {/* Payment */}

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Payment
                    </p>

                    <p className="mt-1 text-sm">
                      Pending
                    </p>
                  </div>
                </div>

                {/* Actions */}

                <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row">
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
                  >
                    View Order
                  </Link>

                  <Link
                    href="/products"
                    className="inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-medium hover:bg-muted"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()}{" "}
            {storeName}. All rights
            reserved.
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