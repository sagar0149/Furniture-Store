
export const COUNTRY_CURRENCIES: Record<string, string> = {
  Nepal: "NPR",
  India: "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  Germany: "EUR",
  France: "EUR",
  Canada: "CAD",
  Australia: "AUD",
  "New Zealand": "NZD",
  Singapore: "SGD",
  "United Arab Emirates": "AED",
  "Saudi Arabia": "SAR",
  Japan: "JPY",
  China: "CNY",
  "South Korea": "KRW",
};

export function getCurrencyForCountry(
  country: string,
): string | null {
  const normalizedCountry = country.trim().toLowerCase();

  const match = Object.entries(COUNTRY_CURRENCIES).find(
    ([name]) => name.toLowerCase() === normalizedCountry,
  );

  return match?.[1] ?? null;
}
