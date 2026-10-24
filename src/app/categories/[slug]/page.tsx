
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/repositories/category.repository";
import {
  getProductsByCategoryId,
  getPrimaryProductImage,
} from "@/repositories/product.repository";
import { getStoreSettings } from "@/repositories/store-settings.repository";
import { getEligibleDiscountsForProducts } from "@/repositories/discount.repository";
import { calculateProductDiscount } from "@/lib/discounts";
import { formatCurrency } from "@/lib/currency";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

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
  const storeName = settings?.storeName?.trim() || "Furniture Store";

  const [productsWithImages, discountsByProduct] = await Promise.all([
    Promise.all(
      products.map(async (product) => ({
        product,
        image: await getPrimaryProductImage(product.id),
      })),
    ),
    getEligibleDiscountsForProducts(products.map((product) => product.id)),
  ]);

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#29251f]">
      <header className="border-b border-[#e7dfd2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold">
            {storeName}
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
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#98744d]">
            Collection
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#777066] sm:text-base">
              {category.description}
            </p>
          )}
          <p className="mt-4 text-sm text-[#777066]">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {productsWithImages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d8cbb9] p-12 text-center">
            <h2 className="text-lg font-semibold">No products yet</h2>
            <p className="mt-2 text-sm text-[#777066]">
              Products in this collection will appear here when available.
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
              const eligibleDiscounts =
                discountsByProduct.get(product.id) ?? [];

              const pricing = calculateProductDiscount(
                product,
                eligibleDiscounts,
              );

              const hasPromotion = pricing.discountAmount > 0;
              const hasProductSale =
                Number(product.salePrice ?? product.regularPrice) <
                Number(product.regularPrice);

              const hasAnyDiscount = hasPromotion || hasProductSale;

              const discountPercentage =
                hasPromotion && pricing.basePrice > 0
                  ? Math.round(
                      (pricing.discountAmount / pricing.basePrice) * 100,
                    )
                  : hasProductSale && Number(product.regularPrice) > 0
                    ? Math.round(
                        ((Number(product.regularPrice) -
                          Number(product.salePrice)) /
                          Number(product.regularPrice)) *
                          100,
                      )
                    : 0;

              const displayPrice = pricing.finalPrice;
              const comparePrice = pricing.basePrice;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="furniture-card group overflow-hidden rounded-2xl border border-[#e7dfd2] bg-white/70 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/4.2] overflow-hidden bg-[#eee8de]">
                    {image?.url ? (
                      <Image
                        src={image.url}
                        alt={image.altText ?? product.name}
                        width={800}
                        height={840}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#777066]">
                        No image available
                      </div>
                    )}

                    {hasAnyDiscount && (
                      <span className="absolute left-4 top-4 rounded-full bg-[#b83227] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {discountPercentage > 0
                          ? `${discountPercentage}% OFF`
                          : "Special price"}
                      </span>
                    )}

                    {hasPromotion && pricing.discountName && (
                      <span className="absolute bottom-3 left-3 max-w-[85%] truncate rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#453326] shadow-sm">
                        {pricing.discountName}
                      </span>
                    )}

                    {product.stockQuantity <= 0 && (
                      <span className="absolute right-3 top-3 rounded-full bg-black/80 px-3 py-1.5 text-[10px] font-bold text-white">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    {product.brand && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#98744d]">
                        {product.brand}
                      </p>
                    )}

                    <h2 className="mt-2 line-clamp-2 text-base font-medium">
                      {product.name}
                    </h2>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(displayPrice, currency)}
                      </span>

                      {hasPromotion && (
                        <span className="text-sm text-[#8c857b] line-through">
                          {formatCurrency(comparePrice, currency)}
                        </span>
                      )}

                      {!hasPromotion && hasProductSale && (
                        <span className="text-sm text-[#8c857b] line-through">
                          {formatCurrency(Number(product.regularPrice), currency)}
                        </span>
                      )}
                    </div>

                    {hasPromotion && (
                      <p className="mt-2 text-xs font-medium text-[#98744d]">
                        Save {formatCurrency(pricing.discountAmount, currency)}
                      </p>
                    )}

                    <p className="mt-4 border-t border-[#e7dfd2] pt-3 text-xs text-[#777066] group-hover:text-[#98744d]">
                      View product →
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
          `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
      </footer>
    </main>
  );
}
