import Link from "next/link";

import { requireAdmin } from "@/lib/auth/permissions";
import {
  getPaymentProviders,
  type PaymentProvider,
} from "@/repositories/payment.repository";

import { PaymentProviderControls } from "@/components/admin/payment-provider-controls";

const providerInfo: Record<
  PaymentProvider,
  {
    name: string;
    description: string;
    region: string;
  }
> = {
  STRIPE: {
    name: "Stripe",
    description:
      "Credit cards, debit cards, wallets, and other international payment methods.",
    region: "International",
  },

  PAYPAL: {
    name: "PayPal",
    description:
      "PayPal checkout for customers who prefer paying with their PayPal account.",
    region: "International",
  },

  ESEWA: {
    name: "eSewa",
    description:
      "Popular digital wallet and payment service for customers in Nepal.",
    region: "Nepal",
  },

  KHALTI: {
    name: "Khalti",
    description:
      "Digital wallet and online payment service commonly used in Nepal.",
    region: "Nepal",
  },

  COD: {
    name: "Cash on Delivery",
    description:
      "Allow customers to pay when their order is delivered.",
    region: "Any country",
  },
};

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const providers =
    await getPaymentProviders();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}

        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-6 text-sm text-muted-foreground">
            Store Settings
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Payment Methods
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Choose which payment methods customers
            can use when placing orders.
          </p>
        </div>

        {/* Information */}

        <div className="mb-6 rounded-xl border bg-muted/20 p-5">
          <h2 className="font-semibold">
            Global Payment Configuration
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your store can operate in any country.
            Enable the payment providers that are
            appropriate for your customers and
            business location.
          </p>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="font-medium">
                International
              </p>

              <p className="text-muted-foreground">
                Stripe, PayPal
              </p>
            </div>

            <div>
              <p className="font-medium">
                Nepal
              </p>

              <p className="text-muted-foreground">
                eSewa, Khalti
              </p>
            </div>

            <div>
              <p className="font-medium">
                Offline
              </p>

              <p className="text-muted-foreground">
                Cash on Delivery
              </p>
            </div>
          </div>
        </div>

        {/* Providers */}

        <div className="space-y-4">
          {providers.map((provider) => {
            const info =
              providerInfo[
                provider.provider
              ];

            return (
              <div
                key={provider.id}
                className="rounded-xl border p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {info?.name ??
                          provider.provider}
                      </h2>

                      {provider.isDefault && (
                        <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
                          Default
                        </span>
                      )}

                      <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                        {info?.region ??
                          "Available"}
                      </span>
                    </div>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {info?.description ??
                        provider.description ??
                        "Payment provider."}
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Provider code:{" "}
                      {provider.provider}
                    </p>
                  </div>

                  <PaymentProviderControls
                    provider={
                      provider.provider
                    }
                    enabled={
                      provider.isEnabled
                    }
                    isDefault={
                      provider.isDefault
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}

        {providers.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <h2 className="font-semibold">
              No payment providers configured
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Run the database seed to initialize
              the supported payment providers.
            </p>
          </div>
        )}

        {/* Security note */}

        <div className="mt-8 rounded-xl border p-5">
          <h2 className="font-semibold">
            Payment Security
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Payment provider secret keys will be
            stored and used only on the server.
            They should never be exposed to
            customers or included in client-side
            code.
          </p>
        </div>
      </div>
    </main>
  );
}