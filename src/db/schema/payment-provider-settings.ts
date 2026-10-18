import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Payment providers supported by the platform.
 *
 * This enum intentionally matches the providers
 * supported by payment-transactions.ts.
 */
export const paymentProviderSettingEnum =
  pgEnum("payment_provider_setting", [
    "STRIPE",
    "PAYPAL",
    "ESEWA",
    "KHALTI",
    "COD",
  ]);

/**
 * Configuration for payment providers.
 *
 * Each provider can be enabled or disabled
 * independently by the store owner.
 *
 * Provider credentials must be stored securely
 * and must NEVER be exposed to client components.
 */
export const paymentProviderSettings =
  pgTable(
    "payment_provider_settings",
    {
      id: uuid("id")
        .defaultRandom()
        .primaryKey(),

      /**
       * Payment provider.
       *
       * Only one configuration row is allowed
       * for each provider.
       */
      provider: paymentProviderSettingEnum(
        "provider",
      ).notNull(),

      /**
       * Whether customers can currently use
       * this payment provider.
       */
      isEnabled: boolean("is_enabled")
        .notNull()
        .default(false),

      /**
       * Whether this provider should appear
       * as the default payment option when
       * multiple providers are enabled.
       */
      isDefault: boolean("is_default")
        .notNull()
        .default(false),

      /**
       * Public/client-side configuration.
       *
       * Examples:
       *
       * Stripe publishable key
       * PayPal client ID
       *
       * NEVER put secret keys here.
       */
      publicConfig: jsonb("public_config"),

      /**
       * Private/server-side configuration.
       *
       * Examples:
       *
       * Stripe secret key
       * PayPal secret
       * eSewa secret
       * Khalti secret
       *
       * IMPORTANT:
       *
       * This column must only be accessed
       * from trusted server-side code.
       */
      secretConfig: jsonb("secret_config"),

      /**
       * Optional human-readable description
       * shown in the admin dashboard.
       */
      description: varchar("description", {
        length: 500,
      }),

      createdAt: timestamp("created_at", {
        withTimezone: true,
      })
        .defaultNow()
        .notNull(),

      updatedAt: timestamp("updated_at", {
        withTimezone: true,
      })
        .defaultNow()
        .notNull(),
    },

    (table) => [
      /**
       * Only one configuration per provider.
       */
      uniqueIndex(
        "payment_provider_settings_provider_unique",
      ).on(table.provider),

      /**
       * Quickly find enabled providers.
       */
      index(
        "payment_provider_settings_enabled_idx",
      ).on(table.isEnabled),
    ],
  );