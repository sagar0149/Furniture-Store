import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    fullName: varchar("full_name", { length: 120 }).notNull(),

    phone: varchar("phone", { length: 30 }).notNull(),

    addressLine1: varchar("address_line_1", {
      length: 255,
    }).notNull(),

    addressLine2: varchar("address_line_2", {
      length: 255,
    }),

    city: varchar("city", { length: 100 }).notNull(),

    state: varchar("state", { length: 100 }).notNull(),

    postalCode: varchar("postal_code", { length: 20 }).notNull(),

    country: varchar("country", { length: 100 }).notNull(),

    landmark: text("landmark"),

    isDefault: boolean("is_default").notNull().default(false),

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
    index("addresses_user_id_idx").on(table.userId),
    index("addresses_user_default_idx").on(
      table.userId,
      table.isDefault,
    ),
  ],
);