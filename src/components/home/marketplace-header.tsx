
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

  const navLink =
    "header-nav-link relative shrink-0 text-sm text-[#453326] transition-colors duration-300 hover:text-[#a98558]";

  return (
    <header className="marketplace-header sticky top-0 z-50 w-full border-b border-[#e8e0d5] bg-white/95 shadow-[0_2px_12px_rgba(69,51,38,0.04)] backdrop-blur-xl">
      {/* Announcement bar */}
      <div className="header-announcement relative overflow-hidden bg-[#29251f] px-3 py-2 text-center text-[10px] font-medium tracking-wide text-white sm:text-xs">
        <span className="announcement-shimmer" aria-hidden="true" />
        <p className="relative z-10 animate-reveal">
          Special offers on selected furniture
          <span className="mx-2 text-[#e4c69d]">·</span>
          Discover your next favorite
        </p>
      </div>

      {/* Main header */}
      <div className="header-main flex w-full items-center gap-3 px-4 py-3 sm:px-6 lg:gap-8 lg:px-10 xl:px-12">
        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="header-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e8e0d5] text-xl text-[#453326] transition-all duration-300 hover:border-[#a98558] hover:bg-[#faf8f3] active:scale-90 lg:hidden"
        >
          <span
            className={`inline-block transition-transform duration-300 ${
              menuOpen ? "rotate-90" : "rotate-0"
            }`}
          >
            {menuOpen ? "×" : "☰"}
          </span>
        </button>

        {/* Store logo */}
        <Link
          href="/"
          className="header-logo group min-w-0 shrink-0 text-lg font-extrabold tracking-tight text-[#29251f] sm:text-2xl"
        >
          <span className="relative inline-block">
            {storeName}
            <span className="header-logo-line absolute -bottom-1 left-0 h-[2px] w-0 bg-[#a98558] transition-all duration-500 group-hover:w-full" />
          </span>
        </Link>

        {/* Desktop search */}
        <form
          onSubmit={handleSearch}
          className={`header-search relative ml-auto hidden max-w-3xl flex-1 md:block ${
            searchFocused ? "search-is-focused" : ""
          }`}
        >
          <div className="flex h-10 overflow-hidden rounded-lg border border-[#ddd4c7] bg-white transition-all duration-300 focus-within:border-[#a98558] focus-within:shadow-[0_0_0_3px_rgba(169,133,88,0.12)] sm:h-11">
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
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#29251f] outline-none placeholder:text-[#a39a8e]"
            />

            <button
              type="submit"
              className="header-search-button relative overflow-hidden bg-[#29251f] px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#806747] sm:px-6"
            >
              <span className="relative z-10">Search</span>
            </button>
          </div>

          {searchFocused && suggestions.length > 0 && (
            <div className="header-suggestions absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[#e8e0d5] bg-white shadow-xl">
              {suggestions.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setSearchFocused(false)}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className="suggestion-item block border-b border-[#f1ece5] px-4 py-3 last:border-b-0 hover:bg-[#faf8f3]"
                >
                  <span className="block text-sm font-medium text-[#29251f]">
                    {product.name}
                  </span>
                  {product.brand && (
                    <span className="mt-1 block text-xs text-[#8b7b68]">
                      {product.brand}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </form>

        {/* Desktop account links */}
        <nav className="ml-auto hidden shrink-0 items-center gap-5 text-center lg:flex">
          <Link href="/account" className="header-action">
            <span className="header-action-icon" aria-hidden="true">
              ♙
            </span>
            <span>Account</span>
          </Link>

          <Link href="/account/orders" className="header-action">
            <span className="header-action-icon" aria-hidden="true">
              ≡
            </span>
            <span>Orders</span>
          </Link>

          <Link href="/cart" className="header-action">
            <span className="header-action-icon" aria-hidden="true">
              🛒
            </span>
            <span>Cart</span>
          </Link>
        </nav>

        {/* Mobile cart */}
        <Link
          href="/cart"
          aria-label="Open shopping cart"
          className="header-mobile-cart ml-auto rounded-lg bg-[#29251f] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#806747] active:scale-95 md:ml-0 lg:hidden"
        >
          Cart
        </Link>
      </div>

      {/* Mobile search */}
      <form
        onSubmit={handleSearch}
        className="header-mobile-search relative border-t border-[#f0ebe4] px-4 py-3 md:hidden"
      >
        <label htmlFor="mobile-product-search" className="sr-only">
          Search furniture
        </label>

        <div className="flex overflow-hidden rounded-lg border border-[#ddd4c7] transition-all duration-300 focus-within:border-[#a98558] focus-within:shadow-[0_0_0_3px_rgba(169,133,88,0.12)]">
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
            className="min-w-0 flex-1 bg-white px-3 py-3 text-sm text-[#29251f] outline-none placeholder:text-[#a39a8e]"
          />

          <button
            type="submit"
            className="bg-[#29251f] px-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#806747]"
          >
            Search
          </button>
        </div>

        {searchFocused && suggestions.length > 0 && (
          <div className="header-suggestions absolute left-4 right-4 top-full z-50 overflow-hidden rounded-xl border border-[#e8e0d5] bg-white shadow-xl">
            {suggestions.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={() => setSearchFocused(false)}
                style={{ animationDelay: `${index * 45}ms` }}
                className="suggestion-item block border-b border-[#f1ece5] px-4 py-3 text-sm text-[#29251f] last:border-0 hover:bg-[#faf8f3]"
              >
                {product.name}
              </Link>
            ))}
          </div>
        )}
      </form>

      {/* Desktop category navigation */}
      <nav className="hidden w-full border-t border-[#f0ebe4] lg:block">
        <div className="header-category-nav flex w-full items-center gap-5 overflow-x-auto px-4 py-3 sm:px-6 lg:gap-7 lg:px-10 xl:px-12">
          <Link href="/products" className={navLink}>
            All Products
          </Link>

          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={navLink}
            >
              {category.name}
            </Link>
          ))}

          <Link
            href="/categories"
            className="header-all-categories ml-auto shrink-0 text-sm font-semibold text-[#806747] transition-colors duration-300 hover:text-[#29251f]"
          >
            All Categories <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>

      {/* Animated mobile navigation */}
      <div
        className={`header-mobile-menu lg:hidden ${
          menuOpen ? "header-mobile-menu-open" : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="max-h-[70vh] overflow-y-auto border-t border-[#e8e0d5] bg-white px-4 py-2">
          <div className="flex flex-col">
            <Link
              href="/products"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="mobile-nav-link"
            >
              All Products
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
                className="mobile-nav-link"
              >
                {category.name}
              </Link>
            ))}

            <Link
              href="/categories"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="mobile-nav-link"
            >
              All Categories
            </Link>

            <Link
              href="/account"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="mobile-nav-link"
            >
              My Account
            </Link>

            <Link
              href="/account/orders"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="mobile-nav-link"
            >
              My Orders
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
