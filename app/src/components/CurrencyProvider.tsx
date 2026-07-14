"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENCY_COOKIE,
  SUPPORTED_CURRENCIES,
  convertPrice,
  type Rates,
} from "../lib/currency";

interface CurrencyContextValue {
  /** Active ISO-4217 currency code, e.g. "EUR". */
  code: string;
  /** USD-based rate table (supported currencies only). */
  rates: Rates;
  /** Currency codes offered in the switcher, in display order. */
  available: string[];
  /** Switch currency; persists the choice for later server renders. */
  setCurrency: (code: string) => void;
  /** Convert a stored USD price (string or number) into the active currency. */
  format: (price: string | number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Makes the visitor's currency and the USD-based rate table available across the
 * storefront. Seeded from the server (detected currency + fetched rates) so the
 * first paint already shows the right currency with no hydration flash; because
 * the full rate table is on the client, the switcher re-prices instantly with no
 * round-trip.
 */
export default function CurrencyProvider({
  initialCode,
  rates,
  children,
}: {
  initialCode: string;
  rates: Rates;
  children: ReactNode;
}) {
  const [code, setCode] = useState(initialCode);

  const setCurrency = useCallback((next: string) => {
    setCode(next);
    // Persist so subsequent server renders (and page reloads) match the choice.
    document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  // Curated order (USD first), not alphabetical — and only codes we actually
  // hold a rate for, so a currency can never be offered that we can't price.
  const available = useMemo(
    () => SUPPORTED_CURRENCIES.filter((c) => typeof rates[c] === "number"),
    [rates],
  );

  const format = useCallback(
    (price: string | number) => convertPrice(price, code, rates),
    [code, rates],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({ code, rates, available, setCurrency, format }),
    [code, rates, available, setCurrency, format],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within <CurrencyProvider>");
  return ctx;
}

/** Render a stored USD price converted into the active currency. */
export function Price({
  usd,
  className,
}: {
  usd: string | number;
  className?: string;
}) {
  const { format } = useCurrency();
  return <span className={className}>{format(usd)}</span>;
}
