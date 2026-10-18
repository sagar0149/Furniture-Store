import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 120 }).notNull(),

    slug: varchar("slug", { length: 160 }).notNull(),

    description: varchar("description", { length: 500 }),

    imageUrl: varchar("image_url", { length: 2048 }),

    imagePublicId: varchar("image_public_id", {
      length: 500,
    }),

    parentId: uuid("parent_id"),

    displayOrder: integer("display_order").notNull().default(0),

    isActive: boolean("is_active").notNull().default(true),

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
    uniqueIndex("categories_slug_unique").on(table.slug),
    index("categories_parent_id_idx").on(table.parentId),
    index("categories_active_order_idx").on(
      table.isActive,
      table.displayOrder,
    ),
  ],
);