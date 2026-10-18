import {
  boolean,
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const shippingSettings = pgTable(
  "shipping_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    shippingEnabled: boolean("shipping_enabled")
      .notNull()
      .default(true),

    freeShippingThreshold: decimal(
      "free_shipping_threshold",
      {
        precision: 12,
        scale: 2,
      },
    )
      .notNull()
      .default("0"),

    defaultShippingFee: decimal(
      "default_shipping_fee",
      {
        precision: 12,
        scale: 2,
      },
    )
      .notNull()
      .default("0"),

    shippingInformation: text(
      "shipping_information",
    ),

    estimatedDeliveryMessage: varchar(
      "estimated_delivery_message",
      {
        length: 255,
      },
    ),

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
);