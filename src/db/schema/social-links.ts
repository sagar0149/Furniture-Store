import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const socialPlatformEnum = pgEnum("social_platform", [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "LINKEDIN",
  "PINTEREST",
  "X",
  "WHATSAPP",
]);

export const socialLinks = pgTable(
  "social_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    platform: socialPlatformEnum("platform").notNull(),

    url: varchar("url", {
      length: 2048,
    }).notNull(),

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
    uniqueIndex("social_links_platform_unique").on(
      table.platform,
    ),

    index("social_links_enabled_order_idx").on(
      table.enabled,
      table.displayOrder,
    ),
  ],
);