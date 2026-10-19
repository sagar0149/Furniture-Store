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
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "bg-blue-100 text-blue-800";
    case "CONFIRMED":
    case "PROCESSING":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
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

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Sales Management
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Orders
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            View customer orders, payment totals, and delivery statuses.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              Total Orders
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              Pending Orders
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              Delivered Orders
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {deliveredOrders}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold">
              All Orders
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Most recent orders appear first.
            </p>
          </div>

          {allOrders.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="font-medium">No orders yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Customer orders will appear here when they are placed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">
                      Order
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">
                      Customer
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">
                      Date
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">
                      Total
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {allOrders.map((order) => (
                    <tr key={order.id}>
                     
<td className="whitespace-nowrap px-4 py-4">
  <Link
    href={`/admin/orders/${order.id}`}
    className="font-medium underline-offset-4 hover:underline"
  >
    {order.orderNumber}
  </Link>

  <p className="mt-1 text-xs text-muted-foreground">
    {order.id.slice(0, 8)}
  </p>
</td>


                      <td className="px-4 py-4">
                        <p className="font-medium">
                          {order.customerName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {order.customerEmail}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-medium">
                        {formatCurrency(
                          order.totalAmount,
                          order.currency,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(order.status)}`}
                        >
                          {order.status.replaceAll("_", " ")}
                        </span>
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
