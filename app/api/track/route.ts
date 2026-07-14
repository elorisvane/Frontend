import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/src/lib/supabaseAdmin";

/**
 * Records one storefront page view for the Admin's Live View screen.
 *
 * The write happens here, server-side, rather than from the browser for two
 * reasons: the `storefront_events` table has no anon RLS policy (so traffic
 * can't be forged or read with the public key), and the visitor's coarse
 * location is taken from Vercel's geo headers — which means we never receive or
 * store an IP address.
 *
 * Fire-and-forget by design: the beacon never blocks a page, and a failure to
 * log traffic must never surface to a shopper, so every path returns 204.
 */

export const runtime = "nodejs";

// Bounds match the CHECK constraints in 0020_storefront_events.sql.
const MAX_ID = 64;
const MAX_PATH = 500;
const MAX_REFERRER = 500;
const MAX_CITY = 120;

// Page views are cheap but unbounded — trim the log occasionally rather than
// standing up pg_cron for it. Runs on ~1 in 50 views, so it costs nothing on the
// hot path and still keeps the table from growing forever.
const RETENTION_DAYS = 30;
const PRUNE_PROBABILITY = 0.02;

const clean = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
};

/**
 * Vercel's geo coords are a city centroid from an IP database, not a device fix.
 * Round to one decimal (~11km) anyway: it's all a globe dot needs, and it keeps
 * the stored value far too coarse to point at anybody.
 */
const coord = (value: string | null, bound: number): number | null => {
  if (!value) return null;
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n) || Math.abs(n) > bound) return null;
  return Math.round(n * 10) / 10;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const sessionId = clean(body.sessionId, MAX_ID);
    const visitorId = clean(body.visitorId, MAX_ID);
    // Without both ids the row can't be counted as a session or a visitor.
    if (!sessionId || !visitorId) return new NextResponse(null, { status: 204 });

    const headers = request.headers;
    // Vercel resolves these at the edge; they're absent in local dev.
    const country = clean(headers.get("x-vercel-ip-country"), 2);
    const rawCity = headers.get("x-vercel-ip-city");
    // Vercel percent-encodes city names ("New%20Delhi").
    let city: string | null = null;
    try {
      city = clean(rawCity ? decodeURIComponent(rawCity) : null, MAX_CITY);
    } catch {
      city = clean(rawCity, MAX_CITY);
    }

    const { error } = await supabaseAdmin.from("storefront_events").insert({
      session_id: sessionId,
      visitor_id: visitorId,
      path: clean(body.path, MAX_PATH) ?? "/",
      referrer: clean(body.referrer, MAX_REFERRER),
      country,
      city,
      latitude: coord(headers.get("x-vercel-ip-latitude"), 90),
      longitude: coord(headers.get("x-vercel-ip-longitude"), 180),
    });
    if (error) console.warn("[track] could not record page view:", error.message);

    if (Math.random() < PRUNE_PROBABILITY) {
      const cutoff = new Date(
        Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();
      await supabaseAdmin
        .from("storefront_events")
        .delete()
        .lt("created_at", cutoff);
    }
  } catch (err) {
    console.warn("[track] failed:", err);
  }

  return new NextResponse(null, { status: 204 });
}
