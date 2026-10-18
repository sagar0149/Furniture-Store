import {
  index,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "./products";
import { promotions } from "./promotions";

export const promotionProducts = pgTable(
  "promotion_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    promotionId: uuid("promotion_id")
      .notNull()
      .references(() => promotions.id, {
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
      "promotion_products_promotion_product_unique",
    ).on(table.promotionId, table.productId),

    index("promotion_products_promotion_id_idx").on(
      table.promotionId,
    ),

    index("promotion_products_product_id_idx").on(
      table.productId,
    ),
  ],
);