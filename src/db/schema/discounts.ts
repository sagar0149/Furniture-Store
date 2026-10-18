import {
  boolean,
  check,
  decimal,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const discountTypeEnum = pgEnum("discount_type", [
  "PERCENTAGE",
  "FIXED_AMOUNT",
]);

export const discounts = pgTable(
  "discounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
      length: 150,
    }).notNull(),

    description: text("description"),

    type: discountTypeEnum("type").notNull(),

    value: decimal("value", {
      precision: 12,
      scale: 2,
    }).notNull(),

    startAt: timestamp("start_at", {
      withTimezone: true,
    }).notNull(),

    endAt: timestamp("end_at", {
      withTimezone: true,
    }).notNull(),

    enabled: boolean("enabled")
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
    index("discounts_start_at_idx").on(table.startAt),

    index("discounts_end_at_idx").on(table.endAt),

    index("discounts_enabled_idx").on(table.enabled),

    index("discounts_active_period_idx").on(
      table.enabled,
      table.startAt,
      table.endAt,
    ),

    check(
      "discounts_value_non_negative",
      sql`${table.value} >= 0`,
    ),

    check(
      "discounts_end_after_start",
      sql`${table.endAt} > ${table.startAt}`,
    ),

    check(
      "discounts_percentage_max",
      sql`${table.type} <> 'PERCENTAGE' OR ${table.value} <= 100`,
    ),
  ],
);