/**
 * Server-only currency helpers: fetch the live USD-based exchange rates (cached)
 * and decide which currency to show a visitor. Imported from the root layout
 * only — the `next/headers` import keeps this off the client bundle.
 */

import { cookies, headers } from "next/headers";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  currencyForCountry,
  type Rates,
} from "./currency";

// Free, key-less, USD-based rates (~160 currencies). Cached for 6h so we hit the
// provider at most a few times a day regardless of traffic.
const RATES_ENDPOINT = "https://open.er-api.com/v6/latest/USD";
const RATES_TTL_SECONDS = 6 * 60 * 60;

/**
 * Live USD-based exchange rates. Fails open to `{ USD: 1 }` so the storefront
 * simply shows USD (never breaks) if the FX source is down or misconfigured.
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
    return data.rates;
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
  const override = (await cookies()).get(CURRENCY_COOKIE)?.value;
  if (override && rates[override]) return override;

  const byCountry = currencyForCountry(await requestCountry());
  return rates[byCountry] ? byCountry : DEFAULT_CURRENCY;
}
