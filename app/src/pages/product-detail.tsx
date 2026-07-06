"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { productPath, categorySlug, type Product } from "../data/products";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
import { useCurrency } from "../components/CurrencyProvider";
import ProductReviews from "../components/ProductReviews";

const VIDEO_RE = /\.(mp4|webm|mov)(\?.*)?$/i;
const isVideo = (src: string) => VIDEO_RE.test(src);

/** Renders a media URL as a Next <Image> or an autoplaying <video> by extension.
 *  Always fills its (position: relative) parent. */
function Media({
  src,
  alt,
  sizes,
  className = "",
  quality = 90,
  priority = false,
  unoptimized = false,
  controls = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  quality?: number;
  priority?: boolean;
  unoptimized?: boolean;
  controls?: boolean;
}) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        controls={controls}
        aria-label={alt || undefined}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      unoptimized={unoptimized}
      quality={quality}
      sizes={sizes}
      className={className}
    />
  );
}

/**
 * Horizontal lifestyle carousel. Trackpads scroll it natively; this adds the
 * missing mouse affordances — prev/next buttons (desktop) and wheel→horizontal
 * while hovering (releasing to the page at the ends so scrolling isn't trapped).
 */
function MediaCarousel({ items, alt }: { items: string[]; alt: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      setCanLeft(el.scrollLeft > 8);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    update();

    // Translate a vertical mouse wheel into horizontal scroll — but only when
    // this row actually overflows and isn't already at the relevant edge, so
    // the page keeps scrolling normally otherwise. Trackpad horizontal gestures
    // (deltaX-dominant) are left alone.
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd =
        Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth &&
        e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("scroll", update, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  const page = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (el)
      el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowBase =
    "absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-neutral-900 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:bg-white md:flex";

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-proximity gap-2 overflow-x-auto pb-1 md:gap-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative aspect-[3/4] w-[80%] shrink-0 snap-start overflow-hidden bg-neutral-100 sm:w-[48%] lg:w-[32%]"
          >
            <Media
              src={src}
              alt={alt}
              quality={90}
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 48vw, 32vw"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => page(-1)}
        aria-label="Previous"
        className={`${arrowBase} left-4 ${canLeft ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label="Next"
        className={`${arrowBase} right-4 ${canRight ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

/** Full-screen gallery zoom. Browse every photo (arrow buttons, ← → keys), and
 *  click an image to toggle 2× + move the mouse to pan. Esc or a tap outside
 *  closes. Videos play full-screen (no pan). */
function Lightbox({
  items,
  index,
  alt,
  onClose,
}: {
  items: string[];
  index: number;
  alt: string;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const src = items[current];
  const video = isVideo(src);
  const multiple = items.length > 1;

  const go = (dir: 1 | -1) => {
    setZoomed(false);
    setOrigin("50% 50%");
    setCurrent((c) => (c + dir + items.length) % items.length);
  };

  const goTo = (i: number) => {
    setZoomed(false);
    setOrigin("50% 50%");
    setCurrent(i);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const dir = e.key === "ArrowRight" ? 1 : -1;
        setZoomed(false);
        setOrigin("50% 50%");
        setCurrent((c) => (c + dir + items.length) % items.length);
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, items.length]);

  const navBtn =
    "absolute top-1/2 z-10 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-900";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-white p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      {multiple && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className={`${navBtn} left-6`}
          >
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className={`${navBtn} right-6`}
          >
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative h-full max-h-[90vh] w-full max-w-[90vw] overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
          if (!video) setZoomed((z) => !z);
        }}
        onMouseMove={(e) => {
          if (!zoomed) return;
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
        onMouseLeave={() => setOrigin("50% 50%")}
        style={{ cursor: video ? "default" : zoomed ? "zoom-out" : "zoom-in" }}
      >
        {video ? (
          <video
            key={src}
            src={src}
            controls
            autoPlay
            className="h-full w-full object-contain"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            sizes="90vw"
            className="object-contain transition-transform duration-200 ease-out"
            style={{
              transform: zoomed ? "scale(2)" : "scale(1)",
              transformOrigin: origin,
            }}
          />
        )}
      </div>

      {multiple && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === current}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              className={`h-0.5 w-12 transition-colors sm:w-16 ${
                i === current
                  ? "bg-neutral-900"
                  : "bg-neutral-300 hover:bg-neutral-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductDetailProps {
  product: Product;
  related: Product[];
}

export default function ProductDetail({
  product,
  related,
}: ProductDetailProps) {
  const { has, toggle } = useWishlist();
  const { add } = useCart();
  const { format } = useCurrency();
  const router = useRouter();
  const saved = has(product.slug);
  // Lead the gallery with the cover image so a lifestyle shot is never the
  // default hero, de-duplicate, and drop any image that also lives in the
  // lifestyle row (modelMedia) so the two galleries don't double up.
  const gallery = Array.from(
    new Set([
      product.image,
      ...(product.images ?? []).filter(
        (src) => !product.modelMedia.includes(src),
      ),
    ]),
  ).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addedToBag, setAddedToBag] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  // "Jewelry with model" media renders as a horizontal scroll of lifestyle
  // shots (swipe/scroll through them); banner media renders as full-width
  // banners. De-duplicate URLs so a repeated image doesn't show twice.
  const modelMedia = Array.from(new Set(product.modelMedia));
  const banners = product.bannerMedia;

  // Service imagery reuses the campaign artwork in /public/assets;
  // admin-managed media slots can replace these later.
  const services = [
    {
      title: "Book an appointment",
      text: "Whether in person or online, enjoy a personalised shopping experience at ÉLORIS.",
      image: "/assets/1 (6).png",
      href: "/contact",
    },
    {
      title: "Expert advice",
      text: "The perfect advice is always at hand with our client care advisors.",
      image: "/assets/1 (7).png",
      href: "/contact",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <section className="mx-auto max-w-[1500px] px-6 pb-12 pt-18 md:px-12">
        {/* Breadcrumb */}
        <nav className="font-sans text-[17px] font-normal leading-[31px] tracking-normal text-neutral-400">
          <Link
            href="/products"
            className="transition-colors hover:text-neutral-900"
          >
            CREATIONS
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/products/${categorySlug(product.category)}`}
            className="transition-colors hover:text-neutral-900"
          >
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-600">{product.name}</span>
        </nav>

        <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* Gallery — large image (click to zoom) with clickable thumbnails
              below it. The main image is served unoptimized (the hero is the
              focal selling surface, so we skip re-compression / upscaling). */}
          <div>
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
              {gallery.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  aria-hidden={i !== activeIndex}
                  className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
                    i === activeIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Media
                    src={src}
                    alt={product.name}
                    priority={i === 0}
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center"
                  />
                </div>
              ))}

              {/* Click anywhere on the image to open the full-screen zoom. */}
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                aria-label="Zoom image"
                className="absolute inset-0 z-10 cursor-zoom-in"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow ring-1 ring-black/5"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
                </svg>
              </span>
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={`thumb-${src}-${i}`}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-label={`View photo ${i + 1}`}
                    aria-current={i === activeIndex}
                    className="relative aspect-square overflow-hidden bg-neutral-100"
                  >
                    <Media
                      src={src}
                      alt=""
                      sizes="(max-width: 768px) 25vw, 12vw"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info — sticks in view while the taller gallery scrolls past. */}
          <div className="flex flex-col md:sticky md:top-24 md:self-start">
            {/* Category pill — connecting line — wishlist */}
            <div className="flex items-center">
              <span className="inline-flex shrink-0 items-center rounded-full bg-neutral-900 px-5 py-2 font-sans text-[16px] font-normal lowercase leading-none tracking-normal text-white">
                {product.category}
              </span>
              <span className="h-px flex-1 bg-neutral-500" aria-hidden />
              <button
                type="button"
                onClick={() =>
                  toggle({
                    slug: product.slug,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    category: product.category,
                  })
                }
                aria-pressed={saved}
                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                className="flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-[13px] bg-neutral-900 text-white transition-colors hover:bg-neutral-700"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill={saved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20.5 4.5 13a4.5 4.5 0 0 1 7.5-4.9A4.5 4.5 0 0 1 19.5 13L12 20.5Z"
                  />
                </svg>
              </button>
            </div>

            <h1 className="mt-7 font-display text-[45px] font-normal leading-none tracking-normal">
              {product.name}
            </h1>
            <p className="mt-4 font-sans text-[13px] leading-relaxed tracking-[0.05em] text-neutral-500">
              {product.tagline}
            </p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-2xl font-medium tracking-[0.04em] text-neutral-900">
                {format(product.price)}
              </span>
              <span className="font-sans text-[10px] tracking-[0.15em] text-neutral-400">
                Including Taxes
              </span>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  add(
                    {
                      slug: product.slug,
                      name: product.name,
                      image: product.image,
                      price: product.price,
                      material: product.materials?.[0] ?? "",
                    },
                    1,
                  );
                  setAddedToBag(true);
                  router.push("/bag");
                }}
                className="bg-neutral-900 px-10 py-4 text-center font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700 disabled:opacity-60"
              >
                {addedToBag
                  ? "ADDED — VIEW BAG"
                  : "CONTACT US TO MAKE A PURCHASE"}
              </button>
              <Link
                href="/contact"
                className="border border-neutral-900 px-10 py-4 text-center font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                REQUEST ASSISTANCE
              </Link>
            </div>

            {/* Description */}
            <div className="mt-12 space-y-5 border-t border-neutral-200 pt-10">
              {product.description.map((para, i) => (
                <p
                  key={i}
                  className="font-sans text-[15px] leading-loose tracking-[0.03em] text-neutral-600"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Details */}
            <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-4 border-t border-neutral-200 pt-10 sm:grid-cols-2">
              {product.details.map((d) => (
                <div
                  key={d.label}
                  className="flex justify-between border-b border-neutral-200 pb-3"
                >
                  <dt className="font-sans text-[11px] tracking-[0.2em] text-neutral-400">
                    {d.label}
                  </dt>
                  <dd className="font-sans text-[12px] tracking-[0.08em] text-neutral-700">
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Lifestyle row — "jewelry with model" media as a horizontal carousel
          (trackpad swipe, mouse wheel, or the desktop arrow buttons). */}
      {modelMedia.length > 0 && (
        <section className="pb-2">
          <div className="mx-auto max-w-[1500px] px-6 md:px-12">
            <MediaCarousel items={modelMedia} alt={product.name} />
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-[1500px] px-6 md:px-12">
            <h2 className="font-serif text-2xl font-medium tracking-[0.02em] md:text-3xl">
              You may also like
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={productPath(p)}
                  className="group block bg-neutral-100 p-6"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      quality={100}
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-5 font-sans text-[13px] font-normal leading-relaxed tracking-[0.04em] text-neutral-800">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 font-sans text-[12px] tracking-[0.05em] text-neutral-500">
                    {format(p.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full-width banners — dedicated banner media (photos + videos) */}
      {banners.map((src, i) => (
        <section
          key={`${src}-${i}`}
          className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]"
        >
          <Media
            src={src}
            alt={product.name}
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
        </section>
      ))}

      {/* Exclusive ÉLORIS services */}
      <section className="py-20">
        <div className="mx-auto max-w-[1500px] px-6 md:px-12">
          <h2 className="font-display text-[30px] font-normal leading-none">
            Exclusive Eloris services
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-y-0">
          {services.map((s) => (
            <Link key={s.title} href={s.href} className="group block">
              <div className="relative aspect-[6/5] overflow-hidden bg-neutral-100">
                <Image
                  src={s.image}
                  alt=""
                  fill
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="px-6 md:px-12">
                <h3 className="mt-6 font-display text-[25px] font-normal leading-none tracking-normal">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-md font-sans text-[20px] font-normal leading-none tracking-normal text-neutral-500">
                  {s.text}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <ProductReviews slug={product.slug} />

      <Footer />

      {zoomOpen && (
        <Lightbox
          items={gallery}
          index={activeIndex}
          alt={product.name}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}
