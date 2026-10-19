
"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

type HeaderCategory = {
  id: string;
  name: string;
  slug: string;
};

type HeaderProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
};

type MarketplaceHeaderProps = {
  storeName: string;
  categories: HeaderCategory[];
  products: HeaderProduct[];
};

export default function MarketplaceHeader({
  storeName,
  categories,
  products,
}: MarketplaceHeaderProps) {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [search, products]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim().toLowerCase();
    if (!query) return;

    const exactMatch = products.find(
      (product) =>
        product.name.toLowerCase() === query ||
        product.slug.toLowerCase() === query,
    );

    if (exactMatch) {
      window.location.href = `/products/${exactMatch.slug}`;
      return;
    }

    if (suggestions.length > 0) {
      window.location.href = `/products/${suggestions[0].slug}`;
      return;
    }

    window.location.href = "/products";
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e5e5] bg-white shadow-sm">
      <div className="bg-[#242424] px-3 py-2 text-center text-[10px] font-medium tracking-wide text-white sm:text-xs">
        Special offers on selected furniture · Discover your next favorite
      </div>

      <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-6 lg:gap-8 lg:px-10 xl:px-12">
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-md border border-gray-200 px-3 py-2 text-xl lg:hidden"
        >
          ☰
        </button>

        <Link
          href="/"
          className="min-w-0 shrink-0 text-lg font-extrabold tracking-tight text-[#282828] sm:text-2xl"
        >
          {storeName}
        </Link>

        <form
          onSubmit={handleSearch}
          className="relative ml-auto hidden max-w-3xl flex-1 md:block"
        >
          <div className="flex h-11 overflow-hidden rounded-lg border border-gray-300 focus-within:border-[#806747] focus-within:ring-2 focus-within:ring-[#806747]/15">
            <label htmlFor="desktop-product-search" className="sr-only">
              Search furniture
            </label>

            <input
              id="desktop-product-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setSearchFocused(false), 150);
              }}
              placeholder="Search for sofas, beds, chairs..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-500"
            />

            <button
              type="submit"
              className="bg-[#282828] px-6 text-sm font-semibold text-white transition hover:bg-[#806747]"
            >
              Search
            </button>
          </div>

          {searchFocused && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setSearchFocused(false)}
                  className="block border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
                >
                  <span className="block text-sm font-medium text-gray-900">
                    {product.name}
                  </span>
                  {product.brand && (
                    <span className="mt-1 block text-xs text-gray-500">
                      {product.brand}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </form>

        <nav className="ml-auto hidden shrink-0 items-center gap-5 text-center text-sm lg:flex">
          <Link href="/account" className="text-gray-700 hover:text-[#806747]">
            <span className="block text-lg">♙</span>
            <span>Account</span>
          </Link>

          <Link
            href="/account/orders"
            className="text-gray-700 hover:text-[#806747]"
          >
            <span className="block text-lg">▤</span>
            <span>Orders</span>
          </Link>

          <Link href="/cart" className="text-gray-700 hover:text-[#806747]">
            <span className="block text-lg">🛒</span>
            <span>Cart</span>
          </Link>
        </nav>

        <Link
          href="/cart"
          aria-label="Open shopping cart"
          className="ml-auto rounded-lg bg-[#282828] px-3 py-2 text-sm font-semibold text-white hover:bg-[#806747] md:ml-0 lg:hidden"
        >
          Cart
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="relative border-t border-gray-100 px-4 py-3 md:hidden"
      >
        <label htmlFor="mobile-product-search" className="sr-only">
          Search furniture
        </label>

        <div className="flex overflow-hidden rounded-lg border border-gray-300">
          <input
            id="mobile-product-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setSearchFocused(false), 150);
            }}
            placeholder="Search furniture..."
            autoComplete="off"
            className="min-w-0 flex-1 px-3 py-3 text-sm text-gray-900 outline-none"
          />

          <button
            type="submit"
            className="bg-[#282828] px-4 text-sm font-medium text-white"
          >
            Search
          </button>
        </div>

        {searchFocused && suggestions.length > 0 && (
          <div className="absolute left-4 right-4 top-full z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
            {suggestions.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={() => setSearchFocused(false)}
                className="block border-b border-gray-100 px-4 py-3 text-sm last:border-0 hover:bg-gray-50"
              >
                {product.name}
              </Link>
            ))}
          </div>
        )}
      </form>

      <nav className="hidden w-full border-t border-gray-100 lg:block">
        <div className="flex w-full items-center gap-5 overflow-x-auto px-4 py-3 text-sm font-medium sm:px-6 lg:gap-7 lg:px-10 xl:px-12">
          <Link href="/products" className="shrink-0 hover:text-[#806747]">
            All Products
          </Link>

          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="shrink-0 text-gray-700 hover:text-[#806747]"
            >
              {category.name}
            </Link>
          ))}

          <Link
            href="/categories"
            className="ml-auto shrink-0 font-semibold text-[#806747]"
          >
            All Categories →
          </Link>
        </div>
      </nav>

      {menuOpen && (
        <nav className="max-h-[70vh] overflow-y-auto border-t border-gray-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col">
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="border-b border-gray-100 py-3 text-sm"
            >
              All Products
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                onClick={() => setMenuOpen(false)}
                className="border-b border-gray-100 py-3 text-sm"
              >
                {category.name}
              </Link>
            ))}

            <Link
              href="/categories"
              onClick={() => setMenuOpen(false)}
              className="border-b border-gray-100 py-3 text-sm"
            >
              All Categories
            </Link>

            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="border-b border-gray-100 py-3 text-sm"
            >
              My Account
            </Link>

            <Link
              href="/account/orders"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm"
            >
              My Orders
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
