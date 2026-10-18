import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { products } from "./products";

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    url: varchar("url", { length: 2048 }).notNull(),

    publicId: varchar("public_id", {
      length: 500,
    }).notNull(),

    altText: varchar("alt_text", {
      length: 255,
    }),

    isPrimary: boolean("is_primary")
      .notNull()
      .default(false),

    displayOrder: integer("display_order")
      .notNull()
      .default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("product_images_product_id_idx").on(
      table.productId,
    ),

    index("product_images_order_idx").on(
      table.productId,
      table.displayOrder,
    ),

    index("product_images_primary_idx").on(
      table.productId,
      table.isPrimary,
    ),
  ],
);