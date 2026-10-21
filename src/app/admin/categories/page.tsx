
import Link from "next/link";

import { CategoryStatusButton } from "@/components/admin/category-status-button";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";
import { requireAdmin } from "@/lib/auth/permissions";
import { getAllCategories } from "@/repositories/category.repository";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await getAllCategories();

  const activeCount = categories.filter(
    (category) => category.isActive,
  ).length;

  const inactiveCount = categories.length - activeCount;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Digital header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Catalog Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Categories
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Organize your furniture catalog and manage category visibility
                from one place.
              </p>
            </div>

            <Link
              href="/admin/categories/new"
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-900/30 transition-all hover:-translate-y-0.5 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40"
            >
              <span className="text-xl leading-none" aria-hidden="true">
                +
              </span>
              Add Category
            </Link>
          </div>

          <div className="relative mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-400">
            <span>TOTAL CATEGORIES: {categories.length}</span>
            <span>ACTIVE: {activeCount}</span>
            <span>INACTIVE: {inactiveCount}</span>
          </div>
        </header>

        {/* Statistics */}
        <section
          aria-label="Category overview"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Categories
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {categories.length}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Categories in your catalog
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
                    d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 14.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Active Categories
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-700">
                  {activeCount}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Enabled categories
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
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8 12 2.5 2.5L16 9"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Inactive Categories
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-700">
                  {inactiveCount}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Disabled categories
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    d="m5.6 5.6 12.8 12.8"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Category table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Category Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage category names, URL slugs, display order, and status.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              {categories.length} total
            </div>
          </div>

          {categories.length === 0 ? (
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
                    d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14v6m-3-3h6"
                  />
                </svg>
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No categories yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Create your first category to organize your furniture products.
              </p>

              <Link
                href="/admin/categories/new"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/30"
              >
                <span className="text-lg" aria-hidden="true">
                  +
                </span>
                Create Category
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Slug</th>
                    <th className="px-5 py-4 font-semibold">Order</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition-colors hover:bg-cyan-50/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-700">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              className="h-5 w-5"
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

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {category.name}
                            </p>

                            {category.description && (
                              <p
                                title={category.description}
                                className="mt-1 max-w-md truncate text-xs leading-5 text-slate-500"
                              >
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="whitespace-nowrap rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
                          {category.slug}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 font-semibold text-slate-700">
                          {category.displayOrder}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            category.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              category.isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                            aria-label={`Edit ${category.name}`}
                            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800 transition-all hover:border-cyan-400 hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/20"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"
                              />
                            </svg>
                            Edit
                          </Link>

                          <CategoryStatusButton
                            id={category.id}
                            isActive={category.isActive}
                          />

                          <CategoryDeleteButton
                            id={category.id}
                            name={category.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {categories.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {categories.length} categor
                {categories.length === 1 ? "y" : "ies"}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Category data from your store database
              </span>
            </div>
          )}
        </section>

        <footer className="pb-2 text-center text-xs text-slate-400">
          Catalog Management · Keep your furniture categories organized.
        </footer>
      </div>
    </main>
  );
}
