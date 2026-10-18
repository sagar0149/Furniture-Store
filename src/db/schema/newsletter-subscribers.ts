import {
  boolean,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    email: varchar("email", {
      length: 255,
    }).notNull(),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    subscribedAt: timestamp("subscribed_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    unsubscribedAt: timestamp(
      "unsubscribed_at",
      {
        withTimezone: true,
      },
    ),
  },

  (table) => [
    uniqueIndex(
      "newsletter_subscribers_email_unique",
    ).on(table.email),

    index(
      "newsletter_subscribers_active_idx",
    ).on(table.isActive),
  ],
);