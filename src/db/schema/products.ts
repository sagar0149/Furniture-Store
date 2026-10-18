import {
  boolean,
  check,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { categories } from "./categories";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 200 }).notNull(),

    slug: varchar("slug", { length: 220 }).notNull(),

    description: text("description").notNull(),

    sku: varchar("sku", { length: 100 }).notNull(),

    brand: varchar("brand", { length: 120 }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    regularPrice: decimal("regular_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    salePrice: decimal("sale_price", {
      precision: 12,
      scale: 2,
    }),

    stockQuantity: integer("stock_quantity")
      .notNull()
      .default(0),

    lowStockThreshold: integer("low_stock_threshold")
      .notNull()
      .default(5),

    material: varchar("material", {
      length: 150,
    }),

    color: varchar("color", {
      length: 100,
    }),

    dimensions: varchar("dimensions", {
      length: 200,
    }),

    weight: decimal("weight", {
      precision: 10,
      scale: 2,
    }),

    assemblyInformation: text("assembly_information"),

    shippingInformation: text("shipping_information"),

    returnInformation: text("return_information"),

    isFeatured: boolean("is_featured")
      .notNull()
      .default(false),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

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
    uniqueIndex("products_slug_unique").on(table.slug),

    uniqueIndex("products_sku_unique").on(table.sku),

    index("products_category_id_idx").on(table.categoryId),

    index("products_active_idx").on(table.isActive),

    index("products_featured_idx").on(
      table.isFeatured,
      table.isActive,
    ),

    index("products_created_at_idx").on(table.createdAt),

    index("products_stock_idx").on(table.stockQuantity),

    check(
      "products_regular_price_non_negative",
      sql`${table.regularPrice} >= 0`,
    ),

    check(
      "products_sale_price_non_negative",
      sql`${table.salePrice} IS NULL OR ${table.salePrice} >= 0`,
    ),

    check(
      "products_sale_price_not_greater_than_regular",
      sql`${table.salePrice} IS NULL OR ${table.salePrice} <= ${table.regularPrice}`,
    ),

    check(
      "products_stock_non_negative",
      sql`${table.stockQuantity} >= 0`,
    ),

    check(
      "products_low_stock_threshold_non_negative",
      sql`${table.lowStockThreshold} >= 0`,
    ),

    check(
      "products_weight_non_negative",
      sql`${table.weight} IS NULL OR ${table.weight} >= 0`,
    ),
  ],
);