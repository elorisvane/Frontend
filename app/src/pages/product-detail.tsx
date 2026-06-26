"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { Product } from "../data/products";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";

interface ProductDetailProps {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: ProductDetailProps) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const saved = has(product.slug);
  const gallery = (
    product.images?.length ? product.images : [product.image]
  ).filter(Boolean);
  const [material, setMaterial] = useState(product.materials[0] ?? "");
  const [activeImage, setActiveImage] = useState(gallery[0] ?? product.image);
  const [added, setAdded] = useState(false);

  function handleAddToBag() {
    add({
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      material,
    });
    setAdded(true);
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <section className="mx-auto max-w-[1500px] px-6 pb-24 pt-32 md:px-12 md:pt-40">
        {/* Breadcrumb */}
        <nav className="font-sans text-[10px] tracking-[0.25em] text-neutral-400">
          <Link href="/products" className="transition-colors hover:text-neutral-900">
            CREATIONS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-600">{product.category}</span>
        </nav>

        <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                // Serve the original file untouched: the hero photo is the focal
                // selling surface, so we skip the optimizer (no re-compression
                // and no crop-upscaling when a wide photo sits in this tall 4:5
                // frame) for the crispest possible result.
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveImage(src)}
                    aria-label={`View photo ${i + 1}`}
                    className={`relative aspect-square overflow-hidden bg-neutral-100 transition-opacity ${
                      activeImage === src
                        ? "ring-1 ring-neutral-900"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      quality={100}
                      sizes="(max-width: 768px) 20vw, 10vw"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <span className="font-sans text-[10px] tracking-[0.4em] text-neutral-500">
              {product.category}
            </span>
            <h1 className="mt-4 font-serif text-3xl font-light leading-tight tracking-[0.04em] md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
              {product.tagline}
            </p>
            <p className="mt-6 font-serif text-2xl font-light tracking-[0.05em] text-neutral-800">
              {product.price}
            </p>

            {/* Material selector */}
            <div className="mt-10">
              <span className="font-sans text-[11px] tracking-[0.3em] text-neutral-700">
                MATERIAL
              </span>
              <div className="mt-4 flex flex-wrap gap-3">
                {product.materials.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMaterial(m)}
                    className={`border px-5 py-2 font-sans text-[11px] tracking-[0.15em] transition-colors ${
                      material === m
                        ? "border-neutral-900 text-neutral-900"
                        : "border-neutral-300 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleAddToBag}
                className="flex-1 bg-neutral-900 px-10 py-4 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700"
              >
                {added ? "ADDED TO BAG" : "ADD TO BAG"}
              </button>
              <Link
                href="/contact"
                className="flex-1 border border-neutral-900 px-10 py-4 text-center font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                BOOK AN APPOINTMENT
              </Link>
            </div>

            {/* Wishlist */}
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
              className={`mt-6 flex items-center gap-2.5 font-sans text-[11px] tracking-[0.3em] transition-colors ${
                saved
                  ? "text-gold-600"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
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
              {saved ? "SAVED TO WISHLIST" : "SAVE TO WISHLIST"}
            </button>

            {added && (
              <p className="mt-5 font-sans text-[11px] tracking-[0.15em] text-neutral-600">
                {product.name} ({material}) has been added to your bag.{" "}
                <Link href="/bag" className="underline underline-offset-4">
                  View bag
                </Link>
              </p>
            )}

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

      {/* Related */}
      <section className="border-t border-neutral-200 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1500px]">
          <h2 className="text-center font-sans text-xs font-medium tracking-[0.35em] text-neutral-700">
            YOU MAY ALSO LIKE
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-3">
            {related.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="group">
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    quality={100}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <span className="mt-4 block font-sans text-[10px] tracking-[0.35em] text-neutral-500">
                  {p.category}
                </span>
                <h3 className="mt-2 font-serif text-xl font-light leading-snug tracking-[0.04em]">
                  {p.name}
                </h3>
                <p className="mt-2 font-sans text-[12px] tracking-[0.15em] text-neutral-600">
                  {p.price}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
