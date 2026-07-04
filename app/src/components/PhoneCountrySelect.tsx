"use client";

import { useEffect, useRef, useState } from "react";
import {
  US, GB, FR, DE, IT, ES, CH, NL, BE, IE, SE, NO, DK, PT, AT, IN, AE, SA,
  QA, SG, HK, JP, CN, KR, AU, NZ, CA, MX, BR, ZA,
} from "country-flag-icons/react/3x2";
import { COUNTRIES } from "../lib/countries";

// Bundled flag SVGs (no external requests) keyed by ISO code, so the phone
// country picker can show real flags — native <select> options can only hold
// text, which is why a plain select renders "US"/"GB" letters on Windows.
const FLAGS: Record<string, React.ComponentType<{ className?: string }>> = {
  US, GB, FR, DE, IT, ES, CH, NL, BE, IE, SE, NO, DK, PT, AT, IN, AE, SA,
  QA, SG, HK, JP, CN, KR, AU, NZ, CA, MX, BR, ZA,
};

export default function PhoneCountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape while open.
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

  const selected = COUNTRIES.find((c) => c.code === value) ?? COUNTRIES[0];
  const SelectedFlag = FLAGS[selected.code];

  return (
    <div ref={ref} className="relative w-28 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country calling code: ${selected.name} ${selected.dial}`}
        className="flex w-full items-center gap-2 border border-neutral-300 bg-transparent px-3 py-3.5 font-sans text-sm tracking-[0.05em] text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
      >
        {SelectedFlag && (
          <SelectedFlag className="h-4 w-6 shrink-0 rounded-[2px]" />
        )}
        <span>{selected.dial}</span>
        <svg
          className={`ml-auto h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Country calling code"
          className="absolute left-0 z-20 mt-1 max-h-64 w-44 overflow-auto border border-neutral-200 bg-white py-1 shadow-xl"
        >
          {COUNTRIES.map((c) => {
            const Flag = FLAGS[c.code];
            const active = c.code === value;
            return (
              <li key={c.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left font-sans text-sm tracking-[0.04em] transition-colors hover:bg-neutral-100 ${
                    active ? "bg-neutral-100 text-neutral-900" : "text-neutral-700"
                  }`}
                >
                  {Flag && <Flag className="h-4 w-6 shrink-0 rounded-[2px]" />}
                  <span className="w-6 shrink-0 text-neutral-400">{c.code}</span>
                  <span className="ml-auto">{c.dial}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
