"use client";

import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Wishlist() {
  // No persisted items yet — wire up to a store / API to populate.
  const items: never[] = [];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header />

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-200">
            My Wishlist
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            Saved Creations
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto mt-20 flex max-w-md flex-col items-center text-center">
            <svg
              className="h-12 w-12 text-gold-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.5 4.5 13a4.5 4.5 0 0 1 7.5-4.9A4.5 4.5 0 0 1 19.5 13L12 20.5Z"
              />
            </svg>
            <p className="mt-8 font-serif text-2xl font-light tracking-[0.05em]">
              Your wishlist is empty
            </p>
            <p className="mt-4 font-sans text-sm leading-loose tracking-[0.04em] text-white/60">
              Save the pieces you love to revisit them at any time, or to share
              with a client advisor during a private appointment.
            </p>
            <Link
              href="/"
              className="mt-10 inline-block border border-white/40 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:border-gold-200 hover:text-gold-200"
            >
              DISCOVER THE COLLECTIONS
            </Link>
          </div>
        ) : null}
      </section>

      <Footer />
    </div>
  );
}
