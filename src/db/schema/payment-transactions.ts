import {
  decimal,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { orders } from "./orders";

/**
 * Payment providers supported by the platform.
 *
 * The store owner will later decide which
 * providers are enabled for their store.
 *
 * Examples:
 *
 * USA:
 *   STRIPE
 *   PAYPAL
 *   COD
 *
 * Nepal:
 *   ESEWA
 *   KHALTI
 *   COD
 */
export const paymentProviderEnum =
  pgEnum("payment_provider", [
    "STRIPE",
    "PAYPAL",
    "ESEWA",
    "KHALTI",
    "COD",
  ]);

/**
 * Payment lifecycle.
 */
export const paymentStatusEnum =
  pgEnum("payment_status", [
    "PENDING",
    "AUTHORIZED",
    "CAPTURED",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
    "CANCELLED",
  ]);

export const paymentTransactions =
  pgTable(
    "payment_transactions",
    {
      id: uuid("id")
        .defaultRandom()
        .primaryKey(),

      /**
       * Order associated with this payment.
       */
      orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, {
          onDelete: "restrict",
          onUpdate: "cascade",
        }),

      /**
       * Payment provider used for this
       * particular transaction.
       */
      provider: paymentProviderEnum(
        "provider",
      ).notNull(),

      /**
       * Transaction/payment ID returned
       * by the external provider.
       *
       * Examples:
       *
       * Stripe payment intent ID
       * PayPal capture ID
       * eSewa transaction ID
       * Khalti transaction ID
       */
      providerTransactionId: varchar(
        "provider_transaction_id",
        {
          length: 255,
        },
      ),

      /**
       * Provider-side order/payment-session ID.
       *
       * Examples:
       *
       * Stripe Checkout Session ID
       * PayPal Order ID
       * eSewa reference/order ID
       * Khalti purchase/order ID
       */
      providerOrderId: varchar(
        "provider_order_id",
        {
          length: 255,
        },
      ),

      /**
       * Current payment status.
       */
      status: paymentStatusEnum(
        "status",
      )
        .notNull()
        .default("PENDING"),

      /**
       * Amount charged or intended to be
       * charged.
       *
       * Stored as decimal to avoid floating
       * point money calculations.
       */
      amount: decimal("amount", {
        precision: 12,
        scale: 2,
      }).notNull(),

      /**
       * ISO 4217 currency code.
       *
       * Examples:
       *
       * USD
       * NPR
       * EUR
       * GBP
       * INR
       */
      currency: varchar("currency", {
        length: 3,
      })
        .notNull()
        .default("USD"),

      /**
       * Human-readable reason when payment
       * fails.
       */
      failureReason: text(
        "failure_reason",
      ),

      /**
       * Provider-specific metadata.
       *
       * JSON can be stored here as text for
       * provider-specific information without
       * changing the schema every time.
       */
      metadata: text("metadata"),

      /**
       * Time at which payment was successfully
       * captured/paid.
       */
      paidAt: timestamp("paid_at", {
        withTimezone: true,
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
      index(
        "payment_transactions_order_id_idx",
      ).on(table.orderId),

      index(
        "payment_transactions_status_idx",
      ).on(table.status),

      index(
        "payment_transactions_provider_idx",
      ).on(table.provider),

      /**
       * Prevent duplicate provider transaction IDs.
       */
      uniqueIndex(
        "payment_transactions_provider_transaction_unique",
      ).on(
        table.provider,
        table.providerTransactionId,
      ),
    ],
  );