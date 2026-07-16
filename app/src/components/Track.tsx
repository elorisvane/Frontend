"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { SESSION_KEY, VISITOR_KEY, readOrMintId } from "../lib/visitorId";
import { getConsent, subscribeConsent } from "../lib/consent";

/**
 * First-party page-view beacon feeding the Admin's Live View.
 *
 * The two browser ids it stamps live in `visitorId.ts`, shared with Identify.tsx
 * so a page view and an identity link agree on who the visitor is. Both are
 * random and never tied to a person here.
 *
 * The POST is fire-and-forget (`keepalive`, so it survives the navigation that
 * triggered it) and its result is ignored — analytics must never be able to
 * break or slow a shopper's page.
 */

export default function Track() {
  const pathname = usePathname();
  // React runs effects twice in dev StrictMode; without this the first view of
  // every path would be logged as two sessions' worth of events.
  const lastSent = useRef<string | null>(null);
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsent,
    () => null,
  );

  useEffect(() => {
    // No id may be minted, and no view sent, until the visitor agrees. Bailing
    // before `lastSent` is set matters: when consent lands mid-visit this effect
    // re-runs and the page they're on is still sent, not skipped.
    if (consent !== "granted") return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    let sessionId: string;
    let visitorId: string;
    try {
      sessionId = readOrMintId(sessionStorage, SESSION_KEY);
      visitorId = readOrMintId(localStorage, VISITOR_KEY);
    } catch {
      // Private mode / storage disabled — skip rather than break the page.
      return;
    }

    // Only external referrers are interesting; in-site navigation is already
    // described by the sequence of paths.
    const referrer =
      document.referrer && !document.referrer.startsWith(location.origin)
        ? document.referrer
        : null;

    // Campaign tags off the inbound link. They ride on the landing URL only, so
    // most views send none — the Admin carries the entry view's tags across the
    // whole session. `pathname` deliberately stays query-free: the search string
    // can hold anything, and the tags we want are named explicitly here.
    const params = new URLSearchParams(location.search);
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        visitorId,
        path: pathname,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, consent]);

  return null;
}
