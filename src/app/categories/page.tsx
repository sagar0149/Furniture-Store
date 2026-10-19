
import Image from "next/image";
import Link from "next/link";

import { getActiveCategories } from "@/repositories/category.repository";

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#29251f]">
      <header className="border-b border-[#e7dfd2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold">
            Furniture Store
          </Link>

          <nav className="flex gap-5 text-sm">
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[#98744d]">
          Find your style
        </p>

        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
          All categories
        </h1>

        <p className="mt-4 text-sm leading-6 text-[#777066]">
          Explore furniture for every room in your home.
        </p>

        {categories.length === 0 ? (
          <p className="mt-10 text-sm text-[#777066]">
            No categories are available yet.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="furniture-card group overflow-hidden rounded-2xl border border-[#e7dfd2] bg-white/70"
              >
                <div className="relative aspect-[4/4.5] overflow-hidden bg-[#eee8de]">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={800}
                      height={900}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#777066]">
                      {category.name}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-medium">{category.name}</h2>

                  {category.description && (
                    <p className="mt-2 text-sm leading-6 text-[#777066]">
                      {category.description}
                    </p>
                  )}

                  <p className="mt-4 text-sm text-[#98744d]">
                    Explore category ↗
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
