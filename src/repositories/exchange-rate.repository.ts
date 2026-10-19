
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exchangeRates } from "@/db/schema";

/**
 * Rates are stored as target-currency units per NPR 1.
 *
 * Example:
 * INR rate 0.625 means NPR 1 = INR 0.625.
 */
export async function getAllExchangeRates() {
  return db
    .select()
    .from(exchangeRates)
    .orderBy(asc(exchangeRates.currency));
}

export async function getExchangeRate(
  currency: string,
) {
  const normalizedCurrency = currency.trim().toUpperCase();

  if (normalizedCurrency === "NPR") {
    return {
      currency: "NPR",
      rate: "1.00000000",
      updatedAt: new Date(0),
    };
  }

  const result = await db
    .select()
    .from(exchangeRates)
    .where(eq(exchangeRates.currency, normalizedCurrency))
    .limit(1);

  return result[0] ?? null;
}

export async function upsertExchangeRate(
  currency: string,
  rate: string,
) {
  const normalizedCurrency = currency.trim().toUpperCase();
  const numericRate = Number(rate);

  if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
    throw new Error("Currency must be a three-letter currency code.");
  }

  if (normalizedCurrency === "NPR") {
    throw new Error("NPR is the base currency and its rate is always 1.");
  }

  if (!Number.isFinite(numericRate) || numericRate <= 0) {
    throw new Error("Exchange rate must be a positive number.");
  }

  const result = await db
    .insert(exchangeRates)
    .values({
      currency: normalizedCurrency,
      rate: numericRate.toFixed(8),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: exchangeRates.currency,
      set: {
        rate: numericRate.toFixed(8),
        updatedAt: new Date(),
      },
    })
    .returning();

  return result[0] ?? null;
}
