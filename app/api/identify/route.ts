import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/src/lib/supabaseAdmin";

/**
 * Records that an anonymous storefront visitor is, in fact, a signed-in
 * customer — the one legitimate bridge from the anonymous Live View back to a
 * person (see the visitor_identities migration, 0022).
 *
 * The browser sends its visitor id plus the customer's access token. The token
 * is verified here, server-side, so the link can only ever be made for the real
 * signed-in user — a visitor can't be tied to an account that isn't theirs.
 *
 * Fire-and-forget by design, like /api/track: it must never block or break a
 * shopper's page, so every path returns 204.
 */

export const runtime = "nodejs";

// Bounds match the CHECK constraints in 0022_visitor_identities.sql.
const MAX_ID = 64;
const MAX_EMAIL = 320;
const MAX_NAME = 200;

const clean = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const visitorId = clean(body.visitorId, MAX_ID);

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;
    // No visitor to link, or no token to prove who they are → nothing to do.
    if (!visitorId || !token) return new NextResponse(null, { status: 204 });

    // Verify the JWT: the browser proves its identity, it doesn't just claim it.
    // An expired or forged token resolves to no user, so we link nothing.
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return new NextResponse(null, { status: 204 });

    const user = data.user;
    const meta = (user.user_metadata ?? {}) as {
      full_name?: string;
      first_name?: string;
      last_name?: string;
    };
    const fullName =
      clean(meta.full_name, MAX_NAME) ??
      clean([meta.first_name, meta.last_name].filter(Boolean).join(" "), MAX_NAME);

    // One identity per browser — a later sign-in (e.g. a shared device) wins.
    const { error: upsertError } = await supabaseAdmin
      .from("visitor_identities")
      .upsert(
        {
          visitor_id: visitorId,
          user_id: user.id,
          email: clean(user.email, MAX_EMAIL),
          full_name: fullName,
          identified_at: new Date().toISOString(),
        },
        { onConflict: "visitor_id" },
      );
    if (upsertError)
      console.warn("[identify] could not link visitor:", upsertError.message);
  } catch (err) {
    console.warn("[identify] failed:", err);
  }

  return new NextResponse(null, { status: 204 });
}
