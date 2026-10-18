import {
  check,
  decimal,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { orders } from "./orders";
import { products } from "./products";

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    productNameSnapshot: varchar(
      "product_name_snapshot",
      {
        length: 200,
      },
    ).notNull(),

    skuSnapshot: varchar("sku_snapshot", {
      length: 100,
    }).notNull(),

    quantity: integer("quantity").notNull(),

    unitPrice: decimal("unit_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    discountAmount: decimal("discount_amount", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),

    finalPrice: decimal("final_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => [
    uniqueIndex(
      "order_items_order_product_unique",
    ).on(table.orderId, table.productId),

    index("order_items_order_id_idx").on(
      table.orderId,
    ),

    index("order_items_product_id_idx").on(
      table.productId,
    ),

    check(
      "order_items_quantity_positive",
      sql`${table.quantity} > 0`,
    ),

    check(
      "order_items_unit_price_non_negative",
      sql`${table.unitPrice} >= 0`,
    ),

    check(
      "order_items_discount_non_negative",
      sql`${table.discountAmount} >= 0`,
    ),

    check(
      "order_items_final_price_non_negative",
      sql`${table.finalPrice} >= 0`,
    ),
  ],
);