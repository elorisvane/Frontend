/**
 * Multi-currency display for the storefront. Product prices are authored and
 * stored once in USD (e.g. "$48,500"); everything a shopper sees is converted
 * on the fly into their local currency using USD-based exchange rates, and the
 * canonical USD value is what we persist (orders, cart) — see currency.server.ts
 * for the rate fetch and visitor-currency detection.
 */

/** USD-based exchange-rate table: { EUR: 0.92, GBP: 0.79, JPY: 156, ... }. */
export type Rates = Record<string, number>;

export const DEFAULT_CURRENCY = "USD";

/** Cookie holding an explicit currency override chosen in the switcher. */
export const CURRENCY_COOKIE = "eloris-currency";

/** Formatting locale is pinned so server and client render byte-identically
 *  (avoids hydration mismatches from differing runtime locales). */
const FORMAT_LOCALE = "en-US";

/**
 * ISO-3166 alpha-2 country → ISO-4217 currency. Broad but not exhaustive; any
 * country not listed falls back to USD. Used to pick a sensible default from the
 * visitor's geo-IP country header — the shopper can always override it.
 */
export const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", IE: "EUR", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR",
  NL: "EUR", BE: "EUR", PT: "EUR", AT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR",
  SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR",
  CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK", HU: "HUF",
  RO: "RON", BG: "BGN", HR: "EUR", IS: "ISK",
  IN: "INR", AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", OM: "OMR",
  IL: "ILS", TR: "TRY", EG: "EGP", PK: "PKR", BD: "BDT", LK: "LKR", NP: "NPR",
  SG: "SGD", HK: "HKD", JP: "JPY", CN: "CNY", KR: "KRW", TW: "TWD", TH: "THB",
  MY: "MYR", ID: "IDR", PH: "PHP", VN: "VND", MO: "MOP",
  AU: "AUD", NZ: "NZD",
  CA: "CAD", MX: "MXN", BR: "BRL", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN",
  ZA: "ZAR", NG: "NGN", KE: "KES", GH: "GHS", MA: "MAD", DZ: "DZD", TN: "TND",
  RU: "RUB", UA: "UAH",
};

/**
 * Extract the numeric USD value from a stored price ("$48,500" → 48500), or null
 * when the string carries no number (e.g. "Price on request"). Accepts a number
 * unchanged so callers can pass either a stored string or a computed total.
 */
export function parseUsd(price: string | number): number | null {
  if (typeof price === "number") return Number.isFinite(price) ? price : null;
  const digits = price.replace(/[^0-9.]/g, "");
  if (!digits) return null;
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) ? value : null;
}

/** Currency for a country code, defaulting to USD. */
export function currencyForCountry(country: string | null | undefined): string {
  if (!country) return DEFAULT_CURRENCY;
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? DEFAULT_CURRENCY;
}

/**
 * Format a USD amount in `code` using the USD-based `rates`. Whole units, no
 * minor units, to match the maison's price styling. Falls back to a plain grouped
 * number for currency codes `Intl` doesn't recognise.
 */
export function formatMoney(usd: number, code: string, rates: Rates): string {
  const amount = usd * (rates[code] ?? 1);
  try {
    return new Intl.NumberFormat(FORMAT_LOCALE, {
      style: "currency",
      currency: code,
      // Show the local currency symbol ($, ₹, €, £, ¥ …). "narrowSymbol" prefers
      // the short form ("$" not "US$", "¥" not "JP¥") for a clean luxury look.
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${Math.round(amount).toLocaleString(FORMAT_LOCALE)}`;
  }
}

/**
 * Convert a stored USD price (string or number) into a display string in `code`.
 * Non-numeric prices (e.g. "Price on request") are returned unchanged.
 */
export function convertPrice(
  price: string | number,
  code: string,
  rates: Rates,
): string {
  const usd = parseUsd(price);
  if (usd === null) return typeof price === "string" ? price : "";
  return formatMoney(usd, code, rates);
}

/** Display label for a currency code, e.g. "EUR — Euro" (falls back to the code). */
export function currencyLabel(code: string): string {
  try {
    const name = new Intl.DisplayNames([FORMAT_LOCALE], {
      type: "currency",
    }).of(code);
    return name && name !== code ? `${code} — ${name}` : code;
  } catch {
    return code;
  }
}
