CREATE TYPE "public"."social_platform" AS ENUM('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'LINKEDIN', 'PINTEREST', 'X', 'WHATSAPP');--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_name" varchar(150) NOT NULL,
	"tagline" varchar(255),
	"description" text,
	"logo_url" varchar(2048),
	"logo_public_id" varchar(500),
	"favicon_url" varchar(2048),
	"favicon_public_id" varchar(500),
	"primary_email" varchar(255),
	"secondary_email" varchar(255),
	"phone" varchar(30),
	"whatsapp" varchar(30),
	"customer_support_phone" varchar(30),
	"address_line_1" varchar(255),
	"address_line_2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(100),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"google_maps_url" varchar(2048),
	"footer_description" text,
	"copyright_text" varchar(255),
	"seo_title" varchar(255),
	"seo_description" text,
	"seo_keywords" text,
	"og_title" varchar(255),
	"og_description" text,
	"og_image_url" varchar(2048),
	"og_image_public_id" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "social_platform" NOT NULL,
	"url" varchar(2048) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_of_week" integer NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"opening_time" time,
	"closing_time" time,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_hours_day_valid" CHECK ("business_hours"."day_of_week" >= 0 AND "business_hours"."day_of_week" <= 6),
	CONSTRAINT "business_hours_times_valid" CHECK (
        "business_hours"."is_open" = false
        OR (
          "business_hours"."opening_time" IS NOT NULL
          AND "business_hours"."closing_time" IS NOT NULL
        )
      )
);
--> statement-breakpoint
CREATE TABLE "footer_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(100) NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipping_enabled" boolean DEFAULT true NOT NULL,
	"free_shipping_threshold" numeric(12, 2) DEFAULT '0' NOT NULL,
	"default_shipping_fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_information" text,
	"estimated_delivery_message" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "social_links_platform_unique" ON "social_links" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "social_links_enabled_order_idx" ON "social_links" USING btree ("enabled","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "business_hours_day_unique" ON "business_hours" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "footer_sections_enabled_order_idx" ON "footer_sections" USING btree ("enabled","display_order");