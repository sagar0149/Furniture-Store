import {
  index,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { categories } from "./categories";
import { discounts } from "./discounts";

export const discountCategories = pgTable(
  "discount_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    discountId: uuid("discount_id")
      .notNull()
      .references(() => discounts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },

  (table) => [
    uniqueIndex(
      "discount_categories_discount_category_unique",
    ).on(table.discountId, table.categoryId),

    index("discount_categories_discount_id_idx").on(
      table.discountId,
    ),

    index("discount_categories_category_id_idx").on(
      table.categoryId,
    ),
  ],
);