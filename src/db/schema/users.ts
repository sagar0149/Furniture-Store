
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "CUSTOMER",
  "ADMIN",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 120 }).notNull(),

    email: varchar("email", { length: 255 }).notNull(),

    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    phone: varchar("phone", { length: 30 }),

    // Customer's preferred country for currency display.
    preferredCountry: varchar("preferred_country", {
      length: 100,
    }),

    role: userRoleEnum("role").notNull().default("CUSTOMER"),

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
    uniqueIndex("users_email_unique").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_is_active_idx").on(table.isActive),
  ],
);
