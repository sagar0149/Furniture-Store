import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    action: varchar("action", {
      length: 100,
    }).notNull(),

    entityType: varchar("entity_type", {
      length: 100,
    }).notNull(),

    entityId: uuid("entity_id"),

    previousData: jsonb("previous_data"),

    newData: jsonb("new_data"),

    ipAddress: varchar("ip_address", {
      length: 100,
    }),

    userAgent: varchar("user_agent", {
      length: 1000,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => [
    index(
      "admin_audit_logs_admin_user_idx",
    ).on(table.adminUserId),

    index(
      "admin_audit_logs_entity_idx",
    ).on(
      table.entityType,
      table.entityId,
    ),

    index(
      "admin_audit_logs_created_at_idx",
    ).on(table.createdAt),
  ],
);