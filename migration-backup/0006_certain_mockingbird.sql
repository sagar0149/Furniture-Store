CREATE TYPE "public"."payment_provider_setting" AS ENUM('STRIPE', 'PAYPAL', 'ESEWA', 'KHALTI', 'COD');--> statement-breakpoint
CREATE TABLE "payment_provider_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "payment_provider_setting" NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"public_config" jsonb,
	"secret_config" jsonb,
	"description" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"currency" varchar(3) NOT NULL,
	"rate" numeric(18, 8) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exchange_rates_currency_unique" UNIQUE("currency")
);
--> statement-breakpoint
ALTER TABLE "payment_transactions" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payment_provider";--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('STRIPE', 'PAYPAL', 'ESEWA', 'KHALTI', 'COD');--> statement-breakpoint
ALTER TABLE "payment_transactions" ALTER COLUMN "provider" SET DATA TYPE "public"."payment_provider" USING "provider"::"public"."payment_provider";--> statement-breakpoint
ALTER TABLE "payment_transactions" ALTER COLUMN "currency" SET DATA TYPE varchar(3);--> statement-breakpoint
ALTER TABLE "payment_transactions" ALTER COLUMN "currency" SET DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "currency" varchar(3) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "currency" varchar(3) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "timezone" varchar(100) DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "payment_provider_settings_provider_unique" ON "payment_provider_settings" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "payment_provider_settings_enabled_idx" ON "payment_provider_settings" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "exchange_rates_updated_at_idx" ON "exchange_rates" USING btree ("updated_at");