
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/repositories/category.repository";
import {
  getProductsByCategoryId,
  getPrimaryProductImage,
} from "@/repositories/product.repository";
import { getStoreSettings } from "@/repositories/store-settings.repository";
import { formatCurrency } from "@/lib/currency";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);

  if (!category || !category.isActive) {
    notFound();
  }

  const [products, settings] = await Promise.all([
    getProductsByCategoryId(category.id),
    getStoreSettings(),
  ]);

  const currency = settings?.currency?.trim() || "USD";

  const productsWithImages = await Promise.all(
    products.map(async (product) => ({
      product,
      image: await getPrimaryProductImage(product.id),
    })),
  );

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#29251f]">
      <header className="border-b border-[#e7dfd2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold">
            {settings?.storeName?.trim() || "Furniture Store"}
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/categories" className="hover:text-[#98744d]">
              Categories
            </Link>
            <Link href="/products" className="hover:text-[#98744d]">
              All products
            </Link>
            <Link href="/cart" className="hover:text-[#98744d]">
              Cart
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-[#e7dfd2] bg-[#f1ece3]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            href="/categories"
            className="text-sm text-[#777066] hover:text-[#98744d]"
          >
            ← All categories
          </Link>

          <p className="mt-8 text-xs uppercase tracking-[0.24em] text-[#98744d]">
            Explore the collection
          </p>

          <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl">
            {category.name}
          </h1>

          {category.description && (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#777066] sm:text-base">
              {category.description}
            </p>
          )}

          <p className="mt-5 text-sm text-[#777066]">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {productsWithImages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d9cdbb] p-12 text-center">
            <h2 className="font-serif text-2xl">Coming soon</h2>
            <p className="mt-3 text-sm text-[#777066]">
              There are no active products in this category yet.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-[#29251f] px-6 py-3 text-sm text-white"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productsWithImages.map(({ product, image }) => {
              const price = Number(
                product.salePrice ?? product.regularPrice,
              );
              const regularPrice = Number(product.regularPrice);

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="furniture-card group overflow-hidden rounded-2xl border border-[#e7dfd2] bg-white/70"
                >
                  <div className="relative aspect-[4/4.2] overflow-hidden bg-[#eee8de]">
                    {image?.url ? (
                      <Image
                        src={image.url}
                        alt={image.altText ?? product.name}
                        width={800}
                        height={840}
                        className="h-full w-full object-cover"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#777066]">
                        No image available
                      </div>
                    )}

                    {product.salePrice && (
                      <span className="absolute left-4 top-4 rounded-full bg-[#453326] px-3 py-1.5 text-[10px] uppercase tracking-wider text-white">
                        Special price
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    {product.brand && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#98744d]">
                        {product.brand}
                      </p>
                    )}

                    <h2 className="mt-2 text-base font-medium">
                      {product.name}
                    </h2>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(price, currency)}
                      </span>

                      {product.salePrice && (
                        <span className="text-sm text-[#8c857b] line-through">
                          {formatCurrency(regularPrice, currency)}
                        </span>
                      )}
                    </div>

                    <p className="mt-4 border-t border-[#e7dfd2] pt-3 text-xs text-[#777066] group-hover:text-[#98744d]">
                      View product ↗
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-[#e7dfd2] bg-[#f1ece3] px-4 py-6 text-center text-xs text-[#777066]">
        {settings?.copyrightText?.trim() ||
          `© ${new Date().getFullYear()} ${
            settings?.storeName?.trim() || "Furniture Store"
          }. All rights reserved.`}
      </footer>
    </main>
  );
}
