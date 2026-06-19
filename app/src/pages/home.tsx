"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Section {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

const sections: Section[] = [
  {
    id: "cast",
    title: "A CUTTING-EDGE CAST",
    subtitle: "DISCOVER THE COUNTRYSIDE",
    image: "/assets/1 (1).png",
  },
  {
    id: "category",
    title: "JEWELLERY BY CATEGORY",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (3).png",
  },
  {
    id: "collection",
    title: "JEWELLERY BY COLLECTION",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (5).png",
  },
  {
    id: "high-jewellery",
    title: "HIGH JEWELLERY",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (4).png",
  },
  {
    id: "watch",
    title: "WATCH",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (7).png",
  },
  {
    id: "brooch",
    title: "BROOCH",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (2).png",
  },
];

const galleryImages = [
  { src: "/assets/1 (2).png", alt: "Diamond earring" },
  { src: "/assets/1 (5).png", alt: "Gold chain necklace" },
  { src: "/assets/1 (6).png", alt: "Sculpted ring" },
];

/** Thin vertical three-dot indicator shown beneath each caption. */
function DotIndicator() {
  return (
    <span className="mt-4 flex flex-col items-center gap-[3px]" aria-hidden>
      <span className="h-[3px] w-[3px] rounded-full bg-white/80" />
      <span className="h-[3px] w-[3px] rounded-full bg-white/80" />
      <span className="h-[3px] w-[3px] rounded-full bg-white/80" />
    </span>
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      {/* --- HEADER --- */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled
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
          <a
            href="#"
            aria-label="Eloris home"
            className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center transition-opacity duration-300 hover:opacity-80"
          >
            <span className="font-serif text-2xl font-light tracking-[0.45em] text-white md:text-[28px]">
              ÉLORIS
            </span>
            <span className="mt-1 font-sans text-[9px] tracking-[0.5em] text-white/70">
              USA
            </span>
          </a>

          {/* Icons (right) */}
          <div className="flex items-center gap-5 text-white md:gap-7">
            <button
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
            <button
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
            </button>
            <button
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
            </button>
            <button
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
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE MENU --- */}
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

        <nav className="my-auto flex flex-col space-y-6 text-center font-serif text-2xl font-light tracking-[0.2em]">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className="transition-colors hover:text-gold-200"
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="flex flex-col items-center space-y-4 font-sans text-xs tracking-[0.2em] text-white/50">
          <a href="#" className="hover:text-white">
            MY ACCOUNT
          </a>
          <a href="#" className="hover:text-white">
            STORE LOCATOR
          </a>
        </div>
      </div>

      {/* --- FULL-SCREEN CAMPAIGN SECTIONS --- */}
      <main>
        {sections.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            className="relative flex h-screen w-full snap-start flex-col items-center justify-end overflow-hidden"
          >
            <Image
              src={section.image}
              alt={section.title}
              fill
              preload={i === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Subtle gradient so the caption stays legible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="relative z-10 flex flex-col items-center pb-16 text-center md:pb-20">
              <h2 className="font-sans text-lg font-medium uppercase tracking-[0.35em] text-white drop-shadow-sm md:text-xl">
                {section.title}
              </h2>
              <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.4em] text-white/70">
                {section.subtitle}
              </p>
              <DotIndicator />
            </div>
          </section>
        ))}

        {/* --- BOTTOM GALLERY --- */}
        <section className="grid grid-cols-1 gap-[2px] bg-[#0d0d0d] md:grid-cols-3 snap-start">
          {galleryImages.map((img) => (
            <div
              key={img.src}
              className="group relative aspect-[3/4] overflow-hidden"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          ))}
        </section>
      </main>

      {/* --- SLIM FOOTER --- */}
      <footer className="bg-black px-6 py-10 text-center md:px-12 snap-end">
        <span className="font-serif text-lg font-light tracking-[0.4em] text-white">
          ÉLORIS
        </span>
        <p className="mt-3 font-sans text-[10px] tracking-[0.2em] text-white/40">
          &copy; {new Date().getFullYear()} ELORIS USA. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
