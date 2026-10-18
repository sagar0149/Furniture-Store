import Link from "next/link";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  getAllProducts,
  getProductImages,
} from "@/repositories/product.repository";

import { getAllCategories } from "@/repositories/category.repository";

import {
  getStoreCurrency,
} from "@/repositories/store-settings.repository";

import { formatCurrency } from "@/lib/currency";

export default async function AdminProductsPage() {
  await requireAdmin();

  const [
    products,
    categories,
    currency,
  ] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getStoreCurrency(),
  ]);

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ]),
  );

  const productImages = await Promise.all(
    products.map(async (product) => {
      const images =
        await getProductImages(product.id);

      return {
        productId: product.id,
        image: images[0]?.url ?? null,
      };
    }),
  );

  const imageMap = new Map(
    productImages.map((item) => [
      item.productId,
      item.image,
    ]),
  );

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Catalog Management
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Products
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage your furniture products,
              pricing, inventory, and visibility.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Add Product
          </Link>
        </div>

        {/* Statistics */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              Total Products
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {products.length}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              Active
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                products.filter(
                  (product) =>
                    product.isActive,
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              Featured
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                products.filter(
                  (product) =>
                    product.isFeatured &&
                    product.isActive,
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              Low Stock
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                products.filter(
                  (product) =>
                    product.stockQuantity <=
                    product.lowStockThreshold,
                ).length
              }
            </p>
          </div>
        </div>

        {/* Products Table */}

        <div className="overflow-hidden rounded-xl border">
          {products.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <h2 className="text-lg font-semibold">
                No products yet
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Create your first furniture
                product.
              </p>

              <Link
                href="/admin/products/new"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
              >
                Create Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      Product
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      SKU
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Category
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Price
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Stock
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {products.map((product) => {
                    const image =
                      imageMap.get(
                        product.id,
                      );

                    const categoryName =
                      categoryMap.get(
                        product.categoryId,
                      ) ??
                      "Unknown Category";

                    const isLowStock =
                      product.stockQuantity <=
                      product.lowStockThreshold;

                    const currentPrice =
                      Number(
                        product.salePrice ??
                          product.regularPrice,
                      );

                    const regularPrice =
                      Number(
                        product.regularPrice,
                      );

                    const hasSale =
                      product.salePrice !==
                      null;

                    return (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        {/* Product */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                              {image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={image}
                                  alt={
                                    product.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-medium">
                                {product.name}
                              </p>

                              {product.brand && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {
                                    product.brand
                                  }
                                </p>
                              )}

                              {product.isFeatured && (
                                <span className="mt-1 inline-flex text-xs font-medium">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}

                        <td className="px-4 py-4 text-muted-foreground">
                          {product.sku}
                        </td>

                        {/* Category */}

                        <td className="px-4 py-4">
                          {categoryName}
                        </td>

                        {/* Price */}

                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium">
                              {formatCurrency(
                                currentPrice,
                                currency,
                              )}
                            </p>

                            {hasSale && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatCurrency(
                                  regularPrice,
                                  currency,
                                )}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Stock */}

                        <td className="px-4 py-4">
                          <span
                            className={
                              isLowStock
                                ? "font-medium text-destructive"
                                : ""
                            }
                          >
                            {
                              product.stockQuantity
                            }
                          </span>

                          {isLowStock && (
                            <p className="mt-1 text-xs text-destructive">
                              Low stock
                            </p>
                          )}
                        </td>

                        {/* Status */}

                        <td className="px-4 py-4">
                          <span
                            className={
                              product.isActive
                                ? "inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium"
                                : "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground"
                            }
                          >
                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-sm font-medium underline underline-offset-4 hover:no-underline"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}