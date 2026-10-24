
import { requireAdmin } from "@/lib/auth/permissions";
import { getAdminPromotions } from "@/repositories/promotion.repository";
import { PromotionActions } from "@/components/admin/promotion-actions";

export const dynamic = "force-dynamic";

type PromotionStatus = {
  label: string;
  className: string;
};

function getPromotionStatus(
  enabled: boolean,
  startAt: Date | null,
  endAt: Date | null,
): PromotionStatus {
  const now = Date.now();

  if (!enabled) {
    return {
      label: "Disabled",
      className: "bg-slate-100 text-slate-700",
    };
  }

  if (startAt && new Date(startAt).getTime() > now) {
    return {
      label: "Scheduled",
      className: "bg-blue-100 text-blue-800",
    };
  }

  if (endAt && new Date(endAt).getTime() < now) {
    return {
      label: "Expired",
      className: "bg-red-100 text-red-800",
    };
  }

  return {
    label: "Active",
    className: "bg-emerald-100 text-emerald-800",
  };
}

function formatDate(date: Date | null) {
  if (!date) return "No end date";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function AdminPromotionsPage() {
  await requireAdmin();

  const promotions = await getAdminPromotions();

  const now = Date.now();

  const enabledCount = promotions.filter(
    (promotion) => promotion.enabled,
  ).length;

  const activeCount = promotions.filter((promotion) => {
    const startsAt = promotion.startAt
      ? new Date(promotion.startAt).getTime()
      : null;

    const endsAt = promotion.endAt
      ? new Date(promotion.endAt).getTime()
      : null;

    return (
      promotion.enabled &&
      (startsAt === null || startsAt <= now) &&
      (endsAt === null || endsAt >= now)
    );
  }).length;

  const scheduledCount = promotions.filter(
    (promotion) =>
      promotion.enabled &&
      promotion.startAt !== null &&
      new Date(promotion.startAt).getTime() > now,
  ).length;

  const expiredCount = promotions.filter(
    (promotion) =>
      promotion.endAt !== null &&
      new Date(promotion.endAt).getTime() < now,
  ).length;

  const stats = [
    {
      label: "Total promotions",
      value: promotions.length,
      description: "All campaigns",
    },
    {
      label: "Enabled",
      value: enabledCount,
      description: "Campaigns switched on",
    },
    {
      label: "Currently active",
      value: activeCount,
      description: "Within their schedule",
    },
    {
      label: "Scheduled",
      value: scheduledCount,
      description: "Waiting to start",
    },
  ];

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            Marketing management
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Promotions
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Manage campaign banners, promotional messages, calls to
            action, display schedules, and linked products.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
              {promotions.length} campaigns
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-cyan-100">
              {activeCount} currently active
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <article
            key={stat.label}
            style={{ animationDelay: `${index * 70}ms` }}
            className="animate-[fadeInUp_0.45s_ease-out_both] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.label}
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {stat.description}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              All promotions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review campaign details and manage publication status.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {promotions.length} total
          </span>
        </div>

        {promotions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-2xl text-cyan-700">
              ✦
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No promotions yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your promotions table is connected, but there are no
              campaigns to display. Promotion creation and editing
              forms have not been added in this step.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {promotions.map((promotion) => {
              const status = getPromotionStatus(
                promotion.enabled,
                promotion.startAt,
                promotion.endAt,
              );

              return (
                <article
                  key={promotion.id}
                  className="flex flex-col gap-5 p-5 transition-colors duration-200 hover:bg-slate-50/80 sm:p-6 xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-28 sm:w-36">
                      {promotion.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={promotion.imageUrl}
                          alt={promotion.title}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-cyan-100 text-2xl text-cyan-800">
                          ✦
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-base font-bold text-slate-900">
                          {promotion.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {promotion.subtitle && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {promotion.subtitle}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span>
                          {promotion.productIds.length} linked products
                        </span>

                        <span>
                          Order: {promotion.displayOrder}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-500">
                        <p>
                          Starts: {formatDate(promotion.startAt)}
                        </p>
                        <p>
                          Ends: {formatDate(promotion.endAt)}
                        </p>
                      </div>

                      {promotion.ctaText && (
                        <p className="mt-3 text-xs text-cyan-800">
                          CTA: {promotion.ctaText}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="xl:pl-4">
                    <PromotionActions
                      id={promotion.id}
                      enabled={promotion.enabled}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
          <p className="text-xs leading-5 text-slate-500">
            Disabling a promotion prevents it from being treated as
            enabled. Its scheduled dates remain unchanged.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
        <p className="text-sm font-semibold text-slate-800">
          Campaign health
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {expiredCount > 0
            ? `${expiredCount} promotion(s) have passed their end date. Review them and disable campaigns you no longer need.`
            : "No expired campaigns detected. Keep campaign dates updated to maintain accurate storefront promotions."}
        </p>
      </section>
    </main>
  );
}
