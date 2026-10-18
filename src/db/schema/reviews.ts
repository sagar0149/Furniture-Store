import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { products } from "./products";
import { users } from "./users";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    rating: integer("rating").notNull(),

    title: text("title"),

    comment: text("comment"),

    isApproved: boolean("is_approved")
      .notNull()
      .default(false),

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
    uniqueIndex("reviews_product_user_unique").on(
      table.productId,
      table.userId,
    ),

    index("reviews_product_id_idx").on(
      table.productId,
    ),

    index("reviews_user_id_idx").on(
      table.userId,
    ),

    index("reviews_approved_idx").on(
      table.isApproved,
    ),

    check(
      "reviews_rating_valid",
      sql`${table.rating} >= 1 AND ${table.rating} <= 5`,
    ),
  ],
);