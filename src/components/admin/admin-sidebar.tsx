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
  },
  {
    label: "Products",
    href: "/admin/products",
  },
  {
    label: "Categories",
    href: "/admin/categories",
  },
  {
    label: "Orders",
    href: "/admin/orders",
  },
  {
    label: "Customers",
    href: "/admin/customers",
  },
  {
    label: "Discounts",
    href: "/admin/discounts",
  },
  {
    label: "Promotions",
    href: "/admin/promotions",
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
  },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
  },
  {
    label: "Settings",
    href: "/admin/settings",
  },
];

export function AdminSidebar({
  storeName,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        {/* Brand */}

        <div className="border-b px-6 py-5">
          <Link
            href="/admin/dashboard"
            className="text-xl font-semibold tracking-tight"
          >
            Admin Panel
          </Link>

          <p className="mt-1 truncate text-xs text-muted-foreground">
            {storeName}
          </p>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`,
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Back to Store */}

        <div className="border-t p-4">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </aside>
  );
}