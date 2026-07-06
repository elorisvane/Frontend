"use server";

import { supabaseAdmin } from "../lib/supabaseAdmin";

export interface SubscribeResult {
  ok: boolean;
  error?: string;
}

/**
 * Save a newsletter sign-up from the footer bar. Runs on the server with the
 * service-role client (bypasses RLS), so it doesn't depend on an anon INSERT
 * policy. The service key stays on the server — never shipped to the browser.
 *
 * Returns a result (rather than throwing) so the user-facing message survives
 * Next's production redaction of server-action errors. The email is normalised
 * and duplicates are ignored, so re-subscribing is a silent success.
 */
export async function subscribeToNewsletter(
  email: string,
): Promise<SubscribeResult> {
  const clean = email.trim().toLowerCase();
  // Light server-side validation (the form also enforces type="email").
  if (!clean || clean.length > 320 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .upsert(
      { email: clean, source: "footer" },
      { onConflict: "email", ignoreDuplicates: true },
    );

  if (error) {
    console.error("Newsletter subscribe failed:", error.message);
    return { ok: false, error: "Could not subscribe just now. Please try again." };
  }

  return { ok: true };
}
