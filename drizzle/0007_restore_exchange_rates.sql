CREATE TABLE IF NOT EXISTS "exchange_rates" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "currency" varchar(3) NOT NULL,
    "rate" numeric(18, 8) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "exchange_rates_currency_unique" UNIQUE ("currency"),
    CONSTRAINT "exchange_rates_rate_positive" CHECK ("rate" > 0),
    CONSTRAINT "exchange_rates_currency_uppercase" CHECK ("currency" = upper("currency"))
);

CREATE INDEX IF NOT EXISTS "exchange_rates_updated_at_idx"
    ON "exchange_rates" USING btree ("updated_at");