"use client";

import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Wishlist() {
  // No persisted items yet — wire up to a store / API to populate.
  const items: never[] = [];

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-neutral-500">
            My Wishlist
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            Saved Creations
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto mt-20 flex max-w-md flex-col items-center text-center">
            <svg
              className="h-12 w-12 text-neutral-300"
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
            <p className="mt-4 font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
              Save the pieces you love to revisit them at any time, or to share
              with a client advisor during a private appointment.
            </p>
            <Link
              href="/products"
              className="mt-10 inline-block border border-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
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
