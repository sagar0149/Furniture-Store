import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { products } from "./products";
import { orders } from "./orders";

export const inventoryTransactionTypeEnum =
  pgEnum("inventory_transaction_type", [
    "RESTOCK",
    "SALE",
    "CANCELLATION",
    "RETURN",
    "ADJUSTMENT",
  ]);

export const inventoryTransactions =
  pgTable(
    "inventory_transactions",
    {
      id: uuid("id").defaultRandom().primaryKey(),

      productId: uuid("product_id")
        .notNull()
        .references(() => products.id, {
          onDelete: "restrict",
          onUpdate: "cascade",
        }),

      orderId: uuid("order_id").references(
        () => orders.id,
        {
          onDelete: "set null",
          onUpdate: "cascade",
        },
      ),

      type: inventoryTransactionTypeEnum(
        "type",
      ).notNull(),

      quantityChange: integer(
        "quantity_change",
      ).notNull(),

      previousQuantity: integer(
        "previous_quantity",
      ).notNull(),

      newQuantity: integer(
        "new_quantity",
      ).notNull(),

      reason: text("reason"),

      createdAt: timestamp("created_at", {
        withTimezone: true,
      })
        .defaultNow()
        .notNull(),
    },

    (table) => [
      index(
        "inventory_transactions_product_id_idx",
      ).on(table.productId),

      index(
        "inventory_transactions_order_id_idx",
      ).on(table.orderId),

      index(
        "inventory_transactions_created_at_idx",
      ).on(table.createdAt),

      check(
        "inventory_previous_quantity_non_negative",
        sql`${table.previousQuantity} >= 0`,
      ),

      check(
        "inventory_new_quantity_non_negative",
        sql`${table.newQuantity} >= 0`,
      ),

      check(
        "inventory_quantity_change_non_zero",
        sql`${table.quantityChange} <> 0`,
      ),
    ],
  );