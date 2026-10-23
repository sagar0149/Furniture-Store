
import Link from "next/link";


import { DiscountForm } from "@/components/admin/discount-form";
import { requireAdmin } from "@/lib/auth/permissions";
import { getAllProducts } from "@/repositories/product.repository";
import { getActiveCategories } from "@/repositories/category.repository";
import { getStoreCurrency } from "@/repositories/store-settings.repository";

export const dynamic = "force-dynamic";

export default async function NewDiscountPage() {
  await requireAdmin();

  const [products, categories, currency] =
    await Promise.all([
      getAllProducts(),
      getActiveCategories(),
      getStoreCurrency(),
    ]);

  const productOptions = products
    .filter((product) => product.isActive)
    .map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
    }));

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/discounts"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cyan-700"
        >
          <span aria-hidden="true">←</span>
          Back to discounts
        </Link>

        <header className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-lg sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Marketing · Discounts
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Create discount
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Create a percentage or fixed-amount offer,
            choose eligible products or categories, and
            schedule when the offer is active.
          </p>
        </header>

        <div className="mt-6">
          <DiscountForm
            products={productOptions}
            categories={categoryOptions}
            currency={currency}
          />
        </div>
      </div>
    </main>
  );
}
