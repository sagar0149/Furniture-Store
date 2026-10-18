import {
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const storeSettings = pgTable(
  "store_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // =====================================================
    // STORE IDENTITY
    // =====================================================

    storeName: varchar("store_name", {
      length: 150,
    }).notNull(),

    tagline: varchar("tagline", {
      length: 255,
    }),

    description: text("description"),

    logoUrl: varchar("logo_url", {
      length: 2048,
    }),

    logoPublicId: varchar("logo_public_id", {
      length: 500,
    }),

    faviconUrl: varchar("favicon_url", {
      length: 2048,
    }),

    faviconPublicId: varchar("favicon_public_id", {
      length: 500,
    }),

    // =====================================================
    // LOCALIZATION
    // =====================================================

    /**
     * Country where the store/business operates.
     *
     * Examples:
     * United States
     * Nepal
     * India
     * Germany
     * United Kingdom
     */
    country: varchar("country", {
      length: 100,
    }),

    /**
     * ISO 4217 currency code.
     *
     * Examples:
     * USD
     * NPR
     * INR
     * EUR
     * GBP
     */
    currency: varchar("currency", {
      length: 3,
    })
      .notNull()
      .default("USD"),

    /**
     * ISO 639-1 language code.
     *
     * Examples:
     * en
     * ne
     * hi
     * de
     */
    language: varchar("language", {
      length: 10,
    })
      .notNull()
      .default("en"),

    /**
     * IANA timezone.
     *
     * Examples:
     * America/New_York
     * Asia/Kathmandu
     * Asia/Kolkata
     * Europe/Berlin
     */
    timezone: varchar("timezone", {
      length: 100,
    })
      .notNull()
      .default("UTC"),

    // =====================================================
    // CONTACT INFORMATION
    // =====================================================

    primaryEmail: varchar("primary_email", {
      length: 255,
    }),

    secondaryEmail: varchar("secondary_email", {
      length: 255,
    }),

    phone: varchar("phone", {
      length: 30,
    }),

    whatsapp: varchar("whatsapp", {
      length: 30,
    }),

    customerSupportPhone: varchar(
      "customer_support_phone",
      {
        length: 30,
      },
    ),

    // =====================================================
    // BUSINESS ADDRESS
    // =====================================================

    addressLine1: varchar("address_line_1", {
      length: 255,
    }),

    addressLine2: varchar("address_line_2", {
      length: 255,
    }),

    city: varchar("city", {
      length: 100,
    }),

    state: varchar("state", {
      length: 100,
    }),

    postalCode: varchar("postal_code", {
      length: 20,
    }),

    /*
     * NOTE:
     *
     * This is the store/business country.
     * Customer shipping addresses remain
     * in the addresses table.
     */
    // country is defined in LOCALIZATION above.

    latitude: decimal("latitude", {
      precision: 10,
      scale: 7,
    }),

    longitude: decimal("longitude", {
      precision: 10,
      scale: 7,
    }),

    googleMapsUrl: varchar("google_maps_url", {
      length: 2048,
    }),

    // =====================================================
    // FOOTER
    // =====================================================

    footerDescription: text(
      "footer_description",
    ),

    copyrightText: varchar("copyright_text", {
      length: 255,
    }),

    // =====================================================
    // SEO
    // =====================================================

    seoTitle: varchar("seo_title", {
      length: 255,
    }),

    seoDescription: text("seo_description"),

    seoKeywords: text("seo_keywords"),

    ogTitle: varchar("og_title", {
      length: 255,
    }),

    ogDescription: text("og_description"),

    ogImageUrl: varchar("og_image_url", {
      length: 2048,
    }),

    ogImagePublicId: varchar(
      "og_image_public_id",
      {
        length: 500,
      },
    ),

    // =====================================================
    // TIMESTAMPS
    // =====================================================

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