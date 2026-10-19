
import Image from "next/image";
import Link from "next/link";

import HeroCarousel from "@/components/home/hero-carousel";
import MarketplaceHeader from "@/components/home/marketplace-header";

import { getActiveCategories } from "@/repositories/category.repository";
import {
  getActiveProducts,
  getFeaturedProducts,
  getPrimaryProductImage,
} from "@/repositories/product.repository";
import { getStoreSettings } from "@/repositories/store-settings.repository";
import { formatCurrency } from "@/lib/currency";

export default async function HomePage() {
  const [categories, products, featuredProducts, settings] =
    await Promise.all([
      getActiveCategories(),
      getActiveProducts(),
      getFeaturedProducts(),
      getStoreSettings(),
    ]);

  const storeName = settings?.storeName?.trim() || "Furniture Store";
  const currency = settings?.currency?.trim() || "USD";
  const storeDescription =
    settings?.description?.trim() ||
    "Furniture to make every room feel like home.";
  const footerDescription =
    settings?.footerDescription?.trim() || storeDescription;

  const allImages = await Promise.all(
    products.map(async (product) => ({
      productId: product.id,
      image: await getPrimaryProductImage(product.id),
    })),
  );

  const imageMap = new Map(
    allImages.map(({ productId, image }) => [productId, image]),
  );

  const headerProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand ?? null,
  }));

  const heroSlides = products
    .filter((product) => Boolean(imageMap.get(product.id)?.url))
    .slice(0, 4)
    .map((product, index) => {
      const image = imageMap.get(product.id)!;

      return {
        id: product.id,
        imageUrl: image.url,
        imageAlt: image.altText ?? product.name,
        eyebrow:
          index === 0 ? "Furniture you'll love" : "Explore our collection",
        title: index === 0 ? "Make yourself at home." : product.name,
        description:
          index === 0
            ? storeDescription
            : `Discover ${product.name} for your home.`,
        buttonText: "Shop now",
        href: `/products/${product.slug}`,
      };
    });

  const saleProducts = products.filter(
    (product) =>
      product.salePrice !== null &&
      product.salePrice !== undefined &&
      Number(product.salePrice) > 0 &&
      Number(product.salePrice) < Number(product.regularPrice),
  );

  const newArrivals = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);

  function ProductCard({
    product,
  }: {
    product: (typeof products)[number];
  }) {
    const image = imageMap.get(product.id);
    const regularPrice = Number(product.regularPrice);
    const price = Number(product.salePrice ?? product.regularPrice);
    const hasSale = price < regularPrice;
    const discount =
      hasSale && regularPrice > 0
        ? Math.round(((regularPrice - price) / regularPrice) * 100)
        : 0;

    return (
      <article className="group min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <Link
          href={`/products/${product.slug}`}
          className="block"
          aria-label={`View ${product.name}`}
        >
          <div className="group/image relative aspect-square overflow-hidden bg-[#f4f1ec]">
            {image?.url ? (
              <Image
                src={image.url}
                alt={image.altText ?? product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Image coming soon
              </div>
            )}

            {hasSale && (
              <span className="absolute left-2 top-2 rounded bg-[#b83227] px-2 py-1 text-[10px] font-bold text-white sm:text-xs">
                {discount}% OFF
              </span>
            )}

            {product.stockQuantity <= 0 && (
              <span className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-1 text-[10px] font-semibold text-white">
                OUT OF STOCK
              </span>
            )}
          </div>
        </Link>

        <div className="p-3 sm:p-4">
          {product.brand && (
            <p className="mb-1 truncate text-[10px] uppercase tracking-wider text-gray-500">
              {product.brand}
            </p>
          )}

          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 min-h-10 text-sm font-medium text-gray-900 hover:text-[#806747] sm:text-base"
          >
            {product.name}
          </Link>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-bold text-gray-900 sm:text-base">
              {formatCurrency(price, currency)}
            </span>

            {hasSale && (
              <span className="text-xs text-gray-500 line-through">
                {formatCurrency(regularPrice, currency)}
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="mt-4 flex min-h-10 items-center justify-center rounded-md border border-[#29251f] px-2 text-xs font-semibold text-[#29251f] transition hover:bg-[#29251f] hover:text-white sm:text-sm"
          >
            View product
          </Link>
        </div>
      </article>
    );
  }

  function ProductSection({
    title,
    subtitle,
    items,
    href = "/products",
  }: {
    title: string;
    subtitle: string;
    items: (typeof products)[number][];
    href?: string;
  }) {
    return (
      <section className="w-full px-4 py-9 sm:px-6 sm:py-12 lg:px-10 xl:px-12">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#806747] sm:text-xs">
              {subtitle}
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-[#29251f] sm:text-2xl lg:text-3xl">
              {title}
            </h2>
          </div>

          <Link
            href={href}
            className="shrink-0 text-xs font-semibold text-[#806747] hover:underline sm:text-sm"
          >
            View all →
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            Products will appear here when available.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-white text-[#29251f]">
      <MarketplaceHeader
        storeName={storeName}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        }))}
        products={headerProducts}
      />

      <div className="w-full px-0 pt-0">
        <HeroCarousel slides={heroSlides} />
      </div>

      <section className="w-full border-b border-gray-200 bg-[#faf8f5]">
        <div className="grid w-full grid-cols-2 divide-x divide-gray-200 px-3 sm:grid-cols-4 sm:px-6 lg:px-10 xl:px-12">
          {[
            {
              icon: "✓",
              title: "Quality furniture",
              text: "Made for everyday living",
            },
            {
              icon: "↗",
              title: "Great value",
              text: "Discover selected deals",
            },
            {
              icon: "◇",
              title: "Easy shopping",
              text: "Browse by category",
            },
            {
              icon: "♡",
              title: "Find your style",
              text: "Make your home yours",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 px-2 py-4 sm:px-5 sm:py-6"
            >
              <span className="text-xl text-[#806747]">{item.icon}</span>
              <div>
                <h2 className="text-xs font-semibold sm:text-sm">
                  {item.title}
                </h2>
                <p className="mt-1 hidden text-xs text-gray-500 sm:block">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full px-4 pt-9 sm:px-6 lg:px-10 xl:px-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#806747] sm:text-xs">
              Browse by room
            </p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl lg:text-3xl">
              Popular collections
            </h2>
          </div>

          <Link
            href="/categories"
            className="shrink-0 text-xs font-semibold text-[#806747] hover:underline sm:text-sm"
          >
            All categories →
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-lg bg-[#faf8f5] p-6 text-sm text-gray-500">
            Categories will appear here when available.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-md"
              >
                <div className="relative aspect-[5/3] overflow-hidden bg-[#f4f1ec]">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      {category.name}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
                  <span className="text-sm font-semibold">
                    {category.name}
                  </span>
                  <span className="text-[#806747]">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <ProductSection
        title="Best sellers on discount"
        subtitle="Deals worth discovering"
        items={saleProducts.slice(0, 12)}
      />

      <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="relative w-full overflow-hidden rounded-xl bg-[#e8dfd2]">
          <div className="grid items-center md:grid-cols-2">
            <div className="px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#806747]">
                Your home, your way
              </p>

              <h2 className="mt-3 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
                A better space starts with the right furniture.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-[#66594b]">
                Explore pieces for your living room, bedroom, dining area, and
                beyond.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-md bg-[#29251f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#806747]"
              >
                Explore all furniture →
              </Link>
            </div>

            <div className="hidden min-h-[280px] items-center justify-center bg-[#d5c5b0] p-8 md:flex">
              <div className="max-w-sm text-center">
                <span className="text-6xl">⌂</span>
                <p className="mt-4 font-serif text-3xl text-[#453326]">
                  Make room for living.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductSection
        title="Featured furniture"
        subtitle="Selected for you"
        items={featuredProducts.slice(0, 12)}
      />

      <ProductSection
        title="New arrivals"
        subtitle="Fresh finds"
        items={newArrivals}
      />

      <footer className="mt-8 w-full bg-[#242424] text-white">
        <div className="grid w-full gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10 xl:px-12">
          <div className="sm:col-span-2">
            <Link href="/" className="text-xl font-bold">
              {storeName}
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-gray-300">
              {footerDescription}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Shop</h2>
            <div className="mt-3 flex flex-col gap-3 text-sm text-gray-300">
              <Link href="/products" className="hover:text-white">
                All products
              </Link>
              <Link href="/categories" className="hover:text-white">
                Categories
              </Link>
              <Link href="/cart" className="hover:text-white">
                Shopping cart
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Your account</h2>
            <div className="mt-3 flex flex-col gap-3 text-sm text-gray-300">
              <Link href="/login" className="hover:text-white">
                Sign in
              </Link>
              <Link href="/account" className="hover:text-white">
                My account
              </Link>
              <Link href="/account/orders" className="hover:text-white">
                My orders
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 px-4 py-5 text-center text-xs text-gray-300">
          {settings?.copyrightText?.trim() ||
            `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </div>
      </footer>
    </main>
  );
}
