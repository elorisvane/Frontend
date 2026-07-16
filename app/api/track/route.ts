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

// Bounds match the CHECK constraints in 0020_storefront_events.sql / 0023.
const MAX_ID = 64;
const MAX_PATH = 500;
const MAX_REFERRER = 500;
const MAX_CITY = 120;
const MAX_UTM = 100;

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

/**
 * Reduce the User-Agent to three coarse buckets for the Live View.
 *
 * The raw UA is deliberately NOT stored: in full it is a strong fingerprint,
 * whereas "mobile / Safari / iOS" describes the visit without describing the
 * visitor — the same line 0020 draws by never storing an IP.
 *
 * Sniffing beats the UA-CH client hints here because it needs no extra headers
 * and this is a page-view beacon, not a rendering decision. Order matters: Edge,
 * Opera and Samsung all put "Chrome" in their UA, and Chrome puts "Safari" in
 * its own, so test the most specific first.
 */
function parseUserAgent(ua: string | null): {
  deviceType: string | null;
  browser: string | null;
  os: string | null;
} {
  if (!ua) return { deviceType: null, browser: null, os: null };

  const deviceType = /iPad|Tablet/i.test(ua)
    ? "tablet"
    : /Mobi|Android|iPhone|iPod/i.test(ua)
      ? "mobile"
      : "desktop";

  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox\/|FxiOS/.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS/.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : null;

  // iOS before macOS: an iPhone UA also carries "like Mac OS X". (An iPad on
  // iPadOS 13+ claims to be a Mac outright — it reads as desktop/macOS here,
  // which is as far as a UA string can honestly take us.)
  const os = /Windows NT/.test(ua)
    ? "Windows"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Android/.test(ua)
          ? "Android"
          : /Linux/.test(ua)
            ? "Linux"
            : null;

  return { deviceType, browser, os };
}

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

    // Parsed here rather than sent by the client: the header is already on the
    // request, and the browser can't misreport what it's running.
    const { deviceType, browser, os } = parseUserAgent(headers.get("user-agent"));

    const { error } = await supabaseAdmin.from("storefront_events").insert({
      session_id: sessionId,
      visitor_id: visitorId,
      path: clean(body.path, MAX_PATH) ?? "/",
      referrer: clean(body.referrer, MAX_REFERRER),
      country,
      city,
      latitude: coord(headers.get("x-vercel-ip-latitude"), 90),
      longitude: coord(headers.get("x-vercel-ip-longitude"), 180),
      device_type: deviceType,
      browser,
      os,
      utm_source: clean(body.utmSource, MAX_UTM),
      utm_medium: clean(body.utmMedium, MAX_UTM),
      utm_campaign: clean(body.utmCampaign, MAX_UTM),
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
