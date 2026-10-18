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
  formatCurrency,
} from "@/lib/currency";

export default async function ProductsPage() {
  /*
   * Get products, categories, store settings,
   * and the currently configured currency.
   */
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

  /*
   * Use the store name configured by the admin.
   * Fall back to "Furniture Store" only if
   * settings have not been initialized.
   */
  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

  /*
   * Get primary product images.
   */
  const productImages =
    await Promise.all(
      products.map(async (product) => {
        const image =
          await getPrimaryProductImage(
            product.id,
          );

        return {
          productId: product.id,
          image,
        };
      }),
    );

  /*
   * Create a quick product -> image lookup.
   */
  const imageMap = new Map(
    productImages.map((item) => [
      item.productId,
      item.image,
    ]),
  );

  /*
   * Create a category -> category name lookup.
   */
  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ]),
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
              className="font-medium"
            >
              Products
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

      {/* Page Header */}

      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Collection
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            All Furniture
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Explore our collection of carefully
            selected furniture for every room in
            your home.
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            {products.length}{" "}
            {products.length === 1
              ? "product"
              : "products"}
          </p>
        </div>
      </section>

      {/* Products */}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h2 className="text-lg font-semibold">
              No products available
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              There are currently no active
              products in the store.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const image =
                imageMap.get(product.id);

              const categoryName =
                categoryMap.get(
                  product.categoryId,
                );

              /*
               * Determine the current selling price.
               */
              const currentPrice = Number(
                product.salePrice ??
                  product.regularPrice,
              );

              /*
               * Regular/original price.
               */
              const regularPrice = Number(
                product.regularPrice,
              );

              /*
               * Product has a sale price.
               */
              const hasSale =
                product.salePrice !== null;

              /*
               * Low-stock state.
               */
              const isLowStock =
                product.stockQuantity <=
                product.lowStockThreshold;

              /*
               * Out-of-stock state.
               */
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
                    {/* Product Image */}

                    <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={
                            image.altText ??
                            product.name
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

                      {/* Sale Badge */}

                      {hasSale && (
                        <span className="absolute left-3 top-3 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                          Sale
                        </span>
                      )}

                      {/* Out of Stock Badge */}

                      {isOutOfStock && (
                        <span className="absolute right-3 top-3 rounded-full border bg-background px-3 py-1 text-xs font-medium">
                          Out of stock
                        </span>
                      )}
                    </div>

                    {/* Product Information */}

                    <div className="mt-4">
                      {/* Category */}

                      {categoryName && (
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {categoryName}
                        </p>
                      )}

                      {/* Product Name */}

                      <div className="mt-1 flex items-start justify-between gap-3">
                        <h2 className="font-medium leading-6">
                          {product.name}
                        </h2>
                      </div>

                      {/* Brand */}

                      {product.brand && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {product.brand}
                        </p>
                      )}

                      {/* Price */}

                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-semibold">
                          {formatCurrency(
                            currentPrice,
                            currency,
                          )}
                        </span>

                        {/* Original Price */}

                        {hasSale && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(
                              regularPrice,
                              currency,
                            )}
                          </span>
                        )}
                      </div>

                      {/* Low Stock */}

                      {!isOutOfStock &&
                        isLowStock && (
                          <p className="mt-2 text-xs font-medium text-destructive">
                            Only{" "}
                            {
                              product.stockQuantity
                            }{" "}
                            left
                          </p>
                        )}

                      {/* Out of Stock */}

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

      {/* Footer */}

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()}{" "}
            {storeName}. All rights reserved.
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