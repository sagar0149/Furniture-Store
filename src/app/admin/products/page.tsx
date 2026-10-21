
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  getAllProducts,
  getProductImages,
} from "@/repositories/product.repository";

import { getAllCategories } from "@/repositories/category.repository";

import { getStoreCurrency } from "@/repositories/store-settings.repository";

import { formatCurrency } from "@/lib/currency";

export default async function AdminProductsPage() {
  await requireAdmin();

  const [products, categories, currency] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getStoreCurrency(),
  ]);

  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  const productImages = await Promise.all(
    products.map(async (product) => {
      const images = await getProductImages(product.id);

      return {
        productId: product.id,
        image: images[0]?.url ?? null,
      };
    }),
  );

  const imageMap = new Map(
    productImages.map((item) => [item.productId, item.image]),
  );

  const activeCount = products.filter((product) => product.isActive).length;
  const featuredCount = products.filter(
    (product) => product.isFeatured && product.isActive,
  ).length;
  const lowStockCount = products.filter(
    (product) => product.stockQuantity <= product.lowStockThreshold,
  ).length;
  const inactiveCount = products.length - activeCount;

  const totalUnits = products.reduce(
    (total, product) => total + product.stockQuantity,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Digital header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Catalog Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Products
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Manage your furniture catalog, pricing, product visibility,
                and inventory from one place.
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-900/30 transition-all hover:-translate-y-0.5 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40"
            >
              <span className="text-xl leading-none" aria-hidden="true">
                +
              </span>
              Add Product
            </Link>
          </div>

          <div className="relative mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-400">
            <span>PRODUCTS: {products.length}</span>
            <span>ACTIVE: {activeCount}</span>
            <span>STOCK UNITS: {totalUnits.toLocaleString("en-IN")}</span>
          </div>
        </header>

        {/* Statistics */}
        <section
          aria-label="Product overview"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Products
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {products.length}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Across your catalog
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-700">Active</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-700">
                  {activeCount}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Visible in your catalog
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                  />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-violet-700">Featured</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-violet-700">
                  {featuredCount}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Active featured products
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-amber-700">Low Stock</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-amber-700">
                  {lowStockCount}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Products at or below threshold
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory warning */}
        {(lowStockCount > 0 || inactiveCount > 0) && (
          <section className="grid gap-3 sm:grid-cols-2">
            {lowStockCount > 0 && (
              <Link
                href="/admin/inventory"
                className="group flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:border-amber-300 hover:bg-amber-100/70"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-amber-950">
                    Inventory needs attention
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    {lowStockCount} product
                    {lowStockCount === 1 ? "" : "s"} at or below its configured
                    stock threshold.
                  </p>
                  <span className="mt-2 inline-block text-xs font-bold text-amber-900 group-hover:underline">
                    Review inventory →
                  </span>
                </div>
              </Link>
            )}

            {inactiveCount > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path
                      strokeLinecap="round"
                      d="M5.6 5.6 18.4 18.4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    Inactive products
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {inactiveCount} product
                    {inactiveCount === 1 ? " is" : "s are"} currently inactive.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Product catalog */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Product Catalog
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review product details, prices, stock, and visibility.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              {products.length} total products
            </div>
          </div>

          {products.length === 0 ? (
            <div className="p-10 text-center sm:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12v9m-7.5-13 7.5 4.5 7.5-4.5"
                  />
                </svg>
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No products yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Create your first furniture product to start building your
                catalog.
              </p>

              <Link
                href="/admin/products/new"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/30"
              >
                <span className="text-lg" aria-hidden="true">
                  +
                </span>
                Create Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Product</th>
                    <th className="px-5 py-4 font-semibold">SKU</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const image = imageMap.get(product.id);

                    const categoryName =
                      categoryMap.get(product.categoryId) ?? "Unknown Category";

                    const isOutOfStock = product.stockQuantity === 0;

                    const isLowStock =
                      product.stockQuantity > 0 &&
                      product.stockQuantity <= product.lowStockThreshold;

                    const currentPrice = Number(
                      product.salePrice ?? product.regularPrice,
                    );

                    const regularPrice = Number(product.regularPrice);
                    const hasSale = product.salePrice !== null;

                    return (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-cyan-50/40"
                      >
                        {/* Product information */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                              {image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={image}
                                  alt={product.name}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                              ) : (
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  className="h-7 w-7 text-slate-300"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"
                                  />
                                </svg>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-xs font-semibold leading-5 text-slate-900">
                                {product.name}
                              </p>

                              {product.brand && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {product.brand}
                                </p>
                              )}

                              {product.isFeatured && (
                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                                  <span aria-hidden="true">★</span>
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
                            {product.sku}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="inline-flex max-w-40 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                            {categoryName}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="whitespace-nowrap font-bold text-slate-900">
                              {formatCurrency(currentPrice, currency)}
                            </p>

                            {hasSale && (
                              <p className="mt-1 whitespace-nowrap text-xs text-slate-400 line-through">
                                {formatCurrency(regularPrice, currency)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4">
                          <p
                            className={`font-bold ${
                              isOutOfStock
                                ? "text-rose-700"
                                : isLowStock
                                  ? "text-amber-700"
                                  : "text-slate-900"
                            }`}
                          >
                            {product.stockQuantity}
                            <span className="ml-1 text-xs font-normal text-slate-400">
                              units
                            </span>
                          </p>

                          {isOutOfStock ? (
                            <p className="mt-1 text-xs font-semibold text-rose-600">
                              Out of stock
                            </p>
                          ) : isLowStock ? (
                            <p className="mt-1 text-xs font-semibold text-amber-600">
                              Low stock
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-slate-400">
                              Stock healthy
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              product.isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                product.isActive
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            aria-label={`Edit ${product.name}`}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-800 transition-all hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-cyan-100 hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/20"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"
                              />
                            </svg>
                            Edit Product
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {products.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Displaying {products.length} product
                {products.length === 1 ? "" : "s"} from your catalog
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Product data from your store database
              </span>
            </div>
          )}
        </section>

        {/* Footer information */}
        <footer className="pb-2 text-center text-xs text-slate-400">
          Product Management · Your catalog, pricing, and inventory at a glance.
        </footer>
      </div>
    </main>
  );
}
