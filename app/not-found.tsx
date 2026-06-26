import type { Metadata } from "next";
import Link from "next/link";
import Header from "./src/components/Header";
import Footer from "./src/components/Footer";

export const metadata: Metadata = {
  title: "Page Not Found | ÉLORIS",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-40 text-center">
        {/* Oversized watermark numeral */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-serif text-[42vw] font-light leading-none text-neutral-50 md:text-[28vw]"
        >
          404
        </span>

        <div className="relative">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-600">
            Error 404
          </p>
          <h1 className="mt-6 font-serif text-5xl font-light tracking-[0.08em] md:text-7xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-8 max-w-md font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
            The piece you are looking for has moved, or no longer exists. Allow
            us to guide you back to the maison.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/"
              className="w-full bg-neutral-900 px-10 py-4 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700 sm:w-auto"
            >
              RETURN HOME
            </Link>
            <Link
              href="/products"
              className="w-full border border-neutral-900 px-10 py-4 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white sm:w-auto"
            >
              EXPLORE CREATIONS
            </Link>
          </div>

          <Link
            href="/contact"
            className="mt-10 inline-block font-sans text-[11px] tracking-[0.2em] text-neutral-400 underline underline-offset-4 transition-colors hover:text-neutral-900"
          >
            CONTACT A CLIENT ADVISOR
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
