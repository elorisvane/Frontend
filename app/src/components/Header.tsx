"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { posts } from "../data/posts";
import { products } from "../data/products";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/products", label: "CREATIONS" },
  { href: "/about", label: "ABOUT" },
  { href: "/blog", label: "JOURNAL" },
  { href: "/contact", label: "CONTACT" },
];

interface HeaderProps {
  /** When true the header starts transparent over a hero and darkens on scroll.
   *  When false (default for inner pages) it stays solid for legibility. */
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the search overlay on Escape.
  useEffect(() => {
    if (!searchOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [searchOpen]);

  const solid = !transparent || isScrolled;

  const q = query.trim().toLowerCase();
  const results = q
    ? [
        ...products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.tagline.toLowerCase().includes(q)
          )
          .map((p) => ({
            href: `/products/${p.slug}`,
            title: p.name,
            label: p.category,
          })),
        ...posts
          .filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.excerpt.toLowerCase().includes(q)
          )
          .map((p) => ({
            href: `/blog/${p.slug}`,
            title: p.title,
            label: p.category,
          })),
      ]
    : [];

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-in-out ${
          solid
            ? "bg-black/70 py-4 backdrop-blur-md"
            : "bg-gradient-to-b from-black/30 to-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 md:px-12">
          {/* Hamburger (left) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="group flex h-4 w-6 flex-col justify-between focus:outline-none"
          >
            <span className="h-[1px] w-full bg-white transition-all duration-300 group-hover:bg-gold-200" />
            <span className="h-[1px] w-full bg-white transition-all duration-300 group-hover:bg-gold-200" />
            <span className="h-[1px] w-full bg-white transition-all duration-300 group-hover:bg-gold-200" />
          </button>

          {/* Wordmark (center) */}
          <Link
            href="/"
            aria-label="Eloris home"
            className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center transition-opacity duration-300 hover:opacity-80"
          >
            <span className="font-serif text-2xl font-light tracking-[0.45em] text-white md:text-[28px]">
              ÉLORIS
            </span>
            {/* <span className="mt-1 font-sans text-[9px] tracking-[0.5em] text-white/70">
              USA
            </span> */}
          </Link>

          {/* Icons (right) */}
          <div className="flex items-center gap-5 text-white md:gap-7">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="transition-colors hover:text-gold-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-3.5-3.5" />
              </svg>
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden transition-colors hover:text-gold-200 sm:block"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path strokeLinecap="round" d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
              </svg>
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden transition-colors hover:text-gold-200 sm:block"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.5 4.5 13a4.5 4.5 0 0 1 7.5-4.9A4.5 4.5 0 0 1 19.5 13L12 20.5Z"
                />
              </svg>
            </Link>
            <Link
              href="/bag"
              aria-label="Bag"
              className="transition-colors hover:text-gold-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 8h12l-1 12H7L6 8Z"
                />
                <path strokeLinecap="round" d="M9 8a3 3 0 0 1 6 0" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* --- FULL-SCREEN MENU --- */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col justify-between bg-black/95 p-8 backdrop-blur-lg transition-all duration-500 ease-in-out ${
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-serif text-xl font-light tracking-[0.4em]">
            ÉLORIS
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="text-white/60 transition-colors hover:text-white"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="my-auto flex flex-col space-y-6 text-center font-serif text-3xl font-light tracking-[0.2em]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="transition-colors hover:text-gold-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center space-y-4 font-sans text-xs tracking-[0.2em] text-white/50">
          <Link
            href="/contact"
            className="hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            STORE LOCATOR
          </Link>
          <Link
            href="/about"
            className="hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            THE MAISON
          </Link>
        </div>
      </div>

      {/* --- SEARCH OVERLAY --- */}
      <div
        className={`fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-lg transition-all duration-500 ease-in-out ${
          searchOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-6 pt-28 md:px-12 md:pt-36">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-200">
              Search
            </span>
            <button
              onClick={closeSearch}
              aria-label="Close search"
              className="text-white/60 transition-colors hover:text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={searchOpen}
            placeholder="What are you looking for?"
            className="mt-8 w-full border-b border-white/30 bg-transparent pb-5 font-serif text-2xl font-light tracking-[0.05em] text-white placeholder-white/30 focus:border-gold-200 focus:outline-none md:text-4xl"
          />

          <div className="mt-10 overflow-y-auto pb-12">
            {q && results.length === 0 ? (
              <p className="font-sans text-sm tracking-[0.05em] text-white/50">
                No results for &ldquo;{query}&rdquo;. Explore{" "}
                <Link
                  href="/blog"
                  onClick={closeSearch}
                  className="text-gold-200 transition-colors hover:text-gold-100"
                >
                  the Journal
                </Link>{" "}
                instead.
              </p>
            ) : (
              <div className="space-y-1">
                {results.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    onClick={closeSearch}
                    className="group flex items-baseline justify-between border-b border-white/10 py-5 transition-colors hover:border-gold-200/40"
                  >
                    <span>
                      <span className="font-serif text-xl font-light tracking-[0.05em] text-white transition-colors group-hover:text-gold-200">
                        {r.title}
                      </span>
                      <span className="mt-1 block font-sans text-[11px] tracking-[0.2em] text-white/40">
                        {r.label}
                      </span>
                    </span>
                    <svg
                      className="h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-gold-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14m-6-6 6 6-6 6"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
