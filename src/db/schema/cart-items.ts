import {
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { carts } from "./carts";
import { products } from "./products";

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    quantity: integer("quantity")
      .notNull()
      .default(1),

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
    uniqueIndex(
      "cart_items_cart_product_unique",
    ).on(table.cartId, table.productId),

    index("cart_items_cart_id_idx").on(table.cartId),

    index("cart_items_product_id_idx").on(
      table.productId,
    ),

    check(
      "cart_items_quantity_positive",
      sql`${table.quantity} > 0`,
    ),
  ],
);