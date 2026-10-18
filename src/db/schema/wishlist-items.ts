import {
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "./products";
import { wishlists } from "./wishlists";

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    wishlistId: uuid("wishlist_id")
      .notNull()
      .references(() => wishlists.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => [
    uniqueIndex(
      "wishlist_items_wishlist_product_unique",
    ).on(table.wishlistId, table.productId),

    index("wishlist_items_wishlist_id_idx").on(
      table.wishlistId,
    ),

    index("wishlist_items_product_id_idx").on(
      table.productId,
    ),
  ],
);