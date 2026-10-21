
import Link from "next/link";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/permissions";

type CustomersPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

export default async function AdminCustomersPage({
  searchParams,
}: CustomersPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = params.q?.trim().slice(0, 100) ?? "";

  const customerCondition = eq(users.role, "CUSTOMER");

  const whereCondition = query
    ? and(
        customerCondition,
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.email, `%${query}%`),
        ),
      )
    : customerCondition;

  const [customers, totalResult, activeResult] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereCondition)
      .orderBy(desc(users.createdAt))
      .limit(100),

    db
      .select({ value: count() })
      .from(users)
      .where(customerCondition),

    db
      .select({ value: count() })
      .from(users)
      .where(
        and(customerCondition, eq(users.isActive, true)),
      ),
  ]);

  const totalCustomers = totalResult[0]?.value ?? 0;
  const activeCustomers = activeResult[0]?.value ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Customer Management
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Customers
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            View registered customers and their account status.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              Total Customers
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {totalCustomers}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              Active Customers
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {activeCustomers}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Registered Customers
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing up to 100 matching customers, newest first.
              </p>
            </div>

            <form
              action="/admin/customers"
              method="GET"
              className="flex gap-2"
            >
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search name or email"
                maxLength={100}
                className="min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
                aria-label="Search customers by name or email"
              />

              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Search
              </button>

              {query && (
                <Link
                  href="/admin/customers"
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  Clear
                </Link>
              )}
            </form>
          </div>

          {customers.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="font-medium">
                {query ? "No matching customers" : "No customers yet"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {query
                  ? "Try another name or email address."
                  : "Registered customer accounts will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-4 py-4">
                        <p className="font-medium">{customer.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {customer.phone || "Not provided"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {formatDate(customer.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={
                            customer.isActive
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
                              : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800"
                          }
                        >
                          {customer.isActive ? "Active" : "Inactive"}
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
    </div>
  );
}
