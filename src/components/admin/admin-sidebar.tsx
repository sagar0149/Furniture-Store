
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminSidebarProps = {
  storeName: string;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "dashboard",
    group: "OVERVIEW",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: "products",
    group: "CATALOG",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "categories",
    group: "CATALOG",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: "orders",
    group: "SALES",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: "customers",
    group: "SALES",
  },
  {
    label: "Discounts",
    href: "/admin/discounts",
    icon: "discounts",
    group: "MARKETING",
  },
  {
    label: "Promotions",
    href: "/admin/promotions",
    icon: "promotions",
    group: "MARKETING",
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: "reviews",
    group: "MARKETING",
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: "inventory",
    group: "OPERATIONS",
  },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
    icon: "newsletter",
    group: "OPERATIONS",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "settings",
    group: "SYSTEM",
  },
];

function NavigationIcon({ name }: { name: string }) {
  const common = {
    className: "h-5 w-5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  return (
    <svg viewBox="0 0 24 24" {...common}>
      {name === "dashboard" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      )}

      {name === "products" && (
        <>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
        </>
      )}

      {name === "categories" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      )}

      {name === "orders" && (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </>
      )}

      {name === "customers" && (
        <>
          <circle cx="9" cy="8" r="4" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a4 4 0 0 1 0 7.5M18 14a5 5 0 0 1 3.5 6" />
        </>
      )}

      {name === "discounts" && (
        <>
          <path d="M20.5 13.5 13 21a2 2 0 0 1-2.8 0L3 13.8V3h10.8l6.7 6.7a2.7 2.7 0 0 1 0 3.8Z" />
          <circle cx="8" cy="8" r="1.2" />
          <path d="m9 15 6-6" />
        </>
      )}

      {name === "promotions" && (
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      )}

      {name === "reviews" && (
        <>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
          <path d="m12 7 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4L12 7Z" />
        </>
      )}

      {name === "inventory" && (
        <>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="M3 8v9l9 5 9-5V8M12 13v9" />
        </>
      )}

      {name === "newsletter" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </>
      )}

      {name === "settings" && (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="m19.4 15 .1.1 1.1.9-1.5 2.6-1.4-.5a7.7 7.7 0 0 1-1.7 1l-.2 1.5h-3l-.2-1.5a7.7 7.7 0 0 1-1.7-1l-1.4.5L8 16l1.1-.9a7.7 7.7 0 0 1 0-2l-1.1-.9 1.5-2.6 1.4.5a7.7 7.7 0 0 1 1.7-1l.2-1.5h3l.2 1.5a7.7 7.7 0 0 1 1.7 1l1.4-.5 1.5 2.6-1.1.9a7.7 7.7 0 0 1-.1 1.9Z" />
        </>
      )}
    </svg>
  );
}

export function AdminSidebar({ storeName }: AdminSidebarProps) {
  const pathname = usePathname();

  const groups = Array.from(
    new Set(navigation.map((item) => item.group)),
  );

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        {/* Store identity */}
        <div className="border-b border-slate-200 bg-gradient-to-br from-white to-cyan-50/40 px-5 py-5">
          <Link
            href="/admin/dashboard"
            className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 to-indigo-950 text-cyan-200 shadow-md shadow-slate-900/15 transition-transform group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                <path d="M3 12l9 5 9-5M3 16l9 5 9-5" />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="text-base font-extrabold tracking-tight text-slate-900">
                Admin Panel
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">
                {storeName}
              </p>
            </div>
          </Link>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-800">
              Store workspace
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Admin navigation"
          className="flex-1 space-y-5 overflow-y-auto px-3 py-5"
        >
          {groups.map((group) => (
            <div key={group}>
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                {group}
              </p>

              <div className="space-y-1">
                {navigation
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={[
                          "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                          isActive
                            ? "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-800 shadow-sm ring-1 ring-inset ring-cyan-100"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                        ].join(" ")}
                      >
                        {isActive && (
                          <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-gradient-to-b from-cyan-500 to-blue-600" />
                        )}

                        <span
                          className={[
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isActive
                              ? "bg-white text-cyan-700 shadow-sm"
                              : "text-slate-400 group-hover:bg-white group-hover:text-slate-700",
                          ].join(" ")}
                        >
                          <NavigationIcon name={item.icon} />
                        </span>

                        <span className="flex-1">{item.label}</span>

                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Back to Store */}
        <div className="border-t border-slate-200 bg-slate-50/70 p-4">
          <Link
            href="/"
            className="group flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-white group-hover:text-cyan-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 18 8 12l6-6M8 12h13"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5v14"
                />
              </svg>
            </span>
            <span>Back to Store</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
