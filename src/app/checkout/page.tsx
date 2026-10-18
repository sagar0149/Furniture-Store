import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/store/checkout-form";

import { getCurrentUser } from "@/lib/auth/session";

import { formatCurrency } from "@/lib/currency";

import {
  getAddressesByUserId,
} from "@/repositories/address.repository";

import {
  getCartByUserId,
  getCartItems,
} from "@/repositories/cart.repository";

import {
  getStoreSettings,
} from "@/repositories/store-settings.repository";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const cart = await getCartByUserId(user.id);

  if (!cart) {
    redirect("/cart");
  }

  const items = await getCartItems(cart.id);

  if (items.length === 0) {
    redirect("/cart");
  }

  /*
   * Get the user's shipping addresses
   * and the current store settings.
   *
   * Store name and currency are controlled
   * by Admin -> Settings -> Store Information.
   */
  const [addresses, settings] =
    await Promise.all([
      getAddressesByUserId(user.id),
      getStoreSettings(),
    ]);

  const currency =
    settings?.currency ?? "USD";

  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

  /*
   * Calculate subtotal on the server.
   */
  const subtotal = items.reduce(
    (total, item) => {
      const price = Number(
        item.product.salePrice ??
          item.product.regularPrice,
      );

      return (
        total +
        price * item.cartItem.quantity
      );
    },
    0,
  );

  /*
   * Calculate total quantity of items.
   */
  const totalItems = items.reduce(
    (total, item) =>
      total + item.cartItem.quantity,
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
              className="font-medium"
            >
              Cart
            </Link>
          </nav>
        </div>
      </header>

      {/* Page */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Checkout
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Complete Your Order
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {totalItems}{" "}
            {totalItems === 1
              ? "item"
              : "items"}{" "}
            ready for checkout.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Shipping */}

          <div className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">
              Shipping Address
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Select where you want your order
              delivered.
            </p>

            {addresses.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
                <h3 className="font-semibold">
                  No shipping address
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  You need to add a shipping
                  address before placing your
                  order.
                </p>

                <Link
                  href="/account/addresses"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
                >
                  Add Address
                </Link>
              </div>
            ) : (
              <CheckoutForm
                addresses={addresses}
              />
            )}
          </div>

          {/* Order Summary */}

          <aside className="h-fit rounded-xl border p-6">
            <h2 className="text-lg font-semibold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              {items.map((item) => {
                const price = Number(
                  item.product.salePrice ??
                    item.product.regularPrice,
                );

                const lineTotal =
                  price *
                  item.cartItem.quantity;

                return (
                  <div
                    key={item.cartItem.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Qty:{" "}
                        {item.cartItem.quantity}
                      </p>
                    </div>

                    <span className="shrink-0">
                      {formatCurrency(
                        lineTotal,
                        currency,
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}

            <div className="mt-6 border-t pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal
                </span>

                <span>
                  {formatCurrency(
                    subtotal,
                    currency,
                  )}
                </span>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="font-semibold">
                  Total
                </span>

                <span className="font-semibold">
                  {formatCurrency(
                    subtotal,
                    currency,
                  )}
                </span>
              </div>
            </div>

            {/* Back to Cart */}

            <Link
              href="/cart"
              className="mt-6 flex h-11 items-center justify-center rounded-md border px-5 text-sm font-medium hover:bg-muted"
            >
              Back to Cart
            </Link>
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