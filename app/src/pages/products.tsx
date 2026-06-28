"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { productPath, type Product } from "../data/products";
import { MediaFill } from "../components/MediaFill";
import type { MediaSlot } from "../data/home";

// Maps filter checkbox category to product.category in the data
const getFilterCategory = (prodCategory: string): string => {
  const cat = prodCategory.toUpperCase();
  if (cat === "HIGH JEWELLERY") return "Necklace";
  if (cat === "BRACELETS") return "Bracelet";
  if (cat === "EARRINGS") return "Earring";
  if (cat === "BROOCHES") return "Brooch";
  if (cat === "WATCHES") return "Watch";
  if (cat === "RINGS") return "Ring";
  return cat;
};

// Checks if product belongs to a collection based on substring match
const matchesCollection = (prodName: string, collection: string): boolean => {
  const normName = prodName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const normColl = collection
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return normName.includes(normColl);
};

export default function Products({
  products,
  activeCategory,
  heroMedia,
  gridMedia,
}: {
  products: Product[];
  /** When set (category route), the grid is pre-filtered to this category. */
  activeCategory?: string;
  /** Admin-managed top hero banner (image or video); falls back to bundled art. */
  heroMedia?: MediaSlot | null;
  /** Admin-managed in-grid lifestyle banner (image or video). */
  gridMedia?: MediaSlot | null;
}) {
  // --- STATE ---
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    activeCategory ? [activeCategory] : [],
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [availableOnline, setAvailableOnline] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "feed">("grid");

  // Accordion open/close states
  const [categoryOpen, setCategoryOpen] = useState<boolean>(true);
  const [collectionOpen, setCollectionOpen] = useState<boolean>(true);

  // --- PRODUCT LIST ---
  // Show the real admin-managed catalogue as-is (no mock duplication), so the
  // storefront count always matches the Admin's product count.
  const allProducts = useMemo(() => {
    return products.map((p) => ({
      ...p,
      id: p.slug,
      availableOnline: parseFloat(p.price.replace(/[^0-9.]/g, "")) < 45000,
    }));
  }, [products]);

  // --- FILTER & SORT CALCULATION ---
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category & Collection Filters (combined to match the mockup's duplicate selection logic)
    const activeCats = [...selectedCategories, ...selectedCollections];
    if (activeCats.length > 0) {
      result = result.filter((p) => {
        const mappedCat = getFilterCategory(p.category);
        return activeCats.includes(mappedCat);
      });
    }

    // Online Availability Filter (mocked: items under $45k)
    if (availableOnline) {
      result = result.filter((p) => p.availableOnline);
    }

    // Sort By
    const getPriceValue = (priceStr: string) =>
      parseFloat(priceStr.replace(/[^0-9.]/g, ""));
    if (sortBy === "low-to-high") {
      result.sort((a, b) => getPriceValue(a.price) - getPriceValue(b.price));
    } else if (sortBy === "high-to-low") {
      result.sort((a, b) => getPriceValue(b.price) - getPriceValue(a.price));
    }

    return result;
  }, [
    allProducts,
    selectedCategories,
    selectedCollections,
    availableOnline,
    sortBy,
  ]);

  // --- ASYMMETRICAL GRID LAYOUT FORMATTER ---
  // Inserts a large double-span lifestyle card inside the grid at index 8
  const gridItems = useMemo(() => {
    const items = [...filteredProducts];
    if (items.length >= 8) {
      items.splice(8, 0, { isBanner: true, id: "lifestyle-banner" } as any);
    } else if (items.length >= 4) {
      items.splice(items.length, 0, {
        isBanner: true,
        id: "lifestyle-banner",
      } as any);
    }
    return items;
  }, [filteredProducts]);

  // --- FILTER HANDLERS ---
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleCollectionToggle = (collection: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((c) => c !== collection)
        : [...prev, collection],
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedCollections([]);
    setAvailableOnline(false);
    setSortBy("recommended");
  };

  // Keep the grid in sync with the category route (/products/<category>): when
  // the active category changes, reset the filter to it.
  useEffect(() => {
    setSelectedCategories(activeCategory ? [activeCategory] : []);
    setSelectedCollections([]);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      {/* Light header overlay */}
      <Header light />

      {/* --- HERO CAMPAIGN BANNER --- */}
      <div className="relative mt-[53px] h-[300px] w-full overflow-hidden bg-neutral-100 md:h-[522px]">
        <MediaFill
          media={heroMedia}
          fallbackSrc="/assets/1 (1).png"
          alt="Eloris Creations"
          priority
          sizes="100vw"
          className="object-center"
        />
      </div>

      {/* --- MAIN PAGE SECTION --- */}
      <main className="mx-auto max-w-[1600px] px-6 py-12 md:px-12 md:py-20">
        {/* --- TOP CONTROL BAR --- */}
        <div className="flex items-end justify-between border-b border-neutral-200 pb-5 md:gap-10">
          {/* Breadcrumb (aligns above the sidebar on desktop) */}
          <nav className="hidden min-w-[240px] shrink-0 whitespace-nowrap text-[12px] tracking-[0.2em] text-neutral-400 md:block">
            <span className="cursor-pointer hover:text-neutral-900">Home</span>
            <span className="mx-2">|</span>
            <span className="cursor-pointer hover:text-neutral-900">
              High Jewelry
            </span>
            <span className="mx-2">|</span>
            <span className="font-medium text-neutral-900">All creations</span>
          </nav>

          {/* Count + view controls (aligns above the grid on desktop) */}
          <div className="flex flex-1 items-center justify-between">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "Model" : "Models"}
            </span>

            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-2 border border-neutral-200 px-4 py-2 font-sans text-[10px] font-semibold tracking-[0.15em] text-neutral-700 hover:bg-neutral-50 md:hidden"
            >
              FILTER & SORT
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {/* GRID / FEED view toggle */}
              <div className="flex items-center gap-5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 transition-colors ${
                    viewMode === "grid"
                      ? "text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                  aria-pressed={viewMode === "grid"}
                >
                  GRID
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("feed")}
                  className={`flex items-center gap-2 transition-colors ${
                    viewMode === "feed"
                      ? "text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                  aria-pressed={viewMode === "feed"}
                >
                  FEED
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center border transition-colors ${
                      viewMode === "feed"
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-400"
                    }`}
                  >
                    {viewMode === "feed" && (
                      <svg
                        className="h-2.5 w-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5 13 4 4 10-10"
                        />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-10 md:flex-row">
          {/* --- SIDEBAR FILTERS (DESKTOP) --- */}
          <aside className="hidden w-[240px] shrink-0 md:block">
            {/* Sort options */}
            <div className="border-b border-neutral-100 pb-6">
              <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-800">
                SHORT BY
              </h3>
              <div className="mt-4 space-y-3 font-sans text-[11px] tracking-[0.1em] text-neutral-600">
                <label className="flex items-center gap-3 cursor-pointer hover:text-neutral-900">
                  <input
                    type="radio"
                    name="sortBy"
                    checked={sortBy === "low-to-high"}
                    onChange={() => setSortBy("low-to-high")}
                    className="h-3.5 w-3.5 appearance-none border border-neutral-300 rounded-full checked:bg-gold-500 checked:border-gold-500 checked:after:content-[''] checked:after:h-1.5 checked:after:w-1.5 checked:after:bg-white checked:after:rounded-full checked:after:block checked:after:m-auto transition-all focus:outline-none flex items-center justify-center"
                  />
                  PRICE LOW TO HIGH
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-neutral-900">
                  <input
                    type="radio"
                    name="sortBy"
                    checked={sortBy === "high-to-low"}
                    onChange={() => setSortBy("high-to-low")}
                    className="h-3.5 w-3.5 appearance-none border border-neutral-300 rounded-full checked:bg-gold-500 checked:border-gold-500 checked:after:content-[''] checked:after:h-1.5 checked:after:w-1.5 checked:after:bg-white checked:after:rounded-full checked:after:block checked:after:m-auto transition-all focus:outline-none flex items-center justify-center"
                  />
                  PRICE HIGH TO LOW
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-neutral-900">
                  <input
                    type="radio"
                    name="sortBy"
                    checked={sortBy === "recommended"}
                    onChange={() => setSortBy("recommended")}
                    className="h-3.5 w-3.5 appearance-none border border-neutral-300 rounded-full checked:bg-gold-500 checked:border-gold-500 checked:after:content-[''] checked:after:h-1.5 checked:after:w-1.5 checked:after:bg-white checked:after:rounded-full checked:after:block checked:after:m-auto transition-all focus:outline-none flex items-center justify-center"
                  />
                  RECOMMENDED
                </label>
              </div>
            </div>

            {/* Filter availability */}
            <div className="mt-6 border-b border-neutral-100 pb-6">
              <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-800">
                FILTER BY
              </h3>
              <div className="mt-4 font-sans text-[11px] tracking-[0.1em] text-neutral-600">
                <label className="flex items-center gap-3 cursor-pointer hover:text-neutral-900">
                  <input
                    type="checkbox"
                    checked={availableOnline}
                    onChange={(e) => setAvailableOnline(e.target.checked)}
                    className="h-3.5 w-3.5 appearance-none border border-neutral-300 rounded-xs checked:bg-gold-500 checked:border-gold-500 checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-white checked:after:flex checked:after:items-center checked:after:justify-center transition-all focus:outline-none"
                  />
                  AVAILABLE ONLINE
                </label>
              </div>
            </div>

            {/* Accordion: Category */}
            <div className="mt-6 border-b border-neutral-100 pb-6">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex w-full items-center justify-between font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-800"
              >
                <span>CATEGORY</span>
                <svg
                  className={`h-3 w-3 transform transition-transform duration-300 ${
                    categoryOpen ? "" : "rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {categoryOpen && (
                <div className="mt-4 space-y-3 font-sans text-[11px] tracking-[0.1em] text-neutral-600 transition-all">
                  {[
                    "NECKLACE",
                    "BRACELET",
                    "EARRING",
                    "BROOCH",
                    "WATCH",
                    "RING",
                  ].map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-3 cursor-pointer hover:text-neutral-900"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="h-3.5 w-3.5 appearance-none border border-neutral-300 rounded-xs checked:bg-gold-500 checked:border-gold-500 checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-white checked:after:flex checked:after:items-center checked:after:justify-center transition-all focus:outline-none"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion: Collection */}
            <div className="mt-6 border-b border-neutral-100 pb-6">
              <button
                onClick={() => setCollectionOpen(!collectionOpen)}
                className="flex w-full items-center justify-between font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-800"
              >
                <span>COLLECTION</span>
                <svg
                  className={`h-3 w-3 transform transition-transform duration-300 ${
                    collectionOpen ? "" : "rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {collectionOpen && (
                <div className="mt-4 space-y-3 font-sans text-[11px] tracking-[0.1em] text-neutral-600 transition-all">
                  {[
                    "NECKLACE",
                    "BRACELET",
                    "EARRING",
                    "BROOCH",
                    "WATCH",
                    "RING",
                  ].map((coll) => (
                    <label
                      key={coll}
                      className="flex items-center gap-3 cursor-pointer hover:text-neutral-900"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(coll)}
                        onChange={() => handleCollectionToggle(coll)}
                        className="h-3.5 w-3.5 appearance-none border border-neutral-300 rounded-xs checked:bg-gold-500 checked:border-gold-500 checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-white checked:after:flex checked:after:items-center checked:after:justify-center transition-all focus:outline-none"
                      />
                      {coll}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Clear All */}
            {(selectedCategories.length > 0 ||
              selectedCollections.length > 0 ||
              availableOnline ||
              sortBy !== "recommended") && (
              <button
                onClick={clearAllFilters}
                className="mt-8 text-[10px] font-sans font-medium tracking-[0.2em] text-gold-500 hover:text-gold-600 hover:underline focus:outline-none uppercase"
              >
                Reset Filters
              </button>
            )}
          </aside>

          {/* --- MAIN PRODUCT CATALOG --- */}
          <div className="flex-1">
            {/* Empty state */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="font-serif text-2xl font-light text-neutral-400 italic">
                  No creations match your selection
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 border border-neutral-900 px-6 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all"
                >
                  View All Creations
                </button>
              </div>
            ) : (
              /* Asymmetric Grid */
              <div
                className={`grid auto-rows-fr grid-flow-row-dense grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 ${
                  viewMode === "feed" ? "lg:grid-cols-2" : "lg:grid-cols-4"
                }`}
              >
                {gridItems.map((item: any, index) => {
                  // Rendering the custom Asymmetric Grid Lifestyle Banner Card
                  if (item.isBanner) {
                    return (
                      <div
                        key={item.id}
                        className={`group relative col-span-1 flex min-h-[360px] flex-col justify-end overflow-hidden bg-neutral-100 sm:col-span-2 ${
                          viewMode === "feed"
                            ? "lg:col-span-2"
                            : "sm:row-span-2 lg:col-start-3 lg:col-span-2"
                        }`}
                      >
                        <MediaFill
                          media={gridMedia}
                          fallbackSrc="/assets/1 (1).png"
                          alt="Maison Eloris Campaign"
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                        />
                        {/* Elegant overlay scrim */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />

                        <div className="relative z-10 p-8 text-white">
                          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/90">
                            {gridMedia?.subtitle || "The Maison"}
                          </p>
                          <h3 className="mt-3 font-serif text-3xl font-light tracking-[0.05em] leading-snug">
                            {gridMedia?.title || "Savoir-Faire & Artistry"}
                          </h3>
                          <div className="mt-4 h-[1px] w-12 bg-white/60" />
                        </div>
                      </div>
                    );
                  }

                  // Normal Product Card
                  return (
                    <Link
                      key={item.id}
                      href={productPath(item)}
                      className="group flex h-full flex-col justify-between text-center"
                    >
                      <div>
                        {/* Aspect block for standard square/rectangular card */}
                        <div className="relative aspect-square overflow-hidden bg-neutral-50">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            quality={90}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </div>
                        <h2 className="mt-5 text-center font-sans text-[20px] font-normal leading-[23px] tracking-normal text-neutral-800 transition-colors group-hover:text-neutral-500">
                          {item.name}
                        </h2>
                        <p className="mt-2 text-center font-sans text-[14px] font-light leading-[23px] tracking-normal text-neutral-400">
                          {item.tagline}
                        </p>
                      </div>
                      <p className="mt-3 text-center font-sans text-[14px] font-light leading-[23px] tracking-normal text-neutral-700">
                        {item.price}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MOBILE SLIDE-OVER DRAWER --- */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Scrim background */}
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer content */}
          <div className="relative ml-auto flex h-full w-full max-w-[320px] flex-col bg-white p-6 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-800">
                Filters &amp; Sort
              </span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-neutral-500 hover:text-neutral-900"
                aria-label="Close filters"
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
                    strokeWidth="1.5"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Sort Options (mobile) */}
            <div className="mt-6 border-b border-neutral-100 pb-6">
              <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                SHORT BY
              </h4>
              <div className="mt-4 space-y-3 font-sans text-xs tracking-wider text-neutral-600">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="sortByMobile"
                    checked={sortBy === "low-to-high"}
                    onChange={() => setSortBy("low-to-high")}
                    className="h-3.5 w-3.5 border-neutral-300 text-gold-500 focus:ring-gold-500"
                  />
                  PRICE LOW TO HIGH
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="sortByMobile"
                    checked={sortBy === "high-to-low"}
                    onChange={() => setSortBy("high-to-low")}
                    className="h-3.5 w-3.5 border-neutral-300 text-gold-500 focus:ring-gold-500"
                  />
                  PRICE HIGH TO LOW
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="sortByMobile"
                    checked={sortBy === "recommended"}
                    onChange={() => setSortBy("recommended")}
                    className="h-3.5 w-3.5 border-neutral-300 text-gold-500 focus:ring-gold-500"
                  />
                  RECOMMENDED
                </label>
              </div>
            </div>

            {/* Filter Online Availability (mobile) */}
            <div className="mt-6 border-b border-neutral-100 pb-6">
              <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                FILTER BY
              </h4>
              <div className="mt-4 font-sans text-xs tracking-wider text-neutral-600">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnline}
                    onChange={(e) => setAvailableOnline(e.target.checked)}
                    className="h-4 w-4 border-neutral-300 rounded checked:bg-gold-500 checked:border-gold-500 text-gold-500 focus:ring-gold-500"
                  />
                  AVAILABLE ONLINE
                </label>
              </div>
            </div>

            {/* Category checkboxes (mobile) */}
            <div className="mt-6 border-b border-neutral-100 pb-6">
              <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                CATEGORY
              </h4>
              <div className="mt-4 space-y-3 font-sans text-xs tracking-wider text-neutral-600">
                {[
                  "NECKLACE",
                  "BRACELET",
                  "EARRING",
                  "BROOCH",
                  "WATCH",
                  "RING",
                ].map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className="h-4 w-4 border-neutral-300 rounded checked:bg-gold-500 checked:border-gold-500 text-gold-500 focus:ring-gold-500"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Collection checkboxes (mobile) */}
            <div className="mt-6 border-b border-neutral-100 pb-6">
              <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                COLLECTION
              </h4>
              <div className="mt-4 space-y-3 font-sans text-xs tracking-wider text-neutral-600">
                {[
                  "NECKLACE",
                  "BRACELET",
                  "EARRING",
                  "BROOCH",
                  "WATCH",
                  "RING",
                ].map((coll) => (
                  <label
                    key={coll}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(coll)}
                      onChange={() => handleCollectionToggle(coll)}
                      className="h-4 w-4 border-neutral-300 rounded checked:bg-gold-500 checked:border-gold-500 text-gold-500 focus:ring-gold-500"
                    />
                    {coll}
                  </label>
                ))}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-neutral-900 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 text-center"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full border border-neutral-200 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600 hover:bg-neutral-50 text-center"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Dark Footer */}
      <Footer />
    </div>
  );
}
