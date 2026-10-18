import Link from "next/link";

import { requireAdmin } from "@/lib/auth/permissions";
import { getAllCategories } from "@/repositories/category.repository";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  await requireAdmin();

  const categories = await getAllCategories();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/admin/categories"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Categories
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Add Category
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a new product category.
          </p>
        </div>

        <CategoryForm categories={categories} />
      </div>
    </main>
  );
}