
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/permissions";

import { getAllCategories } from "@/repositories/category.repository";

import {
  getProductById,
  getProductImages,
} from "@/repositories/product.repository";

import { ProductEditForm } from "@/components/admin/product-edit-form";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdmin();

  const { id } = await params;

  const [product, categories, images] = await Promise.all([
    getProductById(id),
    getAllCategories(),
    getProductImages(id),
  ]);

  if (!product) {
    notFound();
  }

  const activeImageCount = images.length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation */}
        <Link
          href="/admin/products"
          className="group inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <span
            className="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          >
            ←
          </span>
          Back to Products
        </Link>

        {/* Page header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-lg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Catalog Management
              </div>

              <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">
                Edit Product
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Update product information, pricing, inventory, specifications,
                and store visibility.
              </p>

              <p className="mt-2 break-words text-sm text-slate-400">
                Editing:{" "}
                <span className="font-semibold text-white">
                  {product.name}
                </span>
              </p>
            </div>

            <div className="relative flex shrink-0 flex-row gap-3 sm:flex-col sm:items-end">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  product.isActive
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    product.isActive ? "bg-emerald-400" : "bg-slate-400"
                  }`}
                />
                {product.isActive ? "Active" : "Inactive"}
              </span>

              {product.isFeatured && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
                  <span aria-hidden="true">★</span>
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Quick product information */}
          <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                SKU
              </p>
              <p className="mt-2 break-all font-mono text-sm font-semibold text-white">
                {product.sku}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Stock
              </p>
              <p
                className={`mt-2 text-lg font-bold ${
                  product.stockQuantity === 0
                    ? "text-rose-300"
                    : product.stockQuantity <= product.lowStockThreshold
                      ? "text-amber-300"
                      : "text-emerald-300"
                }`}
              >
                {product.stockQuantity}
                <span className="ml-1 text-xs font-medium text-slate-400">
                  units
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Category
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-white">
                {categories.find(
                  (category) => category.id === product.categoryId,
                )?.name ?? "Uncategorized"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Product Images
              </p>
              <p className="mt-2 text-lg font-bold text-cyan-200">
                {activeImageCount}
                <span className="ml-1 text-xs font-medium text-slate-400">
                  images
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* Existing product edit form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6">
          <div className="mb-5 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Product Details
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Edit the fields below and save your changes when you are finished.
            </p>
          </div>

          <ProductEditForm
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
            }))}
            initialData={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description,
              sku: product.sku,
              brand: product.brand ?? "",
              categoryId: product.categoryId,
              regularPrice: product.regularPrice,
              salePrice: product.salePrice ?? "",
              stockQuantity: product.stockQuantity,
              lowStockThreshold: product.lowStockThreshold,
              material: product.material ?? "",
              color: product.color ?? "",
              dimensions: product.dimensions ?? "",
              weight: product.weight ?? "",
              assemblyInformation: product.assemblyInformation ?? "",
              shippingInformation: product.shippingInformation ?? "",
              returnInformation: product.returnInformation ?? "",
              isFeatured: product.isFeatured,
              isActive: product.isActive,
            }}
            images={images.map((image) => ({
              id: image.id,
              url: image.url,
              publicId: image.publicId,
              altText: image.altText ?? "",
              isPrimary: image.isPrimary,
              displayOrder: image.displayOrder,
            }))}
          />
        </section>

        <footer className="pb-2 text-center text-xs text-slate-400">
          Product Management · Changes are handled by your existing product form.
        </footer>
      </div>
    </main>
  );
}
