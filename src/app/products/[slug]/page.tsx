import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/store/add-to-cart-button";

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
  formatCurrency,
} from "@/lib/currency";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product =
    await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const settings =
    await getStoreSettings();

  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

  return {
    title: `${product.name} | ${storeName}`,
    description:
      product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product =
    await getProductBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  const [
    images,
    category,
    settings,
  ] = await Promise.all([
    getProductImages(product.id),
    getCategoryById(product.categoryId),
    getStoreSettings(),
  ]);

  const currency =
    settings?.currency ?? "USD";

  const storeName =
    settings?.storeName?.trim() ||
    "Furniture Store";

  const currentPrice = Number(
    product.salePrice ??
      product.regularPrice,
  );

  const regularPrice = Number(
    product.regularPrice,
  );

  const hasSale =
    product.salePrice !== null;

  const isOutOfStock =
    product.stockQuantity <= 0;

  const isLowStock =
    !isOutOfStock &&
    product.stockQuantity <=
      product.lowStockThreshold;

  const primaryImage =
    images.find(
      (image) => image.isPrimary,
    ) ??
    images[0] ??
    null;

  const additionalImages =
    images.filter(
      (image) =>
        image.id !==
        primaryImage?.id,
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

      {/* Breadcrumb */}

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/products"
            className="hover:text-foreground"
          >
            Products
          </Link>

          {category && (
            <>
              <span>/</span>

              <span className="text-foreground">
                {category.name}
              </span>
            </>
          )}

          <span>/</span>

          <span className="max-w-[220px] truncate text-foreground">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Product */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Images */}

          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={
                    primaryImage.altText ??
                    product.name
                  }
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {additionalImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {additionalImages.map(
                  (image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                    >
                      <Image
                        src={image.url}
                        alt={
                          image.altText ??
                          product.name
                        }
                        fill
                        sizes="(max-width: 640px) 25vw, 120px"
                        className="object-cover"
                      />
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Information */}

          <div>
            {category && (
              <Link
                href={`/categories/${category.slug}`}
                className="text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
              >
                {category.name}
              </Link>
            )}

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            {product.brand && (
              <p className="mt-2 text-sm text-muted-foreground">
                by {product.brand}
              </p>
            )}

            {/* Price */}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold">
                {formatCurrency(
                  currentPrice,
                  currency,
                )}
              </span>

              {hasSale && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(
                      regularPrice,
                      currency,
                    )}
                  </span>

                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                    Sale
                  </span>
                </>
              )}
            </div>

            {/* Stock */}

            <div className="mt-5">
              {isOutOfStock ? (
                <p className="text-sm font-medium text-destructive">
                  Currently out of stock
                </p>
              ) : isLowStock ? (
                <p className="text-sm font-medium text-destructive">
                  Only{" "}
                  {product.stockQuantity}{" "}
                  left in stock
                </p>
              ) : (
                <p className="text-sm font-medium">
                  In stock
                </p>
              )}
            </div>

            {/* Description */}

            <div className="mt-8 border-t pt-8">
              <h2 className="text-lg font-semibold">
                Description
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {product.description}
              </p>
            </div>

            {/* Add to Cart */}

            <div className="mt-8">
              <AddToCartButton
                productId={product.id}
                stockQuantity={
                  product.stockQuantity
                }
              />
            </div>

            {/* SKU */}

            <div className="mt-6 border-t pt-6">
              <p className="text-xs text-muted-foreground">
                SKU
              </p>

              <p className="mt-1 text-sm">
                {product.sku}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}

      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Product Details
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.material && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Material
                </p>

                <p className="mt-2 text-sm font-medium">
                  {product.material}
                </p>
              </div>
            )}

            {product.color && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Color
                </p>

                <p className="mt-2 text-sm font-medium">
                  {product.color}
                </p>
              </div>
            )}

            {product.dimensions && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Dimensions
                </p>

                <p className="mt-2 text-sm font-medium">
                  {product.dimensions}
                </p>
              </div>
            )}

            {product.weight !== null && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Weight
                </p>

                <p className="mt-2 text-sm font-medium">
                  {product.weight} kg
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Additional Information */}

      {(product.assemblyInformation ||
        product.shippingInformation ||
        product.returnInformation) && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {product.assemblyInformation && (
              <div>
                <h2 className="font-semibold">
                  Assembly
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {
                    product.assemblyInformation
                  }
                </p>
              </div>
            )}

            {product.shippingInformation && (
              <div>
                <h2 className="font-semibold">
                  Shipping
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {
                    product.shippingInformation
                  }
                </p>
              </div>
            )}

            {product.returnInformation && (
              <div>
                <h2 className="font-semibold">
                  Returns
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {
                    product.returnInformation
                  }
                </p>
              </div>
            )}
          </div>
        </section>
      )}

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