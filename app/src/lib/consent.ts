/**
 * Analytics cookie consent.
 *
 * The Live View beacon writes a visitor id to localStorage. Under ePrivacy
 * Art. 5(3) that is "storage on terminal equipment", and analytics is not
 * "strictly necessary" — so it is unlawful to set it for an EU visitor before
 * they agree. Nothing is stored until `setConsent("granted")`.
 *
 * What consent unlocks is the *identifier*, not the person: it lets us count a
 * visit and join it to the rest of a session. It does not, and cannot, reveal a
 * visitor's name, email or address — the browser never sends those. Those only
 * ever arrive when a shopper types them in (newsletter, account, checkout).
 *
 * Deliberately a tiny store rather than a context: the beacon and the banner are
 * mounted far apart in the tree, and both just need "what's the current answer,
 * tell me when it changes" — which useSyncExternalStore reads directly.
 */

import { SESSION_KEY, VISITOR_KEY } from "./visitorId";

export const CONSENT_KEY = "eloris_consent";

/** `null` means "not asked yet" — the banner is showing. */
export type Consent = "granted" | "denied" | null;

const listeners = new Set<() => void>();

export function getConsent(): Consent {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Private mode / storage blocked — treat as "not asked", and since nothing
    // can be stored, nothing can be tracked either.
    return null;
  }
}

export function setConsent(value: Exclude<Consent, null>): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
    if (value === "denied") {
      // Declining has to be retroactive: an id minted before the choice (or
      // before a later change of mind) must not linger on the device.
      window.localStorage.removeItem(VISITOR_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Can't persist the choice; still notify so the banner closes for this view.
  }
  for (const listener of listeners) listener();
}

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}
