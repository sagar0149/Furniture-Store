
const CURRENCY_LOCALES: Record<string, string> = {
  USD: "en-US",
  NPR: "en-IN",
  INR: "en-IN",
  GBP: "en-GB",
  EUR: "de-DE",
  CAD: "en-CA",
  AUD: "en-AU",
  NZD: "en-NZ",
  SGD: "en-SG",
  AED: "en-AE",
  SAR: "en-SA",
  JPY: "ja-JP",
  CNY: "zh-CN",
  KRW: "ko-KR",
};

function getLocaleForCurrency(currency: string): string {
  return CURRENCY_LOCALES[currency.toUpperCase()] || "en-US";
}

export function isValidCurrency(currency: string): boolean {
  return /^[A-Z]{3}$/i.test(currency);
}

export function formatCurrency(
  amount: number | string,
  currency: string = "USD",
  locale?: string,
): string {
  const normalizedCurrency = currency.toUpperCase();

  // Convert string amounts into numbers safely.
  const numericAmount =
    typeof amount === "number" ? amount : Number(amount);

  const safeAmount = Number.isFinite(numericAmount)
    ? numericAmount
    : 0;

  // Display Indian Rupees and Nepalese Rupees as Rs.
  if (
    normalizedCurrency === "INR" ||
    normalizedCurrency === "NPR"
  ) {
    return `Rs. ${new Intl.NumberFormat(locale || "en-IN", {
      maximumFractionDigits: 2,
    }).format(safeAmount)}`;
  }

  // Display all other supported currencies using their symbols.
  try {
    return new Intl.NumberFormat(
      locale || getLocaleForCurrency(normalizedCurrency),
      {
        style: "currency",
        currency: normalizedCurrency,
        currencyDisplay: "symbol",
        maximumFractionDigits: 2,
      },
    ).format(safeAmount);
  } catch {
    return `${normalizedCurrency} ${safeAmount.toLocaleString("en-US")}`;
  }
}
