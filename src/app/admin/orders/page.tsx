
import Link from "next/link";
import { desc } from "drizzle-orm";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/permissions";
import { formatCurrency } from "@/lib/currency";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClasses(status: string) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "CONFIRMED":
    case "PROCESSING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "PENDING":
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function StatIcon({
  type,
}: {
  type: "orders" | "pending" | "delivered";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      {type === "orders" && (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 8h8M8 12h8M8 16h5"
          />
        </>
      )}

      {type === "pending" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7v5l3 2"
          />
        </>
      )}

      {type === "delivered" && (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7h11v11H3zM14 11h4l3 3v4h-7z"
          />
          <circle cx="7.5" cy="18" r="1.5" />
          <circle cx="17.5" cy="18" r="1.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6 11 2 2 4-4"
          />
        </>
      )}
    </svg>
  );
}

export default async function AdminOrdersPage() {
  await requireAdmin();

  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const totalOrders = allOrders.length;

  const pendingOrders = allOrders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const deliveredOrders = allOrders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      description: "All customer orders",
      type: "orders" as const,
      iconClass: "bg-cyan-50 text-cyan-700",
      accentClass: "from-cyan-500 to-blue-500",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      description: "Awaiting processing",
      type: "pending" as const,
      iconClass: "bg-amber-50 text-amber-700",
      accentClass: "from-amber-400 to-orange-500",
    },
    {
      label: "Delivered Orders",
      value: deliveredOrders,
      description: "Successfully delivered",
      type: "delivered" as const,
      iconClass: "bg-emerald-50 text-emerald-700",
      accentClass: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <main className="min-h-full bg-slate-50/80 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        {/* Page heading */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Sales Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Orders
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Track customer purchases, review payment totals, and monitor
                order fulfillment from one place.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                <StatIcon type="orders" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Order records</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums">
                  {totalOrders.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Statistics */}
        <section
          aria-label="Order statistics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg hover:shadow-slate-900/[0.05] sm:p-6"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accentClass}`}
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950 tabular-nums">
                    {stat.value.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {stat.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconClass} transition-transform group-hover:scale-105`}
                >
                  <StatIcon type={stat.type} />
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Orders table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-white to-cyan-50/40 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
                  <StatIcon type="orders" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    All Orders
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your most recent orders appear first.
                  </p>
                </div>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              {totalOrders} {totalOrders === 1 ? "order" : "orders"} total
            </span>
          </div>

          {allOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <StatIcon type="orders" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No orders yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Customer orders will appear here when they are placed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Order
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {allOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group transition-colors hover:bg-cyan-50/40"
                    >
                      <td className="px-5 py-5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-2 font-bold text-slate-900 transition-colors hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                        >
                          {order.orderNumber}
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-3.5 w-3.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 17 17 7M8 7h9v9"
                            />
                          </svg>
                        </Link>

                        <p className="mt-1.5 font-mono text-xs text-slate-400">
                          ID: {order.id.slice(0, 8)}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-slate-800">
                          {order.customerName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.customerEmail}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-slate-600">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5">
                        <p className="font-bold text-slate-900 tabular-nums">
                          {formatCurrency(
                            order.totalAmount,
                            order.currency,
                          )}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${statusClasses(order.status)}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {order.status.replaceAll("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {allOrders.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3.5 sm:px-6">
              <p className="text-xs text-slate-500">
                Showing all {totalOrders}{" "}
                {totalOrders === 1 ? "order" : "orders"} · Select an order
                number to view its details.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
