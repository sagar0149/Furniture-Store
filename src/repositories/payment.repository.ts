import {
  asc,
  eq,
} from "drizzle-orm";

import { db } from "@/db";

import {
  paymentProviderSettings,
} from "@/db/schema";

/**
 * Supported payment providers.
 *
 * Keep this in sync with the database enum.
 */
export type PaymentProvider =
  | "STRIPE"
  | "PAYPAL"
  | "ESEWA"
  | "KHALTI"
  | "COD";

/**
 * Get all configured payment providers.
 *
 * This is primarily useful for the admin dashboard.
 */
export async function getPaymentProviders() {
  return db
    .select()
    .from(paymentProviderSettings)
    .orderBy(
      asc(paymentProviderSettings.provider),
    );
}

/**
 * Get one payment provider configuration.
 */
export async function getPaymentProvider(
  provider: PaymentProvider,
) {
  const result = await db
    .select()
    .from(paymentProviderSettings)
    .where(
      eq(
        paymentProviderSettings.provider,
        provider,
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get all payment providers that are enabled.
 *
 * Secret configuration is intentionally NOT
 * returned by this function.
 *
 * This function is safe for server-side code
 * that needs to determine which providers are
 * available to customers.
 */
export async function getEnabledPaymentProviders() {
  const providers =
    await db
      .select({
        id: paymentProviderSettings.id,
        provider:
          paymentProviderSettings.provider,
        isEnabled:
          paymentProviderSettings.isEnabled,
        isDefault:
          paymentProviderSettings.isDefault,
        publicConfig:
          paymentProviderSettings.publicConfig,
        description:
          paymentProviderSettings.description,
      })
      .from(paymentProviderSettings)
      .where(
        eq(
          paymentProviderSettings.isEnabled,
          true,
        ),
      )
      .orderBy(
        asc(paymentProviderSettings.provider),
      );

  return providers;
}

/**
 * Get the currently configured default
 * payment provider.
 *
 * Only enabled providers can be returned
 * as the default.
 */
export async function getDefaultPaymentProvider() {
  const result = await db
    .select()
    .from(paymentProviderSettings)
    .where(
      eq(
        paymentProviderSettings.isDefault,
        true,
      ),
    )
    .limit(1);

  const provider = result[0];

  if (!provider || !provider.isEnabled) {
    return null;
  }

  return provider;
}

/**
 * Create a payment provider configuration.
 */
export async function createPaymentProvider(
  data: {
    provider: PaymentProvider;
    isEnabled?: boolean;
    isDefault?: boolean;
    publicConfig?: unknown;
    secretConfig?: unknown;
    description?: string;
  },
) {
  const result = await db
    .insert(paymentProviderSettings)
    .values({
      provider: data.provider,

      isEnabled:
        data.isEnabled ?? false,

      isDefault:
        data.isDefault ?? false,

      publicConfig:
        data.publicConfig,

      secretConfig:
        data.secretConfig,

      description:
        data.description,
    })
    .returning();

  return result[0] ?? null;
}

/**
 * Update an existing payment provider.
 */
export async function updatePaymentProvider(
  provider: PaymentProvider,
  data: {
    isEnabled?: boolean;
    isDefault?: boolean;
    publicConfig?: unknown;
    secretConfig?: unknown;
    description?: string | null;
  },
) {
  const result = await db
    .update(paymentProviderSettings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      eq(
        paymentProviderSettings.provider,
        provider,
      ),
    )
    .returning();

  return result[0] ?? null;
}

/**
 * Enable or disable a payment provider.
 */
export async function setPaymentProviderEnabled(
  provider: PaymentProvider,
  enabled: boolean,
) {
  const result = await db
    .update(paymentProviderSettings)
    .set({
      isEnabled: enabled,
      updatedAt: new Date(),
    })
    .where(
      eq(
        paymentProviderSettings.provider,
        provider,
      ),
    )
    .returning();

  return result[0] ?? null;
}

/**
 * Clear the default provider.
 *
 * This is useful before assigning another
 * provider as the default.
 */
export async function clearDefaultPaymentProvider() {
  return db
    .update(paymentProviderSettings)
    .set({
      isDefault: false,
      updatedAt: new Date(),
    });
}

/**
 * Set one provider as the default.
 *
 * The provider is also enabled automatically.
 */
export async function setDefaultPaymentProvider(
  provider: PaymentProvider,
) {
  await clearDefaultPaymentProvider();

  const result = await db
    .update(paymentProviderSettings)
    .set({
      isDefault: true,
      isEnabled: true,
      updatedAt: new Date(),
    })
    .where(
      eq(
        paymentProviderSettings.provider,
        provider,
      ),
    )
    .returning();

  return result[0] ?? null;
}

/**
 * Delete a payment provider configuration.
 *
 * This does NOT delete historical payment
 * transactions. Those remain in
 * payment_transactions.
 */
export async function deletePaymentProvider(
  provider: PaymentProvider,
) {
  const result = await db
    .delete(paymentProviderSettings)
    .where(
      eq(
        paymentProviderSettings.provider,
        provider,
      ),
    )
    .returning({
      id: paymentProviderSettings.id,
      provider:
        paymentProviderSettings.provider,
    });

  return result[0] ?? null;
}