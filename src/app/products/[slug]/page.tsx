
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductImageGallery } from "@/components/store/product-image-gallery";

import {
  getProductBySlug,
  getProductImages,
} from "@/repositories/product.repository";

import {
  getCategoryById,
} from "@/repositories/category.repository";

import {
  getStoreSettings,
} from "@/repositories/store-settings.repository";

import {
  getEligibleDiscounts,
} from "@/repositories/discount.repository";

import {
  getCartByUserId,
  getCartItem,
} from "@/repositories/cart.repository";

import {
  calculateProductDiscount,
} from "@/lib/discounts";

import {
  formatCurrency,
} from "@/lib/currency";

import {
  getCurrentUser,
} from "@/lib/auth/session";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const settings = await getStoreSettings();
  const storeName =
    settings?.storeName?.trim() || "Furniture Store";

  return {
    title: `${product.name} | ${storeName}`,
    description: (product.description ?? "").slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  const [
    images,
    category,
    settings,
    eligibleDiscounts,
  ] = await Promise.all([
    getProductImages(product.id),
    getCategoryById(product.categoryId),
    getStoreSettings(),
    getEligibleDiscounts([product.id]),
  ]);

  const currency =
    settings?.currency?.trim() || "USD";

  const storeName =
    settings?.storeName?.trim() || "Furniture Store";

  // Calculate the best discount eligible for this product.
  const pricing = calculateProductDiscount(
    product,
    eligibleDiscounts,
  );

  const hasProductSale =
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    Number(product.salePrice) <
      Number(product.regularPrice);

  const hasPromotion = pricing.discountAmount > 0;

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

  const isOutOfStock =
    product.stockQuantity <= 0;

  const isLowStock =
    !isOutOfStock &&
    product.stockQuantity <=
      product.lowStockThreshold;

  // Retrieve the current user's saved quantity without
  // requiring guests to sign in just to view a product.
  let initialQuantity = 0;

  try {
    const user = await getCurrentUser();

    if (user) {
      const cart = await getCartByUserId(user.id);

      if (cart) {
        const cartItem = await getCartItem(
          cart.id,
          product.id,
        );

        initialQuantity = cartItem?.quantity ?? 0;
      }
    }
  } catch (error) {
    console.error(
      "Unable to load product cart quantity:",
      error,
    );
  }

  const galleryImages = images.map((image) => ({
    id: image.id,
    url: image.url,
    altText: image.altText ?? null,
  }));

  return (
    <main className="min-h-screen w-full bg-white text-[#29251f]">
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="min-w-0 text-lg font-bold tracking-tight sm:text-xl"
          >
            {storeName}
          </Link>

          <nav className="flex shrink-0 items-center gap-3 text-xs sm:gap-6 sm:text-sm">
            <Link href="/" className="hover:text-[#806747]">
              Home
            </Link>

            <Link
              href="/products"
              className="hover:text-[#806747]"
            >
              Products
            </Link>

            <Link href="/cart" className="hover:text-[#806747]">
              Cart
            </Link>
          </nav>
        </div>
      </header>

      <div className="w-full px-4 pt-5 sm:px-6 lg:px-10 xl:px-12">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:text-sm"
        >
          <Link href="/" className="hover:text-[#806747]">
            Home
          </Link>

          <span>/</span>

          <Link
            href="/products"
            className="hover:text-[#806747]"
          >
            Products
          </Link>

          {category && (
            <>
              <span>/</span>

              <Link
                href={`/categories/${category.slug}`}
                className="hover:text-[#806747]"
              >
                {category.name}
              </Link>
            </>
          )}

          <span>/</span>

          <span className="max-w-[220px] truncate text-gray-900">
            {product.name}
          </span>
        </nav>
      </div>

      <section className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-12 xl:px-12">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <ProductImageGallery
            images={galleryImages}
            productName={product.name}
          />

          <div className="min-w-0">
            {category && (
              <Link
                href={`/categories/${category.slug}`}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-[#806747] hover:underline sm:text-sm"
              >
                {category.name}
              </Link>
            )}

            <h1 className="mt-3 break-words text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {product.brand && (
              <p className="mt-2 text-sm text-gray-500">
                Brand: {product.brand}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold sm:text-3xl">
                {formatCurrency(
                  pricing.finalPrice,
                  currency,
                )}
              </span>

              {hasAnyDiscount && (
                <span className="text-lg text-gray-500 line-through">
                  {formatCurrency(
                    pricing.originalPrice,
                    currency,
                  )}
                </span>
              )}

              {hasPromotion && (
                <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                  {discountPercentage}% OFF
                </span>
              )}

              {!hasPromotion && hasProductSale && (
                <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                  Sale
                </span>
              )}
            </div>

            {hasPromotion && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-800">
                  {pricing.discountName}
                </p>

                <p className="mt-1 text-sm text-red-700">
                  You save{" "}
                  {formatCurrency(
                    pricing.discountAmount,
                    currency,
                  )}{" "}
                  per item.
                </p>
              </div>
            )}

            <div className="mt-5">
              {isOutOfStock ? (
                <p className="text-sm font-semibold text-red-600">
                  Currently out of stock
                </p>
              ) : isLowStock ? (
                <p className="text-sm font-semibold text-orange-700">
                  Only {product.stockQuantity} left in stock
                </p>
              ) : (
                <p className="text-sm font-medium text-green-700">
                  In stock
                </p>
              )}
            </div>

            <div className="mt-7 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                {product.description ||
                  "No description available."}
              </p>
            </div>

            <div className="mt-7">
              <AddToCartButton
                productId={product.id}
                stockQuantity={product.stockQuantity}
                initialQuantity={initialQuantity}
              />
            </div>

            <div className="mt-7 border-t border-gray-200 pt-5">
              <p className="text-xs text-gray-500">
                Product SKU
              </p>

              <p className="mt-1 text-sm font-medium">
                {product.sku}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-y border-gray-200 bg-[#faf8f5] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 xl:px-12">
        <h2 className="text-2xl font-bold tracking-tight">
          Product specifications
        </h2>

        <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
          {product.material && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Material
              </p>
              <p className="mt-2 text-sm font-medium">
                {product.material}
              </p>
            </div>
          )}

          {product.color && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Color
              </p>
              <p className="mt-2 text-sm font-medium">
                {product.color}
              </p>
            </div>
          )}

          {product.dimensions && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Dimensions
              </p>
              <p className="mt-2 text-sm font-medium">
                {product.dimensions}
              </p>
            </div>
          )}

          {product.weight !== null &&
            product.weight !== undefined && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Weight
                </p>
                <p className="mt-2 text-sm font-medium">
                  {product.weight} kg
                </p>
              </div>
            )}
        </div>
      </section>

      {(product.assemblyInformation ||
        product.shippingInformation ||
        product.returnInformation) && (
        <section className="w-full px-4 py-10 sm:px-6 sm:py-12 lg:px-10 xl:px-12">
          <div className="grid gap-8 md:grid-cols-3">
            {product.assemblyInformation && (
              <div>
                <h2 className="font-semibold">
                  Assembly
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {product.assemblyInformation}
                </p>
              </div>
            )}

            {product.shippingInformation && (
              <div>
                <h2 className="font-semibold">
                  Shipping
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {product.shippingInformation}
                </p>
              </div>
            )}

            {product.returnInformation && (
              <div>
                <h2 className="font-semibold">
                  Returns
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {product.returnInformation}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="w-full border-t border-gray-200 bg-white">
        <div className="flex w-full flex-col gap-3 px-4 py-7 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10 xl:px-12">
          <p>
            © {new Date().getFullYear()} {storeName}.
            All rights reserved.
          </p>

          <Link
            href="/products"
            className="font-medium hover:text-[#806747]"
          >
            Continue shopping →
          </Link>
        </div>
      </footer>
    </main>
  );
}
