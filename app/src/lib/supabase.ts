import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/* -------------------------------------------------------------------------- */
/* "Remember me" — persistent vs session-only auth storage                    */
/* -------------------------------------------------------------------------- */

// The preference itself lives in localStorage; the auth *session* is written to
// localStorage (survives a browser restart) when remembered, or sessionStorage
// (cleared when the tab/browser closes) when not.
const REMEMBER_KEY = "eloris.remember";

/** Choose where the next sign-in's session is stored. Call before signing in. */
export function setSessionPersistence(remember: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

// Default to persistent unless the shopper explicitly opted out.
function isPersistent(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(REMEMBER_KEY) !== "0";
}

// Routes the Supabase session to local- or sessionStorage based on the current
// "remember me" preference, and reads back from whichever one holds it.
const hybridStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    return (
      window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
    );
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    if (isPersistent()) {
      window.sessionStorage.removeItem(key);
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
      window.sessionStorage.setItem(key, value);
    }
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

/**
 * Anon client for public reads (browser + server). Returns `null` when the
 * Supabase env vars are not configured, so pages can fall back to their bundled
 * defaults instead of crashing the storefront.
 */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { storage: hybridStorage },
    });
  }
  return client;
}
