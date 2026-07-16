"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useCurrency } from "./CurrencyProvider";
import { currencyLabel } from "../lib/currency";

type FlagMap = Record<
  string,
  React.ComponentType<{ className?: string; title?: string }>
>;

// ISO-4217 currency → ISO-3166 country flag. For almost every code the first
// two letters are the country (USD→US, THB→TH, GBP→GB); the exceptions are
// supranational/regional currencies handled here (or left to fall back to a
// globe when no single flag applies, e.g. XOF/XAF/XCD/XDR).
const COUNTRY_OVERRIDE: Record<string, string> = { EUR: "EU" };

function currencyCountry(code: string): string {
  return COUNTRY_OVERRIDE[code] ?? code.slice(0, 2).toUpperCase();
}

// The market a currency stands for, shown under the wordmark on mobile. Falls
// back to the currency code itself for anything not spelled out here.
const MARKET_LABEL: Record<string, string> = {
  USD: "USA",
  CAD: "CANADA",
  EUR: "EUROPE",
  AED: "UAE",
  INR: "INDIA",
};

function marketLabel(code: string): string {
  return MARKET_LABEL[code] ?? code;
}

// "EUR — Euro" → "Euro" (label already resolves the code; keep just the name).
function currencyName(code: string): string {
  const label = currencyLabel(code);
  const i = label.indexOf(" — ");
  return i >= 0 ? label.slice(i + 3) : "";
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
      />
    </svg>
  );
}

/**
 * Currency picker — lists the currencies the maison sells in (see
 * SUPPORTED_CURRENCIES), each with its flag. Changing it re-prices the whole
 * storefront instantly (client-side) and remembers the choice.
 *
 * `tone` matches the surrounding surface (light/dark). `compact` shows just the
 * 3-letter code in the trigger (header); otherwise the full "EUR — Euro" label.
 * `menuPlacement="up"` opens the panel upward (for the footer).
 *
 * `variant="country"` shows the market ("USA") rather than the currency code and
 * opens its list centred beneath itself — that's the mobile trigger that sits
 * under the wordmark, where a right-anchored list would run off the screen.
 */
export default function CurrencySwitcher({
  className = "",
  tone = "dark",
  compact = false,
  menuPlacement = "down",
  variant = "menu",
}: {
  className?: string;
  tone?: "light" | "dark";
  compact?: boolean;
  menuPlacement?: "up" | "down";
  variant?: "menu" | "country";
}) {
  const { code, available, setCurrency } = useCurrency();

  const [open, setOpen] = useState(false);
  const [flags, setFlags] = useState<FlagMap | null>(null);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // `currencyLabel` relies on `Intl.DisplayNames`, whose output depends on the
  // runtime's ICU data and so differs between server and browser. Render the
  // plain code during SSR / first paint (mounted=false), then enrich on the
  // client. useSyncExternalStore keeps this hydration-safe without a
  // setState-in-effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Load flag SVGs after mount so the trigger shows the selected currency's flag
  // right away (and the list is ready when opened). Still a separate lazy chunk
  // — not in the initial JS every page's header would otherwise pay for; the
  // browser caches it after the first page.
  useEffect(() => {
    if (flags) return;
    let active = true;
    import("country-flag-icons/react/3x2").then((m) => {
      if (active) setFlags(m as unknown as FlagMap);
    });
    return () => {
      active = false;
    };
  }, [flags]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Nothing to switch between when only the USD fallback is present.
  if (available.length < 2) return null;

  const triggerLabel = compact || !mounted ? code : currencyLabel(code);
  const SelectedFlag = flags?.[currencyCountry(code)];

  const triggerText =
    tone === "light"
      ? "text-neutral-600 hover:text-neutral-900"
      : "text-white/60 hover:text-white";
  const menuSurface =
    tone === "light"
      ? "border-neutral-200 bg-white text-neutral-900"
      : "border-white/15 bg-neutral-900 text-white";
  const optionHover = tone === "light" ? "hover:bg-neutral-100" : "hover:bg-white/10";
  const activeRow = tone === "light" ? "bg-neutral-100" : "bg-white/10";
  const searchInput =
    tone === "light"
      ? "border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 focus:border-neutral-900"
      : "border-white/15 bg-transparent text-white placeholder-white/40 focus:border-white/50";

  const isCountry = variant === "country";
  const showSearch = available.length > 10;
  const q = query.trim().toLowerCase();
  const filtered = q
    ? available.filter(
        (c) =>
          c.toLowerCase().includes(q) ||
          (mounted && currencyName(c).toLowerCase().includes(q)),
      )
    : available;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Currency"
        className={
          isCountry
            ? `font-sans text-[10px] uppercase tracking-[0.3em] transition-colors focus:outline-none ${triggerText}`
            : `inline-flex items-center gap-1.5 font-sans text-[11px] tracking-[0.15em] transition-colors focus:outline-none ${triggerText}`
        }
      >
        {isCountry ? (
          marketLabel(code)
        ) : (
          <>
            <span className="inline-flex h-3.5 w-5 shrink-0 items-center justify-center">
              {SelectedFlag ? (
                <SelectedFlag className="h-3.5 w-5 rounded-[1px]" />
              ) : (
                <GlobeIcon className="h-3.5 w-3.5 opacity-60" />
              )}
            </span>
            <span>{triggerLabel}</span>
            <svg
              className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform ${
                open ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-40 w-64 border shadow-xl ${menuSurface} ${
            // Centred under the wordmark; right-anchored everywhere else, where
            // the trigger already sits at the edge of its row.
            isCountry ? "left-1/2 -translate-x-1/2" : "right-0"
          } ${menuPlacement === "up" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {showSearch && (
            <div className="p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search currency"
                aria-label="Search currency"
                className={`w-full border px-3 py-2 font-sans text-xs tracking-[0.05em] focus:outline-none ${searchInput}`}
              />
            </div>
          )}
          <ul role="listbox" className="max-h-72 overflow-auto pb-1">
            {filtered.map((c) => {
              const Flag = flags?.[currencyCountry(c)];
              const active = c === code;
              return (
                <li key={c}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setCurrency(c);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left font-sans text-xs tracking-[0.05em] transition-colors ${optionHover} ${
                      active ? activeRow : ""
                    }`}
                  >
                    {Flag ? (
                      <Flag className="h-3.5 w-5 shrink-0 rounded-[1px]" />
                    ) : (
                      <GlobeIcon className="h-3.5 w-5 shrink-0 opacity-40" />
                    )}
                    <span className="w-9 shrink-0 font-medium">{c}</span>
                    {mounted && (
                      <span className="truncate opacity-60">
                        {currencyName(c)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-3 font-sans text-xs opacity-50">
                No match
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
