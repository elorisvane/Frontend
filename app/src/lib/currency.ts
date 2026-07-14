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

/**
 * The only currencies the maison sells in. This is the single source of truth:
 * the switcher lists exactly these, `getRates` keeps only these, and any other
 * currency (from geo-IP or a stale cookie) falls back to USD. Array order is the
 * order shown in the switcher, so the default sits first.
 */
export const SUPPORTED_CURRENCIES = ["USD", "CAD", "EUR", "AED", "INR"];

export function isSupportedCurrency(code: string | null | undefined): boolean {
  return !!code && SUPPORTED_CURRENCIES.includes(code.toUpperCase());
}

/** Cookie holding an explicit currency override chosen in the switcher. */
export const CURRENCY_COOKIE = "eloris-currency";

/** Formatting locale is pinned so server and client render byte-identically
 *  (avoids hydration mismatches from differing runtime locales). */
const FORMAT_LOCALE = "en-US";

/**
 * ISO-3166 alpha-2 country → ISO-4217 currency, restricted to the currencies we
 * actually sell in (see SUPPORTED_CURRENCIES). Used to pick a sensible default
 * from the visitor's geo-IP country header; the shopper can always override it.
 *
 * Only countries whose currency we support are listed — everyone else (Japan,
 * the UK, Australia …) is shown USD, because offering a shopper a currency the
 * switcher can't even select would be worse than showing the default.
 */
export const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  IN: "INR",
  AE: "AED",
  // The euro area.
  AT: "EUR", BE: "EUR", HR: "EUR", CY: "EUR", EE: "EUR", FI: "EUR", FR: "EUR",
  DE: "EUR", GR: "EUR", IE: "EUR", IT: "EUR", LV: "EUR", LT: "EUR", LU: "EUR",
  MT: "EUR", NL: "EUR", PT: "EUR", SK: "EUR", SI: "EUR", ES: "EUR",
  // Microstates that use the euro.
  AD: "EUR", MC: "EUR", SM: "EUR", VA: "EUR",
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

/** Currency for a country code, defaulting to USD. Never returns an unsupported code. */
export function currencyForCountry(country: string | null | undefined): string {
  if (!country) return DEFAULT_CURRENCY;
  const code = COUNTRY_CURRENCY[country.toUpperCase()];
  return isSupportedCurrency(code) ? code : DEFAULT_CURRENCY;
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
