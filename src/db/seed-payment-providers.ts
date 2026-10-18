import { db } from "@/db";
import {
  paymentProviderSettings,
} from "@/db/schema";

const providers = [
  {
    provider: "STRIPE" as const,
    isEnabled: false,
    isDefault: false,
    description:
      "Credit and debit card payments through Stripe.",
  },
  {
    provider: "PAYPAL" as const,
    isEnabled: false,
    isDefault: false,
    description:
      "PayPal payments for supported countries and currencies.",
  },
  {
    provider: "ESEWA" as const,
    isEnabled: false,
    isDefault: false,
    description:
      "eSewa payments for Nepal.",
  },
  {
    provider: "KHALTI" as const,
    isEnabled: false,
    isDefault: false,
    description:
      "Khalti payments for Nepal.",
  },
  {
    provider: "COD" as const,
    isEnabled: true,
    isDefault: true,
    description:
      "Cash on delivery.",
  },
];

async function seedPaymentProviders() {
  console.log(
    "Initializing payment providers...",
  );

  for (const provider of providers) {
    const existing =
      await db
        .select({
          id: paymentProviderSettings.id,
        })
        .from(paymentProviderSettings)
        .where(
          (
            await import("drizzle-orm")
          ).eq(
            paymentProviderSettings.provider,
            provider.provider,
          ),
        )
        .limit(1);

    if (existing.length > 0) {
      console.log(
        `✓ ${provider.provider} already exists`,
      );
      continue;
    }

    await db
      .insert(paymentProviderSettings)
      .values(provider);

    console.log(
      `✓ ${provider.provider} created`,
    );
  }

  console.log(
    "Payment provider initialization complete.",
  );
}

seedPaymentProviders()
  .catch((error) => {
    console.error(
      "Payment provider initialization failed:",
      error,
    );
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });