
import Link from "next/link";

import { DiscountActions } from "@/components/admin/discount-actions";
import { requireAdmin } from "@/lib/auth/permissions";
import { getAdminDiscounts } from "@/repositories/discount.repository";
import { getStoreCurrency } from "@/repositories/store-settings.repository";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatDiscountValue(
  type: "PERCENTAGE" | "FIXED_AMOUNT",
  value: string | number,
  currency: string,
) {
  const amount = Number(value);

  if (type === "PERCENTAGE") {
    return `${amount}%`;
  }

  return `${currency} ${amount.toFixed(2)}`;
}

function getDiscountStatus(discount: {
  enabled: boolean;
  startAt: Date;
  endAt: Date;
}) {
  const now = new Date();

  if (!discount.enabled) {
    return {
      label: "Disabled",
      className: "bg-slate-100 text-slate-600",
    };
  }

  if (new Date(discount.startAt) > now) {
    return {
      label: "Scheduled",
      className: "bg-blue-100 text-blue-700",
    };
  }

  if (new Date(discount.endAt) < now) {
    return {
      label: "Expired",
      className: "bg-red-100 text-red-700",
    };
  }

  return {
    label: "Active",
    className: "bg-emerald-100 text-emerald-700",
  };
}

export default async function AdminDiscountsPage() {
  await requireAdmin();

  const [discounts, currency] = await Promise.all([
    getAdminDiscounts(),
    getStoreCurrency(),
  ]);

  const now = new Date();

  const activeCount = discounts.filter(
    (discount) =>
      discount.enabled &&
      new Date(discount.startAt) <= now &&
      new Date(discount.endAt) >= now,
  ).length;

  const scheduledCount = discounts.filter(
    (discount) =>
      discount.enabled &&
      new Date(discount.startAt) > now,
  ).length;

  const disabledCount = discounts.filter(
    (discount) => !discount.enabled,
  ).length;

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      <header className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Store management
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Discounts
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Manage promotional pricing, scheduled offers,
              and product-specific or store-wide discounts.
            </p>
          </div>

          <Link
            href="/admin/discounts/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            + Create discount
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total discounts
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {discounts.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Currently active
          </p>
          <p className="mt-3 text-3xl font-black text-emerald-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Scheduled
          </p>
          <p className="mt-3 text-3xl font-black text-blue-600">
            {scheduledCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Disabled
          </p>
          <p className="mt-3 text-3xl font-black text-slate-600">
            {disabledCount}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              All discounts
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review and manage your store's discount rules.
            </p>
          </div>

          <span className="text-sm font-medium text-slate-500">
            {discounts.length} total
          </span>
        </div>

        {discounts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-2xl">
              %
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No discounts yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first discount to start managing
              promotional offers for your products.
            </p>

            <Link
              href="/admin/discounts/new"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create your first discount
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {discounts.map((discount) => {
              const status = getDiscountStatus(discount);

              const targetDescription =
                discount.productIds.length === 0 &&
                discount.categoryIds.length === 0
                  ? "Store-wide"
                  : [
                      discount.productIds.length > 0
                        ? `${discount.productIds.length} product(s)`
                        : "",
                      discount.categoryIds.length > 0
                        ? `${discount.categoryIds.length} categor(ies)`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · ");

              return (
                <article
                  key={discount.id}
                  className="flex flex-col gap-5 p-5 transition hover:bg-slate-50/70 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="break-words text-base font-bold text-slate-950">
                        {discount.name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {discount.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {discount.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                      <span>
                        <strong className="text-slate-900">
                          {formatDiscountValue(
                            discount.type,
                            discount.value,
                            currency,
                          )}
                        </strong>
                      </span>

                      <span>
                        {targetDescription}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-slate-600">
                          Starts:
                        </span>{" "}
                        {formatDate(discount.startAt)}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-600">
                          Ends:
                        </span>{" "}
                        {formatDate(discount.endAt)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 lg:max-w-xs">
                    <DiscountActions
                      id={discount.id}
                      enabled={discount.enabled}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
