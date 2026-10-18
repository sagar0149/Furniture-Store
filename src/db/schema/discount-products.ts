import {
  index,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { discounts } from "./discounts";
import { products } from "./products";

export const discountProducts = pgTable(
  "discount_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    discountId: uuid("discount_id")
      .notNull()
      .references(() => discounts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },

  (table) => [
    uniqueIndex(
      "discount_products_discount_product_unique",
    ).on(table.discountId, table.productId),

    index("discount_products_discount_id_idx").on(
      table.discountId,
    ),

    index("discount_products_product_id_idx").on(
      table.productId,
    ),
  ],
);