"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "../data/newsletter";

/**
 * Newsletter subscribe bar shown above the footer. On submit it saves the email
 * to Supabase (visible in the Admin "Newsletter" screen) and shows a
 * confirmation.
 */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const clean = email.trim();
    if (!clean) return;
    setPending(true);
    setError(null);
    try {
      await subscribeToNewsletter(clean);
      setDone(true);
    } catch {
      setError("Could not subscribe just now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="border-t border-neutral-200 bg-neutral-100 px-6 py-10 text-neutral-900 md:px-12">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
      >
        <span className="font-sans text-[11px] tracking-[0.3em] text-neutral-700">
          NEWSLETTER
        </span>
        {done ? (
          <p className="font-sans text-[12px] tracking-[0.12em] text-neutral-600">
            Thank you — you’re on the list.
          </p>
        ) : (
          <>
            <div className="w-full sm:w-72">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                aria-label="Email address"
                disabled={pending}
                className="w-full border border-neutral-300 bg-white px-4 py-3 font-sans text-sm tracking-[0.05em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none disabled:opacity-60"
              />
              {error && (
                <p className="mt-2 font-sans text-[11px] tracking-[0.06em] text-red-600">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {pending ? "…" : "SUBSCRIBE"}
            </button>
          </>
        )}
      </form>
    </section>
  );
}
