import {
  boolean,
  check,
  integer,
  pgTable,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const businessHours = pgTable(
  "business_hours",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    dayOfWeek: integer("day_of_week").notNull(),

    isOpen: boolean("is_open")
      .notNull()
      .default(true),

    openingTime: time("opening_time"),

    closingTime: time("closing_time"),

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
    uniqueIndex("business_hours_day_unique").on(
      table.dayOfWeek,
    ),

    check(
      "business_hours_day_valid",
      sql`${table.dayOfWeek} >= 0 AND ${table.dayOfWeek} <= 6`,
    ),

    check(
      "business_hours_times_valid",
      sql`
        ${table.isOpen} = false
        OR (
          ${table.openingTime} IS NOT NULL
          AND ${table.closingTime} IS NOT NULL
        )
      `,
    ),
  ],
);