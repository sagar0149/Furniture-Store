import {
  check,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "./users";

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    orderNumber: varchar("order_number", {
      length: 50,
    }).notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    status: orderStatusEnum("status")
      .notNull()
      .default("PENDING"),

    customerName: varchar("customer_name", {
      length: 120,
    }).notNull(),

    customerEmail: varchar("customer_email", {
      length: 255,
    }).notNull(),

    customerPhone: varchar("customer_phone", {
      length: 30,
    }).notNull(),

    shippingFullName: varchar("shipping_full_name", {
      length: 120,
    }).notNull(),

    shippingPhone: varchar("shipping_phone", {
      length: 30,
    }).notNull(),

    shippingAddressLine1: varchar(
      "shipping_address_line_1",
      {
        length: 255,
      },
    ).notNull(),

    shippingAddressLine2: varchar(
      "shipping_address_line_2",
      {
        length: 255,
      },
    ),

    shippingCity: varchar("shipping_city", {
      length: 100,
    }).notNull(),

    shippingState: varchar("shipping_state", {
      length: 100,
    }).notNull(),

    shippingPostalCode: varchar(
      "shipping_postal_code",
      {
        length: 20,
      },
    ).notNull(),

    shippingCountry: varchar("shipping_country", {
      length: 100,
    }).notNull(),

    shippingLandmark: text("shipping_landmark"),

    subtotal: decimal("subtotal", {
      precision: 12,
      scale: 2,
    }).notNull(),

    discountAmount: decimal("discount_amount", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),

    shippingAmount: decimal("shipping_amount", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),

    taxAmount: decimal("tax_amount", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),

    totalAmount: decimal("total_amount", {
  precision: 12,
  scale: 2,
}).notNull(),

currency: varchar("currency", {
  length: 3,
})
  .notNull()
  .default("USD"),

notes: text("notes"),

    placedAt: timestamp("placed_at", {
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
    uniqueIndex("orders_order_number_unique").on(
      table.orderNumber,
    ),

    index("orders_user_id_idx").on(table.userId),

    index("orders_status_idx").on(table.status),

    index("orders_created_at_idx").on(
      table.createdAt,
    ),

    index("orders_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),

    check(
      "orders_subtotal_non_negative",
      sql`${table.subtotal} >= 0`,
    ),

    check(
      "orders_discount_non_negative",
      sql`${table.discountAmount} >= 0`,
    ),

    check(
      "orders_shipping_non_negative",
      sql`${table.shippingAmount} >= 0`,
    ),

    check(
      "orders_tax_non_negative",
      sql`${table.taxAmount} >= 0`,
    ),

    check(
      "orders_total_non_negative",
      sql`${table.totalAmount} >= 0`,
    ),
  ],
);