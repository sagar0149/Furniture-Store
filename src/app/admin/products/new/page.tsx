import Link from "next/link";

import { requireAdmin } from "@/lib/auth/permissions";

import { getActiveCategories } from "@/repositories/category.repository";

import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  await requireAdmin();

  const categories =
    await getActiveCategories();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Products
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Add Product
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Add a new furniture product to your store.
          </p>
        </div>

        <ProductForm
          categories={categories.map(
            (category) => ({
              id: category.id,
              name: category.name,
            }),
          )}
        />
      </div>
    </main>
  );
}