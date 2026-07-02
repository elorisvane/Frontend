"use client";

import { useEffect, useState } from "react";
import { useCurrency } from "./CurrencyProvider";
import { currencyLabel } from "../lib/currency";

/**
 * Currency picker — lists every currency we hold a rate for. Changing it re-prices
 * the whole storefront instantly (client-side) and remembers the choice.
 *
 * `tone` matches the surrounding surface (dark footer vs. light/dark header).
 * `compact` shows just the 3-letter code (for the tight header row); the full
 * "EUR — Euro" label is used otherwise.
 */
export default function CurrencySwitcher({
  className = "",
  tone = "dark",
  compact = false,
}: {
  className?: string;
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  const { code, available, setCurrency } = useCurrency();

  // `currencyLabel` relies on `Intl.DisplayNames`, whose output depends on the
  // runtime's ICU data and so differs between the server and the browser. Render
  // a deterministic value during SSR / first hydration (the plain code), then
  // enrich to the full label once mounted on the client — avoids a mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const labelFor = (c: string) => (compact || !mounted ? c : currencyLabel(c));

  // Nothing to switch between when only the USD fallback is present.
  if (available.length < 2) return null;

  const text =
    tone === "light"
      ? "text-neutral-600 hover:text-neutral-900"
      : "text-white/60 hover:text-white";
  const optionClass =
    tone === "light" ? "bg-white text-neutral-900" : "bg-black text-white";

  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">Currency</span>
      <svg
        className="h-3.5 w-3.5 opacity-60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
      <select
        aria-label="Currency"
        value={code}
        onChange={(e) => setCurrency(e.target.value)}
        className={`cursor-pointer border-none bg-transparent font-sans text-[11px] tracking-[0.15em] transition-colors focus:outline-none ${text}`}
      >
        {available.map((c) => (
          <option key={c} value={c} className={optionClass}>
            {labelFor(c)}
          </option>
        ))}
      </select>
    </label>
  );
}
