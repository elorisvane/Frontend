/**
 * Browser-scoped ids for the first-party analytics beacon, shared by the
 * page-view tracker (Track.tsx) and the identity linker (Identify.tsx) so both
 * stamp the *same* visitor id.
 *
 *  - `session_id` lives in sessionStorage, so it dies with the tab — that is
 *    what "one session" means in Live View.
 *  - `visitor_id` lives in localStorage, so a return visit reads as "returning".
 *
 * Both are random and, on their own, tied to nobody. The Admin only ever
 * resolves a visitor to a real customer once that visitor identifies themselves
 * by signing in — see Identify.tsx and the visitor_identities table.
 */

export const SESSION_KEY = "eloris_sid";
export const VISITOR_KEY = "eloris_vid";

/** Read an existing id, or mint and persist a new one. */
export function readOrMintId(store: Storage, key: string): string {
  const existing = store.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  store.setItem(key, id);
  return id;
}
