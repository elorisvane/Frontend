"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { productPath, categorySlug, type Product } from "../data/products";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
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
  const router = useRouter();
  const saved = has(product.slug);
  const gallery = (
    product.images?.length ? product.images : [product.image]
  ).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addedToBag, setAddedToBag] = useState(false);

  // Auto-advance the hero gallery through the jewelry photos/videos.
  useEffect(() => {
    if (gallery.length <= 1) return;
    const id = setInterval(
      () => setActiveIndex((i) => (i + 1) % gallery.length),
      4000,
    );
    return () => clearInterval(id);
  }, [gallery.length]);

  // "Jewelry with model" media fills the lifestyle row; banner media renders as
  // full-width banners.
  const modelTrio = product.modelMedia;
  const banners = product.bannerMedia;
  const trioColsClass =
    modelTrio.length >= 3
      ? "md:grid-cols-3"
      : modelTrio.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-1";

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
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
              {/* Auto-advancing crossfade carousel of the jewelry photos/videos.
                  The cover is served unoptimized (the hero is the focal selling
                  surface, so we skip re-compression / crop-upscaling). */}
              {gallery.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  aria-hidden={i !== activeIndex}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
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

              {/* Progress dots */}
              {gallery.length > 1 && (
                <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
                  {gallery.map((src, i) => (
                    <button
                      key={`dot-${src}-${i}`}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-label={`View photo ${i + 1}`}
                      aria-current={i === activeIndex}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeIndex
                          ? "w-5 bg-neutral-900"
                          : "w-1.5 bg-neutral-900/40 hover:bg-neutral-900/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
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
                {product.price}
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

      {/* Lifestyle row — "jewelry with model" media (first three) */}
      {modelTrio.length > 0 && (
        <section className="px-2 pb-2 md:px-3">
          <div className={`grid grid-cols-1 gap-2 md:gap-3 ${trioColsClass}`}>
            {modelTrio.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative aspect-[3/4] overflow-hidden bg-neutral-100"
              >
                <Media
                  src={src}
                  alt={product.name}
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1500px]">
            <h2 className="font-serif text-2xl font-medium tracking-[0.02em] md:text-3xl">
              You may also like
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {related.map((p) => (
                <Link key={p.slug} href={productPath(p)} className="group">
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      quality={100}
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-base font-medium leading-snug tracking-[0.03em]">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 font-sans text-[12px] tracking-[0.12em] text-neutral-600">
                    {p.price}
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
    </div>
  );
}
