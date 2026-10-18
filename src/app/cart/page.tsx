import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CartItemControls } from "@/components/store/cart-item-controls";

import { getCurrentUser } from "@/lib/auth/session";

import { formatCurrency } from "@/lib/currency";

import {
  getCartByUserId,
  getCartItems,
} from "@/repositories/cart.repository";

import {
  getStoreSettings,
} from "@/repositories/store-settings.repository";

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * Get the cart and complete store settings.
   *
   * Store name and currency are controlled
   * from Admin -> Settings -> Store Information.
   */
  const [cart, settings] =
    await Promise.all([
      getCartByUserId(user.id),
      getStoreSettings(),
    ]);

  const currency =
    settings?.currency ?? "USD";

  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

  /*
   * Get cart items.
   */
  const items = cart
    ? await getCartItems(cart.id)
    : [];

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
   * Calculate total number of items.
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
            Shopping Cart
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your Cart
          </h1>

          {items.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}{" "}
              in your cart
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h2 className="text-xl font-semibold">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Add some furniture to your cart
              to get started.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            {/* Cart Items */}

            <div className="space-y-4">
              {items.map((item) => {
                const price = Number(
                  item.product.salePrice ??
                    item.product.regularPrice,
                );

                const lineTotal =
                  price *
                  item.cartItem.quantity;

                return (
                  <article
                    key={item.cartItem.id}
                    className="flex gap-4 rounded-xl border p-4 sm:gap-6"
                  >
                    {/* Product Image */}

                    <Link
                      href={`/products/${item.product.slug}`}
                      className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border bg-muted sm:h-36 sm:w-36"
                    >
                      {item.image ? (
                        <Image
                          src={item.image.url}
                          alt={
                            item.image.altText ??
                            item.product.name
                          }
                          fill
                          sizes="144px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </Link>

                    {/* Product Information */}

                    <div className="flex min-w-0 flex-1 flex-col">
                      {item.product.brand && (
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {item.product.brand}
                        </p>
                      )}

                      <Link
                        href={`/products/${item.product.slug}`}
                        className="mt-1 font-medium hover:underline"
                      >
                        {item.product.name}
                      </Link>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatCurrency(
                          price,
                          currency,
                        )}{" "}
                        each
                      </p>

                      <div className="mt-auto pt-4">
                        <CartItemControls
                          cartItemId={
                            item.cartItem.id
                          }
                          quantity={
                            item.cartItem.quantity
                          }
                          stockQuantity={
                            item.product
                              .stockQuantity
                          }
                        />
                      </div>
                    </div>

                    {/* Line Total */}

                    <div className="shrink-0 text-right">
                      <p className="font-semibold">
                        {formatCurrency(
                          lineTotal,
                          currency,
                        )}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Order Summary */}

            <aside className="h-fit rounded-xl border p-6">
              <h2 className="text-lg font-semibold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                {/* Items */}

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Items
                  </span>

                  <span>
                    {totalItems}
                  </span>
                </div>

                {/* Subtotal */}

                <div className="flex justify-between gap-4 text-sm">
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

                {/* Total */}

                <div className="border-t pt-4">
                  <div className="flex justify-between gap-4">
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
              </div>

              {/* Checkout */}

              <Link
                href="/checkout"
                className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Checkout
              </Link>

              {/* Continue Shopping */}

              <Link
                href="/products"
                className="mt-3 flex h-11 items-center justify-center rounded-md border px-5 text-sm font-medium hover:bg-muted"
              >
                Continue Shopping
              </Link>
            </aside>
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