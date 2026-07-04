import { getSupabase } from "../lib/supabase";

/**
 * Save a newsletter sign-up from the footer bar. Uses the public anon client —
 * visitors don't need an account — and RLS allows the insert but not reads. The
 * atelier sees the list in the Admin "Newsletter" screen.
 *
 * The email is normalised (trim + lower-case) and the insert ignores conflicts,
 * so re-subscribing the same address is a silent no-op rather than an error.
 */
export async function subscribeToNewsletter(email: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Subscriptions are unavailable right now. Please try again later.");
  }

  const clean = email.trim().toLowerCase();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      { email: clean, source: "footer" },
      { onConflict: "email", ignoreDuplicates: true },
    );

  if (error) throw new Error(error.message);
}
