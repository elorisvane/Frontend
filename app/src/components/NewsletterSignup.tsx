"use client";

import { useState } from "react";

/**
 * Newsletter subscribe bar shown above the footer. UI only for now — on submit
 * it shows an optimistic confirmation and does not yet persist the address
 * (wire to a Supabase table or ESP when one exists).
 */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
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
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email address"
              className="w-full border border-neutral-300 bg-white px-4 py-3 font-sans text-sm tracking-[0.05em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none sm:w-72"
            />
            <button
              type="submit"
              className="w-full bg-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700 sm:w-auto"
            >
              SUBSCRIBE
            </button>
          </>
        )}
      </form>
    </section>
  );
}
