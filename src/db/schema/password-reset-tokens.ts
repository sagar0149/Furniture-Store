import {
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    tokenHash: varchar("token_hash", {
      length: 128,
    }).notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => [
    index("password_reset_tokens_user_id_idx").on(
      table.userId,
    ),

    index(
      "password_reset_tokens_expires_at_idx",
    ).on(table.expiresAt),

    index(
      "password_reset_tokens_token_hash_idx",
    ).on(table.tokenHash),
  ],
);