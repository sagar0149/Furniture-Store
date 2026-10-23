
import Link from "next/link";
import { notFound } from "next/navigation";

import { DiscountForm } from "@/components/admin/discount-form";
import { requireAdmin } from "@/lib/auth/permissions";
import { getActiveCategories } from "@/repositories/category.repository";
import { getAdminDiscountById } from "@/repositories/discount.repository";
import { getAllProducts } from "@/repositories/product.repository";
import { getStoreCurrency } from "@/repositories/store-settings.repository";

export const dynamic = "force-dynamic";

type EditDiscountPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDiscountPage({
  params,
}: EditDiscountPageProps) {
  await requireAdmin();

  const { id } = await params;

  const [discount, products, categories, currency] =
    await Promise.all([
      getAdminDiscountById(id),
      getAllProducts(),
      getActiveCategories(),
      getStoreCurrency(),
    ]);

  if (!discount) {
    notFound();
  }

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
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/discounts"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cyan-700"
        >
          <span aria-hidden="true">←</span>
          Back to discounts
        </Link>

        <header className="mt-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-lg sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Marketing · Discounts
          </p>

          <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl">
            Edit discount
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Update settings for{" "}
            <span className="font-semibold text-white">
              {discount.name}
            </span>
            .
          </p>
        </header>

        <div className="mt-6">
          <DiscountForm
            discount={{
              id: discount.id,
              name: discount.name,
              description: discount.description,
              type: discount.type,
              value: String(discount.value),
              startAt: discount.startAt,
              endAt: discount.endAt,
              enabled: discount.enabled,
              productIds: discount.productIds,
              categoryIds: discount.categoryIds,
            }}
            products={productOptions}
            categories={categoryOptions}
            currency={currency}
          />
        </div>
      </div>
    </main>
  );
}
