
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

  const [category, categories] = await Promise.all([
    getCategoryById(id),
    getAllCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const parentCategories = categories
    .filter((item) => item.id !== category.id)
    .map((item) => ({
      id: item.id,
      name: item.name,
    }));

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back navigation */}
        <Link
          href="/admin/categories"
          className="group inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <span
            className="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          >
            ←
          </span>
          Back to Categories
        </Link>

        {/* Digital page header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
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
                  d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Catalog Management
              </div>

              <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">
                Edit Category
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Update category information, organization, and visibility.
              </p>

              <p className="mt-2 break-words text-sm text-slate-400">
                Editing:{" "}
                <span className="font-semibold text-white">
                  {category.name}
                </span>
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                category.isActive
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-slate-500/30 bg-slate-500/10 text-slate-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  category.isActive ? "bg-emerald-400" : "bg-slate-400"
                }`}
              />
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Category summary */}
          <div className="relative mt-7 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                URL Slug
              </p>
              <p className="mt-2 break-all font-mono text-sm font-semibold text-white">
                {category.slug}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Display Order
              </p>
              <p className="mt-2 text-lg font-bold text-cyan-200">
                {category.displayOrder}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Parent Category
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {category.parentId
                  ? categories.find(
                      (item) => item.id === category.parentId,
                    )?.name ?? "Unavailable"
                  : "Top-level category"}
              </p>
            </div>
          </div>
        </header>

        {/* Existing category form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Category Details
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Update the fields below and save your changes when finished.
            </p>
          </div>

          <CategoryForm
            categories={parentCategories}
            initialData={{
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description ?? "",
              imageUrl: category.imageUrl ?? "",
              parentId: category.parentId ?? "",
              displayOrder: category.displayOrder,
              isActive: category.isActive,
            }}
          />
        </section>

        <footer className="pb-2 text-center text-xs text-slate-400">
          Catalog Management · Category settings
        </footer>
      </div>
    </main>
  );
}