import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  getAllCategories,
  getCategoryById,
} from "@/repositories/category.repository";

import { CategoryForm } from "@/components/admin/category-form";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  await requireAdmin();

  const { id } = await params;

  const [category, categories] =
    await Promise.all([
      getCategoryById(id),
      getAllCategories(),
    ]);

  if (!category) {
    notFound();
  }

  const parentCategories = categories
    .filter(
      (item) => item.id !== category.id,
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
    }));

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
            Edit Category
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Update the details of{" "}
            <strong>{category.name}</strong>.
          </p>
        </div>

        <CategoryForm
          categories={parentCategories}
          initialData={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description:
              category.description ?? "",
            imageUrl:
              category.imageUrl ?? "",
            parentId:
              category.parentId ?? "",
            displayOrder:
              category.displayOrder,
            isActive:
              category.isActive,
          }}
        />
      </div>
    </main>
  );
}