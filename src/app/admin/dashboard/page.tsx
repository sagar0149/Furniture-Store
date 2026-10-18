import { requireAdmin } from "@/lib/auth/permissions";

import { getDashboardStats } from "@/repositories/dashboard.repository";

import {
  getStoreCurrency,
} from "@/repositories/store-settings.repository";

import { formatCurrency } from "@/lib/currency";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [stats, currency] =
    await Promise.all([
      getDashboardStats(),
      getStoreCurrency(),
    ]);

  const cards = [
    {
      title: "Products",
      value: stats.products.toLocaleString(),
      description: "Active products",
    },
    {
      title: "Orders",
      value: stats.orders.toLocaleString(),
      description: "Total orders",
    },
    {
      title: "Customers",
      value: stats.customers.toLocaleString(),
      description: "Registered customers",
    },
    {
      title: "Revenue",
      value: formatCurrency(
        stats.revenue,
        currency,
      ),
      description: "Total order revenue",
    },
  ];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Admin Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Welcome, {admin.name}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Here's an overview of your furniture
            store.
          </p>
        </div>

        {/* Dashboard Cards */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border bg-background p-5"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>

              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {card.value}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Store Overview */}

        <div className="mt-8 rounded-xl border p-6">
          <h2 className="text-lg font-semibold">
            Store Overview
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your dashboard is connected to Neon
            PostgreSQL. More analytics and recent
            activity will be added as we build the
            store management modules.
          </p>

          <div className="mt-5 border-t pt-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Store Currency
              </span>

              <span className="text-sm font-semibold">
                {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}