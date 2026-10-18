import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export type FooterLink = {
  label: string;
  url: string;
  openInNewTab?: boolean;
};

export const footerSections = pgTable(
  "footer_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: varchar("title", {
      length: 100,
    }).notNull(),

    links: jsonb("links")
      .$type<FooterLink[]>()
      .notNull()
      .default([]),

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
    index("footer_sections_enabled_order_idx").on(
      table.enabled,
      table.displayOrder,
    ),
  ],
);