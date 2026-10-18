import Link from "next/link";
import { CategoryStatusButton } from "@/components/admin/category-status-button";
import { requireAdmin } from "@/lib/auth/permissions";
import { getAllCategories } from "@/repositories/category.repository";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";
export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await getAllCategories();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Catalog Management
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Categories
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage your furniture product categories.
            </p>
          </div>

          <Link
            href="/admin/categories/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Add Category
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border">
          {categories.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <h2 className="text-lg font-semibold">
                No categories yet
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Create your first category to organize
                your products.
              </p>

              <Link
                href="/admin/categories/new"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
              >
                Create Category
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      Category
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Slug
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Order
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
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">
                            {category.name}
                          </p>

                          {category.description && (
                            <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {category.slug}
                      </td>

                      <td className="px-4 py-4">
                        {category.displayOrder}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            category.isActive
                              ? "inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium"
                              : "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground"
                          }
                        >
                          {category.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-4">
                  <CategoryStatusButton
                id={category.id}
              isActive={category.isActive}
            />

          <Link
        href={`/admin/categories/${category.id}/edit`}
      className="text-sm font-medium underline underline-offset-4 hover:no-underline"
      >
      Edit
      </Link>

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
        </div>
      </div>
    </main>
  );
}