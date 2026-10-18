import { asc, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  storeSettings,
} from "@/db/schema";

/**
 * Get the single store settings record.
 *
 * This application currently supports one store
 * configuration, so the oldest record is used.
 */
export async function getStoreSettings() {
  const result = await db
    .select()
    .from(storeSettings)
    .orderBy(
      asc(storeSettings.createdAt),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get the configured store currency.
 *
 * Falls back to USD when no settings exist.
 */
export async function getStoreCurrency() {
  const settings =
    await getStoreSettings();

  return settings?.currency ?? "USD";
}

/**
 * Update store settings.
 *
 * Only fields supplied in the data object are
 * updated.
 */
export async function updateStoreSettings(
  data: Partial<{
    storeName: string;
    tagline: string | null;
    description: string | null;
    logoUrl: string | null;
    logoPublicId: string | null;
    faviconUrl: string | null;
    faviconPublicId: string | null;

    country: string | null;
    currency: string;
    language: string;
    timezone: string;

    primaryEmail: string | null;
    secondaryEmail: string | null;
    phone: string | null;
    whatsapp: string | null;
    customerSupportPhone: string | null;

    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;

    latitude: string | null;
    longitude: string | null;
    googleMapsUrl: string | null;

    footerDescription: string | null;
    copyrightText: string | null;

    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;

    ogTitle: string | null;
    ogDescription: string | null;
    ogImageUrl: string | null;
    ogImagePublicId: string | null;
  }>,
) {
  const existing =
    await getStoreSettings();

  if (!existing) {
    throw new Error(
      "Store settings have not been initialized.",
    );
  }

  const updateData: Record<
    string,
    unknown
  > = {
    ...data,
    updatedAt: new Date(),
  };

  if (
    typeof data.storeName ===
      "string" &&
    !data.storeName.trim()
  ) {
    throw new Error(
      "Store name is required.",
    );
  }

  if (
    typeof data.currency ===
      "string"
  ) {
    const normalizedCurrency =
      data.currency
        .trim()
        .toUpperCase();

    if (
      !/^[A-Z]{3}$/.test(
        normalizedCurrency,
      )
    ) {
      throw new Error(
        "Currency must be a valid three-letter currency code.",
      );
    }

    updateData.currency =
      normalizedCurrency;
  }

  if (
    typeof data.language ===
      "string"
  ) {
    const normalizedLanguage =
      data.language
        .trim()
        .toLowerCase();

    if (
      !/^[a-z]{2,10}$/.test(
        normalizedLanguage,
      )
    ) {
      throw new Error(
        "Language must be a valid language code.",
      );
    }

    updateData.language =
      normalizedLanguage;
  }

  if (
    typeof data.timezone ===
      "string"
  ) {
    if (!data.timezone.trim()) {
      throw new Error(
        "Timezone is required.",
      );
    }

    updateData.timezone =
      data.timezone.trim();
  }

  if (
    typeof data.storeName ===
      "string"
  ) {
    updateData.storeName =
      data.storeName.trim();
  }

  const stringFields = [
    "tagline",
    "description",
    "logoUrl",
    "logoPublicId",
    "faviconUrl",
    "faviconPublicId",
    "country",
    "primaryEmail",
    "secondaryEmail",
    "phone",
    "whatsapp",
    "customerSupportPhone",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "postalCode",
    "googleMapsUrl",
    "footerDescription",
    "copyrightText",
    "seoTitle",
    "seoDescription",
    "seoKeywords",
    "ogTitle",
    "ogDescription",
    "ogImageUrl",
    "ogImagePublicId",
  ] as const;

  for (const field of stringFields) {
    if (
      field in data &&
      typeof data[field] ===
        "string"
    ) {
      updateData[field] =
        data[field]!.trim() ||
        null;
    }
  }

  const result = await db
    .update(storeSettings)
    .set(
      updateData as Partial<
        typeof storeSettings.$inferInsert
      >,
    )
    .where(
      eq(
        storeSettings.id,
        existing.id,
      ),
    )
    .returning();

  return result[0] ?? null;
}