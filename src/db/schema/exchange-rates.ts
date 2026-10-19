
import {
  decimal,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const exchangeRates = pgTable(
  "exchange_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Currency that NPR will be converted into.
    currency: varchar("currency", {
      length: 3,
    }).notNull().unique(),

    // Value of 1 NPR in the target currency.
    // Example only: INR rate 0.625 means
    // NPR 1 = INR 0.625.
    rate: decimal("rate", {
      precision: 18,
      scale: 8,
    }).notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("exchange_rates_updated_at_idx").on(
      table.updatedAt,
    ),
  ],
);
