import Image from "next/image";
import Link from "next/link";

import {
  getActiveCategories,
} from "@/repositories/category.repository";

import {
  getFeaturedProducts,
  getPrimaryProductImage,
} from "@/repositories/product.repository";

import {
  getStoreSettings,
} from "@/repositories/store-settings.repository";

import {
  formatCurrency,
} from "@/lib/currency";

export default async function HomePage() {
  const [
    categories,
    products,
    settings,
  ] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(),
    getStoreSettings(),
  ]);

  /*
   * Store information is controlled by:
   *
   * Admin -> Settings -> Store Information
   *
   * Fallbacks are used only when a value has
   * not been configured.
   */

  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

  const storeTagline =
    settings?.tagline?.trim() ||
    "Furniture Designed for Modern Living";

  const storeDescription =
    settings?.description?.trim() ||
    "Discover thoughtfully designed furniture for every room in your home.";

  const currency =
    settings?.currency?.trim() ||
    "USD";

  /*
   * Optional footer description.
   *
   * If the admin has configured a footer
   * description, use it. Otherwise use the
   * main store description.
   */
  const footerDescription =
    settings?.footerDescription?.trim() ||
    storeDescription;

  /*
   * Optional copyright text.
   *
   * If configured by the admin, use it.
   * Otherwise generate a default copyright.
   */
  const copyrightText =
    settings?.copyrightText?.trim() ||
    `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

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
   * Create a product -> image lookup.
   */
  const imageMap = new Map(
    productImages.map((item) => [
      item.productId,
      item.image,
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

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/"
              className="font-medium"
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
              href="/categories"
              className="text-muted-foreground hover:text-foreground"
            >
              Categories
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

      {/* Hero */}

      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {storeTagline}
            </p>

            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {storeTagline}
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              {storeDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
              >
                Shop Furniture
              </Link>

              <Link
                href="/categories"
                className="inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-medium hover:bg-muted"
              >
                Browse Categories
              </Link>
            </div>
          </div>

          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border bg-muted p-8">
            <div className="text-center">
              <p
                className="text-5xl"
                aria-hidden="true"
              >
                🛋️
              </p>

              <p className="mt-4 text-lg font-medium">
                {storeName}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {storeTagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Explore
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Shop by category
            </h2>
          </div>

          <Link
            href="/categories"
            className="text-sm font-medium underline underline-offset-4"
          >
            View all
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No categories available yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories
              .slice(0, 4)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group overflow-hidden rounded-xl border"
                >
                  <div className="aspect-[4/3] bg-muted">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        width={800}
                        height={600}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        {category.name}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* Featured Products */}

      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Our selection
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Featured furniture
              </h2>
            </div>

            <Link
              href="/products"
              className="text-sm font-medium underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed bg-background p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No featured products available yet.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products
                .slice(0, 8)
                .map((product) => {
                  const image =
                    imageMap.get(product.id);

                  const price = Number(
                    product.salePrice ??
                      product.regularPrice,
                  );

                  const regularPrice =
                    Number(
                      product.regularPrice,
                    );

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group overflow-hidden rounded-xl border bg-background"
                    >
                      <div className="aspect-square bg-muted">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={
                              image.altText ??
                              product.name
                            }
                            width={800}
                            height={800}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        {product.brand && (
                          <p className="text-xs text-muted-foreground">
                            {product.brand}
                          </p>
                        )}

                        <h3 className="mt-1 font-medium">
                          {product.name}
                        </h3>

                        <div className="mt-3 flex items-center gap-2">
                          <span className="font-semibold">
                            {formatCurrency(
                              price,
                              currency,
                            )}
                          </span>

                          {product.salePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(
                                regularPrice,
                                currency,
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <p className="font-semibold text-foreground">
                {storeName}
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {footerDescription}
              </p>
            </div>

            <div className="flex gap-5 text-sm text-muted-foreground">
              <Link
                href="/products"
                className="hover:text-foreground"
              >
                Products
              </Link>

              <Link
                href="/categories"
                className="hover:text-foreground"
              >
                Categories
              </Link>

              <Link
                href="/login"
                className="hover:text-foreground"
              >
                Account
              </Link>
            </div>
          </div>

          <div className="border-t pt-5 text-sm text-muted-foreground">
            <p>{copyrightText}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}