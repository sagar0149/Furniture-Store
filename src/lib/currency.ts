/**
 * Currency utilities for the entire store.
 *
 * The store currency is configured by the admin
 * in store settings.
 *
 * Examples:
 * USD, NPR, INR, EUR, GBP, CAD, AUD
 */

export function formatCurrency(
  amount: number | string,
  currency: string,
  locale?: string,
): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return new Intl.NumberFormat(
      locale ?? "en-US",
      {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(0);
  }

  const normalizedCurrency =
    currency?.trim().toUpperCase() || "USD";

  return new Intl.NumberFormat(
    locale ?? getLocaleForCurrency(normalizedCurrency),
    {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(numericAmount);
}

/**
 * Get a reasonable default locale for common
 * store currencies.
 *
 * The currency itself remains the source of truth.
 */
function getLocaleForCurrency(
  currency: string,
): string {
  switch (currency) {
    case "USD":
      return "en-US";

    case "NPR":
      return "ne-NP";

    case "INR":
      return "en-IN";

    case "GBP":
      return "en-GB";

    case "EUR":
      return "de-DE";

    case "CAD":
      return "en-CA";

    case "AUD":
      return "en-AU";

    case "NZD":
      return "en-NZ";

    case "SGD":
      return "en-SG";

    case "AED":
      return "en-AE";

    case "SAR":
      return "en-SA";

    case "JPY":
      return "ja-JP";

    case "CNY":
      return "zh-CN";

    case "KRW":
      return "ko-KR";

    default:
      return "en-US";
  }
}

/**
 * Validate a currency code.
 */
export function isValidCurrency(
  currency: string,
): boolean {
  return /^[A-Z]{3}$/.test(
    currency.trim().toUpperCase(),
  );
}