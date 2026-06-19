"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getProduct, products } from "../data/products";

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const product = getProduct(slug);
  if (!product) notFound();

  const [material, setMaterial] = useState(product.materials[0]);
  const [added, setAdded] = useState(false);

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  function handleAddToBag() {
    // Placeholder — wire up to a cart store / API to persist the selection.
    setAdded(true);
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header />

      <section className="mx-auto max-w-[1500px] px-6 pb-24 pt-32 md:px-12 md:pt-40">
        {/* Breadcrumb */}
        <nav className="font-sans text-[10px] tracking-[0.25em] text-white/40">
          <Link href="/products" className="transition-colors hover:text-gold-200">
            CREATIONS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/60">{product.category}</span>
        </nav>

        <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <span className="font-sans text-[10px] tracking-[0.4em] text-gold-200">
              {product.category}
            </span>
            <h1 className="mt-4 font-serif text-3xl font-light leading-tight tracking-[0.04em] md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 font-sans text-sm leading-loose tracking-[0.04em] text-white/60">
              {product.tagline}
            </p>
            <p className="mt-6 font-serif text-2xl font-light tracking-[0.05em] text-white/90">
              {product.price}
            </p>

            {/* Material selector */}
            <div className="mt-10">
              <span className="font-sans text-[11px] tracking-[0.3em] text-white/80">
                MATERIAL
              </span>
              <div className="mt-4 flex flex-wrap gap-3">
                {product.materials.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMaterial(m)}
                    className={`border px-5 py-2 font-sans text-[11px] tracking-[0.15em] transition-colors ${
                      material === m
                        ? "border-gold-200 text-gold-200"
                        : "border-white/25 text-white/60 hover:border-white/60 hover:text-white"
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
                className="flex-1 bg-white px-10 py-4 font-sans text-[11px] tracking-[0.3em] text-black transition-colors hover:bg-gold-200"
              >
                {added ? "ADDED TO BAG" : "ADD TO BAG"}
              </button>
              <Link
                href="/contact"
                className="flex-1 border border-white/40 px-10 py-4 text-center font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:border-gold-200 hover:text-gold-200"
              >
                BOOK AN APPOINTMENT
              </Link>
            </div>

            {added && (
              <p className="mt-5 font-sans text-[11px] tracking-[0.15em] text-gold-200">
                {product.name} ({material}) has been added to your bag.{" "}
                <Link href="/bag" className="underline underline-offset-4">
                  View bag
                </Link>
              </p>
            )}

            {/* Description */}
            <div className="mt-12 space-y-5 border-t border-white/10 pt-10">
              {product.description.map((para, i) => (
                <p
                  key={i}
                  className="font-sans text-[15px] leading-loose tracking-[0.03em] text-white/70"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Details */}
            <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-4 border-t border-white/10 pt-10 sm:grid-cols-2">
              {product.details.map((d) => (
                <div
                  key={d.label}
                  className="flex justify-between border-b border-white/10 pb-3"
                >
                  <dt className="font-sans text-[11px] tracking-[0.2em] text-white/50">
                    {d.label}
                  </dt>
                  <dd className="font-sans text-[12px] tracking-[0.08em] text-white/80">
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="border-t border-white/10 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1500px]">
          <h2 className="text-center font-sans text-xs font-medium tracking-[0.35em] text-white/80">
            YOU MAY ALSO LIKE
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-3">
            {related.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <span className="mt-4 block font-sans text-[10px] tracking-[0.35em] text-gold-200">
                  {p.category}
                </span>
                <h3 className="mt-2 font-serif text-xl font-light leading-snug tracking-[0.04em]">
                  {p.name}
                </h3>
                <p className="mt-2 font-sans text-[12px] tracking-[0.15em] text-white/70">
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
