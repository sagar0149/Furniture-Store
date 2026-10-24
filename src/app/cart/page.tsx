
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CartItemControls } from "@/components/store/cart-item-controls";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/currency";
import { calculateProductDiscount } from "@/lib/discounts";

import {
  getCartByUserId,
  getCartItems,
} from "@/repositories/cart.repository";

import {
  getEligibleDiscountsForProducts,
} from "@/repositories/discount.repository";

import {
  getStoreSettings,
} from "@/repositories/store-settings.repository";

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [cart, settings] = await Promise.all([
    getCartByUserId(user.id),
    getStoreSettings(),
  ]);

  const currency = settings?.currency ?? "USD";
  const storeName =
    settings?.storeName?.trim() || "Furniture Store";

  const items = cart ? await getCartItems(cart.id) : [];

  // Load eligible promotions for all products in this cart.
  const discountsByProduct =
    await getEligibleDiscountsForProducts(
      items.map((item) => item.product.id),
    );

  // Calculate prices and discounts on the server.
  const pricedItems = items.map((item) => {
    const discounts =
      discountsByProduct.get(item.product.id) ?? [];

    const pricing = calculateProductDiscount(
      {
        id: item.product.id,
        categoryId: item.product.categoryId,
        regularPrice: item.product.regularPrice,
        salePrice: item.product.salePrice,
      },
      discounts.map((discount) => ({
        id: discount.id,
        name: discount.name,
        type: discount.type,
        value: discount.value,
      })),
    );

    const quantity = item.cartItem.quantity;

    return {
      ...item,
      pricing,
      quantity,
      lineSubtotal: pricing.basePrice * quantity,
      lineTotal: pricing.finalPrice * quantity,
      lineSavings: pricing.discountAmount * quantity,
    };
  });

  const subtotal = pricedItems.reduce(
    (total, item) => total + item.lineSubtotal,
    0,
  );

  const totalSavings = pricedItems.reduce(
    (total, item) => total + item.lineSavings,
    0,
  );

  const total = pricedItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0,
  );

  const totalItems = pricedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // Round displayed monetary totals to two decimal places.
  const money = (amount: number) =>
    formatCurrency(
      Math.round((amount + Number.EPSILON) * 100) / 100,
      currency,
    );

  return (
    <main className="min-h-screen bg-background text-foreground">
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
              className="text-muted-foreground transition hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-muted-foreground transition hover:text-foreground"
            >
              Products
            </Link>
            <Link href="/cart" className="font-medium">
              Cart
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 animate-reveal">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Shopping Cart
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your Cart
          </h1>

          {totalItems > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          )}
        </div>

        {pricedItems.length === 0 ? (
          <div className="animate-reveal rounded-xl border border-dashed p-12 text-center">
            <h2 className="text-xl font-semibold">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Add some furniture to your cart to get started.
            </p>

            <Link
              href="/products"
              className="premium-button mt-6 inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="animate-stagger space-y-4">
              {pricedItems.map((item) => {
                const { product, image, cartItem, pricing } = item;

                return (
                  <article
                    key={cartItem.id}
                    className="furniture-card flex gap-4 rounded-xl border p-4 sm:gap-6"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="product-image relative h-28 w-28 shrink-0 rounded-lg border bg-muted sm:h-36 sm:w-36"
                    >
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.altText ?? product.name}
                          fill
                          sizes="(max-width: 640px) 112px, 144px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      {product.brand && (
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {product.brand}
                        </p>
                      )}

                      <Link
                        href={`/products/${product.slug}`}
                        className="mt-1 font-medium hover:underline"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        {pricing.discountAmount > 0 ? (
                          <>
                            <span className="font-semibold text-emerald-700">
                              {money(pricing.finalPrice)}
                            </span>
                            <span className="text-muted-foreground line-through">
                              {money(pricing.basePrice)}
                            </span>
                          </>
                        ) : (
                          <span>{money(pricing.basePrice)}</span>
                        )}
                        <span className="text-muted-foreground">
                          each
                        </span>
                      </div>

                      {pricing.discountAmount > 0 && (
                        <p className="mt-1 text-xs font-medium text-emerald-700">
                          {pricing.discountName
                            ? `${pricing.discountName} · `
                            : ""}
                          Save {money(pricing.discountAmount)} per item
                        </p>
                      )}

                      <div className="mt-auto pt-4">
                        <CartItemControls
                          cartItemId={cartItem.id}
                          quantity={cartItem.quantity}
                          stockQuantity={product.stockQuantity}
                        />
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-semibold">
                        {money(item.lineTotal)}
                      </p>

                      {item.lineSavings > 0 && (
                        <p className="mt-1 text-xs text-emerald-700">
                          Save {money(item.lineSavings)}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="animate-reveal-delay-1 h-fit rounded-xl border p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-semibold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Items
                  </span>
                  <span>{totalItems}</span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Subtotal before promotions
                  </span>
                  <span>{money(subtotal)}</span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-emerald-700">
                      Promotional savings
                    </span>
                    <span className="font-medium text-emerald-700">
                      −{money(totalSavings)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-semibold">
                      {money(total)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Shipping and any applicable taxes are calculated at checkout.
                  </p>
                </div>
              </div>

              <Link
                href="/checkout"
                className="premium-button mt-6 flex h-11 w-full items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background"
              >
                Checkout
              </Link>

              <Link
                href="/products"
                className="mt-3 flex h-11 items-center justify-center rounded-md border px-5 text-sm font-medium transition hover:bg-muted"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>

          <Link
            href="/products"
            className="transition hover:text-foreground"
          >
            Continue Shopping
          </Link>
        </div>
      </footer>
    </main>
  );
}
