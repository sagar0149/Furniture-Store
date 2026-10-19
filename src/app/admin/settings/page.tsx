import Link from "next/link";

import { requireAdmin } from "@/lib/auth/permissions";
import { getStoreSettings } from "@/repositories/store-settings.repository";

const sections = [
  {
    title: "Store Information",
    description:
      "Manage your store name, branding, contact information, location, localization, footer, and SEO.",
    href: "/admin/settings/store-information",
    available: true,
  },
  {
    title: "Payment Providers",
    description:
      "Configure payment providers such as Stripe, PayPal, eSewa, Khalti, and Cash on Delivery.",
    href: "/admin/settings/payments",
    available: true,
  },
  {
    title: "Exchange Rates",
    description:
      "Manage currency exchange rates for international customers. Set rates relative to NPR and control how product prices are displayed in other currencies.",
    href: "/admin/settings/exchange-rates",
    available: true,
  },
  {
    title: "Social Links",
    description:
      "Manage your Facebook, Instagram, TikTok, YouTube, LinkedIn, WhatsApp, and other social links.",
    href: "/admin/settings/social-links",
    available: false,
  },
  {
    title: "Business Hours",
    description:
      "Configure your store opening and closing hours for each day of the week.",
    href: "/admin/settings/business-hours",
    available: false,
  },
  {
    title: "Shipping",
    description:
      "Configure shipping fees, free-shipping thresholds, and delivery information.",
    href: "/admin/settings/shipping",
    available: false,
  },
  {
    title: "Footer",
    description:
      "Manage footer sections, navigation links, and footer content.",
    href: "/admin/settings/footer",
    available: false,
  },
  {
    title: "SEO",
    description:
      "Manage search engine metadata and social sharing information.",
    href: "/admin/settings/seo",
    available: false,
  },
];

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await getStoreSettings();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Page header */}
        <header className="mb-8">
          <p className="text-sm text-muted-foreground">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage your furniture store configuration from one central
            location.
          </p>
        </header>

        {/* Store status */}
        <section
          aria-label="Store status"
          className="mb-8 rounded-xl border p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Store
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                {settings?.storeName ?? "Store settings not initialized"}
              </h2>

              {settings?.tagline ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {settings.tagline}
                </p>
              ) : null}
            </div>

            {settings ? (
              <Link
                href="/admin/settings/store-information"
                className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Edit Store Information
              </Link>
            ) : null}
          </div>
        </section>

        {/* Settings cards */}
        <section aria-label="Settings sections">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Configuration
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Select a section to manage its settings.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => {
              if (!section.available) {
                return (
                  <div
                    key={section.title}
                    className="rounded-xl border p-6 opacity-60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold">
                        {section.title}
                      </h3>

                      <span className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        Coming Soon
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                );
              }

              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group rounded-xl border p-6 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold group-hover:underline group-hover:underline-offset-4">
                      {section.title}
                    </h3>

                    <span
                      aria-hidden="true"
                      className="text-muted-foreground transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {section.description}
                  </p>

                  <p className="mt-4 text-xs font-medium text-foreground">
                    Manage settings
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}