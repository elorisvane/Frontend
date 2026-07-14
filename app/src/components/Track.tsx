"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * First-party page-view beacon feeding the Admin's Live View.
 *
 * Two ids, both generated in the browser and never tied to a person:
 *  - `session_id` lives in sessionStorage, so it dies with the tab — that is
 *    what "one session" means in Live View.
 *  - `visitor_id` lives in localStorage, so a second visit from the same browser
 *    reads as "returning" rather than "new".
 *
 * The POST is fire-and-forget (`keepalive`, so it survives the navigation that
 * triggered it) and its result is ignored — analytics must never be able to
 * break or slow a shopper's page.
 */

const SESSION_KEY = "eloris_sid";
const VISITOR_KEY = "eloris_vid";

/** Read an existing id, or mint and persist a new one. */
function getId(store: Storage, key: string): string {
  const existing = store.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  store.setItem(key, id);
  return id;
}

export default function Track() {
  const pathname = usePathname();
  // React runs effects twice in dev StrictMode; without this the first view of
  // every path would be logged as two sessions' worth of events.
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    let sessionId: string;
    let visitorId: string;
    try {
      sessionId = getId(sessionStorage, SESSION_KEY);
      visitorId = getId(localStorage, VISITOR_KEY);
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

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, visitorId, path: pathname, referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
