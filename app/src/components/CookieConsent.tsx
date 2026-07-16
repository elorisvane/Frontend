"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { getConsent, setConsent, subscribeConsent } from "../lib/consent";

/**
 * Asks before the analytics beacon may store anything on the visitor's device.
 *
 * "Decline" is one click, same size, same prominence as "Accept" — GDPR treats
 * consent as invalid if refusing is harder than agreeing, so the styling here is
 * a compliance detail, not a taste one. Declining is honoured retroactively:
 * see setConsent, which clears any id already minted.
 */
export default function CookieConsent() {
  // The choice lives in localStorage, which the server can't read — so render
  // nothing until hydration rather than flash a banner at someone who already
  // answered. (Same pattern as the bag badge in Header.)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsent,
    () => null,
  );

  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      // Above the header (z-50) and the mega-menu, below the search overlay.
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-neutral-200 bg-white px-6 py-5 md:px-12"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-neutral-700">
          We use analytics cookies to understand how our creations are
          discovered. They are optional, and nothing is stored on your device
          unless you accept.{" "}
          <Link
            href="/privacy-policy"
            className="underline underline-offset-4 transition-colors hover:text-neutral-900"
          >
            Privacy policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => setConsent("denied")}
            className="border border-neutral-300 px-6 py-2.5 text-xs uppercase tracking-[0.15em] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
          >
            Decline
          </button>
          <button
            onClick={() => setConsent("granted")}
            className="border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-80"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
