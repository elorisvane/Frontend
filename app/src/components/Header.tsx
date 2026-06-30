"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
// The header search runs on the client. It starts from the bundled catalogue
// (instant, offline-safe) and, the first time search is opened, swaps in the
// live catalogue from Supabase so results match the current store.
import { getPosts, fallbackPosts, type Post } from "../data/posts";
import {
  getProducts,
  fallbackProducts,
  productPath,
  type Product,
} from "../data/products";
// The category mega-menu is managed in the Admin app ("Menu & categories") and
// stored in Supabase. We start from the bundled fallback (instant, offline-safe)
// and swap in the live menu on mount so the bar reflects the admin directly.
import { getNavCategories, fallbackNav, type MegaSection } from "../data/nav";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";

interface HeaderProps {
  /** When true the header starts transparent over a hero and darkens on scroll.
   *  When false (default for inner pages) it stays solid for legibility. */
  transparent?: boolean;
  /** When true the header uses a light background and dark text. */
  light?: boolean;
}

export default function Header({
  transparent = false,
  light = false,
}: HeaderProps) {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  // The hamburger opens the category mega-menu as a dropdown under the header.
  const [menuOpen, setMenuOpen] = useState(false);
  // Category mega-menu: bundled fallback until the live admin menu is fetched.
  const [sections, setSections] = useState<MegaSection[]>(fallbackNav);
  // Which tab's tiles the open mega-menu is showing.
  const [activeTab, setActiveTab] = useState<string>(fallbackNav[0].id);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Searchable catalogue: bundled fallback until the live data is fetched.
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [posts, setPosts] = useState<Post[]>(fallbackPosts);
  const catalogLoaded = useRef(false);
  const navLoaded = useRef(false);
  // The bag count comes from localStorage, which isn't available during SSR.
  // Render the badge only after mount so the server/client markup matches.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Load the live catalogue once, the first time the shopper opens search.
  useEffect(() => {
    if (!searchOpen || catalogLoaded.current) return;
    catalogLoaded.current = true;
    let active = true;
    Promise.all([getProducts(), getPosts()])
      .then(([liveProducts, livePosts]) => {
        if (!active) return;
        setProducts(liveProducts);
        setPosts(livePosts);
      })
      .catch(() => {
        // Keep the bundled fallback if the fetch fails.
      });
    return () => {
      active = false;
    };
  }, [searchOpen]);

  // Load the live category menu (managed in the Admin app) once on mount, then
  // swap it in over the bundled fallback.
  useEffect(() => {
    if (navLoaded.current) return;
    navLoaded.current = true;
    let active = true;
    getNavCategories()
      .then((live) => {
        if (!active || live.length === 0) return;
        setSections(live);
        setActiveTab(live[0].id);
      })
      .catch(() => {
        // Keep the bundled fallback if the fetch fails.
      });
    return () => {
      active = false;
    };
  }, []);

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

  // Close the mega-menu on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  const solid = !transparent || isScrolled;
  // The header reads "light" (white background, dark content) on inner pages and
  // whenever the mega-menu is open, so the dropdown stays legible over the hero.
  const lightActive = light || menuOpen;
  const activeSection = sections.find((s) => s.id === activeTab) ?? sections[0];

  function toggleMenu() {
    // Always reopen on the first tab so it reads top-to-bottom each time.
    if (!menuOpen) setActiveTab(sections[0].id);
    setMenuOpen((open) => !open);
  }

  const q = query.trim().toLowerCase();
  const results = q
    ? [
        ...products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.tagline.toLowerCase().includes(q),
          )
          .map((p) => ({
            href: productPath(p),
            title: p.name,
            label: p.category,
          })),
        ...posts
          .filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.excerpt.toLowerCase().includes(q),
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
          menuOpen
            ? "bg-white text-neutral-900 py-4"
            : light
              ? "bg-white/95 text-neutral-900 border-b border-neutral-100 py-4 shadow-xs"
              : solid
                ? "bg-black/70 text-white py-4 backdrop-blur-md"
                : "bg-gradient-to-b from-black/30 to-transparent text-white py-6"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 md:px-12">
          {/* Hamburger (left) — toggles the category mega-menu */}
          <button
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mega-menu"
            className="transition-opacity hover:opacity-70 focus:outline-none"
          >
            <Image
              src="/logo/menu-hamburger.svg"
              alt=""
              width={30}
              height={30}
              // Icon art is solid black; invert it to white over the dark/transparent header.
              className={`h-6 w-6 ${lightActive ? "" : "invert"}`}
              aria-hidden
            />
          </button>

          {/* Wordmark (center) */}
          <Link
            href="/"
            aria-label="Eloris home"
            className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center transition-opacity duration-300 hover:opacity-80"
          >
            <Image
              src="/logo/logo.svg"
              alt="ÉLORIS"
              width={158}
              height={47}
              priority
              // Logo art is solid black; invert it to white over the dark/transparent header.
              className={`h-10 w-auto md:h-8 ${lightActive ? "" : "invert"}`}
            />
          </Link>

          {/* Icons (right) */}
          <div
            className={`flex items-center gap-5 md:gap-7 ${lightActive ? "text-neutral-900" : "text-white"}`}
          >
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={`transition-colors ${lightActive ? "hover:text-gold-500" : "hover:text-gold-200"}`}
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
              className={`hidden transition-colors sm:block ${lightActive ? "hover:text-gold-500" : "hover:text-gold-200"}`}
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
              aria-label={`Wishlist${mounted && wishlistCount > 0 ? ` (${wishlistCount})` : ""}`}
              className={`relative hidden transition-colors sm:block ${lightActive ? "hover:text-gold-500" : "hover:text-gold-200"}`}
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
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 font-sans text-[9px] font-medium leading-none text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/bag"
              aria-label={`Bag${mounted && count > 0 ? ` (${count})` : ""}`}
              className={`relative transition-colors ${lightActive ? "hover:text-gold-500" : "hover:text-gold-200"}`}
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
              {mounted && count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 font-sans text-[9px] font-medium leading-none text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* --- CATEGORY MEGA-MENU (drops down from the hamburger) ---
              The grid 0fr→1fr trick animates the height from 0 to auto so the
              white panel slides open beneath the bar, leaving the hero visible. */}
        <div
          id="mega-menu"
          role="region"
          aria-label="Categories"
          className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
            menuOpen
              ? "grid-rows-[1fr] opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mx-auto max-w-[1600px] px-6 pb-12 pt-7 md:px-12">
              {/* Tabs */}
              <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-12">
                {sections.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onMouseEnter={() => setActiveTab(tab.id)}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative pb-2 font-sans text-[12px] uppercase tracking-[0.15em] transition-colors ${
                        active
                          ? "text-neutral-900"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      {tab.label}
                      {active && (
                        <span className="absolute inset-x-0 -bottom-px h-px bg-neutral-900" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Tiles for the active tab. A category with no tiles (managed in
                  the admin) simply links through to its own page. */}
              {activeSection.tiles.length > 0 ? (
                <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-8">
                  {activeSection.tiles.map((tile, i) => (
                    <Link
                      key={`${tile.label}-${i}`}
                      href={tile.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex w-[140px] flex-col items-center md:w-[165px]"
                    >
                      <span className="relative aspect-square w-full overflow-hidden bg-neutral-200">
                        {tile.image && (
                          <Image
                            src={tile.image}
                            alt={tile.label}
                            fill
                            sizes="165px"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        )}
                      </span>
                      <span className="mt-4 text-center font-sans text-[12px] uppercase tracking-[0.08em] text-neutral-800 transition-colors group-hover:text-neutral-500">
                        {tile.label}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-10 flex justify-center">
                  <Link
                    href={activeSection.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-sans text-[12px] uppercase tracking-[0.2em] text-neutral-700 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
                  >
                    View all
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click-away backdrop: closes the mega-menu when the hero is clicked.
            Sits below the header so the bar and dropdown stay interactive. */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* --- SEARCH OVERLAY --- */}
      <div
        className={`fixed inset-0 z-[70] flex flex-col bg-black text-white backdrop-blur-lg transition-all duration-500 ease-in-out ${
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
