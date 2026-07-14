/**
 * Server-only currency helpers: fetch the live USD-based exchange rates (cached)
 * and decide which currency to show a visitor. Imported from the root layout
 * only — the `next/headers` import keeps this off the client bundle.
 */

import { cookies, headers } from "next/headers";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  currencyForCountry,
  isSupportedCurrency,
  type Rates,
} from "./currency";

// Free, key-less, USD-based rates (~160 currencies). Cached for 6h so we hit the
// provider at most a few times a day regardless of traffic.
const RATES_ENDPOINT = "https://open.er-api.com/v6/latest/USD";
const RATES_TTL_SECONDS = 6 * 60 * 60;

/**
 * Live USD-based exchange rates, narrowed to the currencies we sell in.
 *
 * The provider returns ~160 currencies; this whole table is serialised into
 * every page for the client-side switcher, so keeping only the supported ones
 * both shrinks that payload and means an unsupported code can never be
 * selected or priced anywhere downstream.
 *
 * Fails open to `{ USD: 1 }` so the storefront simply shows USD (never breaks)
 * if the FX source is down or misconfigured.
 */
export async function getRates(): Promise<Rates> {
  try {
    const res = await fetch(RATES_ENDPOINT, {
      next: { revalidate: RATES_TTL_SECONDS },
    });
    if (!res.ok) return { USD: 1 };
    const data = (await res.json()) as {
      result?: string;
      rates?: Rates;
    };
    if (data.result !== "success" || !data.rates?.USD) return { USD: 1 };

    const supported: Rates = { USD: 1 };
    for (const code of SUPPORTED_CURRENCIES) {
      const rate = data.rates[code];
      if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) {
        supported[code] = rate;
      }
    }
    return supported;
  } catch {
    return { USD: 1 };
  }
}

/** Read the visitor's geo-IP country from the common CDN/proxy headers. */
async function requestCountry(): Promise<string | null> {
  const h = await headers();
  return (
    h.get("x-vercel-ip-country") ??
    h.get("cf-ipcountry") ??
    h.get("x-country") ??
    null
  );
}

/**
 * The currency to show this visitor: an explicit switcher cookie wins, else the
 * geo-IP country's currency, else USD. Only ever returns a code we hold a rate
 * for, so conversion is always defined.
 */
export async function detectCurrency(rates: Rates): Promise<string> {
  const override = (await cookies()).get(CURRENCY_COOKIE)?.value?.toUpperCase();
  // A cookie set before the currency list was narrowed (say "JPY") is ignored
  // rather than honoured — it is no longer selectable, so it must not be shown.
  if (override && isSupportedCurrency(override) && rates[override]) {
    return override;
  }

  const byCountry = currencyForCountry(await requestCountry());
  return rates[byCountry] ? byCountry : DEFAULT_CURRENCY;
}
