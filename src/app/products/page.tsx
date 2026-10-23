
import Image from "next/image";
import Link from "next/link";

import {
  getActiveProducts,
  getPrimaryProductImage,
} from "@/repositories/product.repository";

import {
  getAllCategories,
} from "@/repositories/category.repository";

import {
  getStoreSettings,
  getStoreCurrency,
} from "@/repositories/store-settings.repository";

import {
  getEligibleDiscountsForProducts,
} from "@/repositories/discount.repository";

import {
  calculateProductDiscount,
} from "@/lib/discounts";

import {
  formatCurrency,
} from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [
    products,
    categories,
    settings,
    currency,
  ] = await Promise.all([
    getActiveProducts(),
    getAllCategories(),
    getStoreSettings(),
    getStoreCurrency(),
  ]);

  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

  // Fetch product images and eligible discounts.
  const [
    productImages,
    eligibleDiscountsByProduct,
  ] = await Promise.all([
    Promise.all(
      products.map(async (product) => {
        const image =
          await getPrimaryProductImage(product.id);

        return {
          productId: product.id,
          image,
        };
      }),
    ),
    getEligibleDiscountsForProducts(
      products.map((product) => product.id),
    ),
  ]);

  const imageMap = new Map(
    productImages.map((item) => [
      item.productId,
      item.image,
    ]),
  );

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ]),
  );

  // Calculate the best eligible discount for each product.
  const productDiscounts = new Map(
    products.map((product) => {
      const eligibleDiscounts =
        eligibleDiscountsByProduct.get(product.id) ?? [];

      const pricing = calculateProductDiscount(
        product,
        eligibleDiscounts,
      );

      return [product.id, pricing] as const;
    }),
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
              className="text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="font-medium"
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
              href="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Collection
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            All Furniture
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Explore our collection of carefully selected
            furniture for every room in your home.
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h2 className="text-lg font-semibold">
              No products available
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              There are currently no active products in the store.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const image = imageMap.get(product.id);

              const categoryName = categoryMap.get(
                product.categoryId,
              );

              const pricing = productDiscounts.get(
                product.id,
              )!;

              const hasProductSale =
                product.salePrice !== null &&
                Number(product.salePrice) <
                  Number(product.regularPrice);

              const hasPromotion =
                pricing.discountAmount > 0;

              const hasAnyDiscount =
                hasProductSale || hasPromotion;

              const discountPercentage =
                pricing.basePrice > 0 && hasPromotion
                  ? Math.round(
                      (pricing.discountAmount /
                        pricing.basePrice) *
                        100,
                    )
                  : 0;

              const isLowStock =
                product.stockQuantity <=
                product.lowStockThreshold;

              const isOutOfStock =
                product.stockQuantity <= 0;

              return (
                <article
                  key={product.id}
                  className="group"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="block"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={
                            image.altText ?? product.name
                          }
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No image available
                        </div>
                      )}

                      {hasAnyDiscount && (
                        <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">
                          {hasPromotion
                            ? `${discountPercentage}% OFF`
                            : "Sale"}
                        </span>
                      )}

                      {isOutOfStock && (
                        <span className="absolute right-3 top-3 rounded-full border bg-background px-3 py-1 text-xs font-medium">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      {categoryName && (
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {categoryName}
                        </p>
                      )}

                      <h2 className="mt-1 font-medium leading-6">
                        {product.name}
                      </h2>

                      {product.brand && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {product.brand}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {formatCurrency(
                            pricing.finalPrice,
                            currency,
                          )}
                        </span>

                        {hasAnyDiscount && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(
                              pricing.originalPrice,
                              currency,
                            )}
                          </span>
                        )}
                      </div>

                      {hasPromotion && (
                        <p className="mt-2 text-xs font-semibold text-rose-600">
                          {pricing.discountName}
                          {" — Save "}
                          {formatCurrency(
                            pricing.discountAmount,
                            currency,
                          )}
                          {" per item"}
                        </p>
                      )}

                      {!isOutOfStock && isLowStock && (
                        <p className="mt-2 text-xs font-medium text-destructive">
                          Only {product.stockQuantity} left
                        </p>
                      )}

                      {isOutOfStock && (
                        <p className="mt-2 text-xs font-medium text-muted-foreground">
                          Currently unavailable
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} {storeName}.
            All rights reserved.
          </p>

          <Link
            href="/"
            className="hover:text-foreground"
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </main>
  );
}
