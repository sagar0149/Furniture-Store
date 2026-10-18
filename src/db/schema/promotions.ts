import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const promotions = pgTable(
  "promotions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: varchar("title", {
      length: 200,
    }).notNull(),

    subtitle: varchar("subtitle", {
      length: 255,
    }),

    imageUrl: varchar("image_url", {
      length: 2048,
    }),

    imagePublicId: varchar("image_public_id", {
      length: 500,
    }),

    ctaText: varchar("cta_text", {
      length: 100,
    }),

    targetUrl: varchar("target_url", {
      length: 2048,
    }),

    startAt: timestamp("start_at", {
      withTimezone: true,
    }),

    endAt: timestamp("end_at", {
      withTimezone: true,
    }),

    enabled: boolean("enabled")
      .notNull()
      .default(true),

    displayOrder: integer("display_order")
      .notNull()
      .default(0),

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
    index("promotions_enabled_order_idx").on(
      table.enabled,
      table.displayOrder,
    ),

    index("promotions_schedule_idx").on(
      table.startAt,
      table.endAt,
    ),

    check(
      "promotions_end_after_start",
      sql`
        ${table.startAt} IS NULL
        OR ${table.endAt} IS NULL
        OR ${table.endAt} > ${table.startAt}
      `,
    ),
  ],
);