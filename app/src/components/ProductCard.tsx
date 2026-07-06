"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { productPath, type Product } from "../data/products";
import { useWishlist } from "../lib/wishlist";
import { useCurrency } from "./CurrencyProvider";

/**
 * Product grid card. Cover image with a wishlist heart, and — when a product
 * has multiple images — a mini carousel (hover arrows + clickable line-segment
 * indicators). The interactive controls sit as siblings of the image Link (not
 * nested inside it) so clicking them doesn't navigate.
 */
export default function ProductCard({ item }: { item: Product }) {
  const { format } = useCurrency();
  const { has, toggle } = useWishlist();

  const images = item.images?.length ? item.images : [item.image];
  const multiple = images.length > 1;
  const [index, setIndex] = useState(0);
  const saved = has(item.slug);
  const href = productPath(item);

  const step = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div className="group flex h-full flex-col justify-between text-center">
      <div>
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          <Link
            href={href}
            aria-label={item.name}
            className="block h-full w-full"
          >
            <Image
              src={images[index]}
              alt={item.name}
              fill
              quality={90}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Wishlist heart */}
          <button
            type="button"
            onClick={() =>
              toggle({
                slug: item.slug,
                name: item.name,
                image: item.image,
                price: item.price,
                category: item.category,
              })
            }
            aria-pressed={saved}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            className="absolute right-3 top-3 z-10 text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.5 4.5 13a4.5 4.5 0 0 1 7.5-4.9A4.5 4.5 0 0 1 19.5 13L12 20.5Z"
              />
            </svg>
          </button>

          {/* Prev / Next — appear on hover, only with multiple images */}
          {multiple && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 text-neutral-400 opacity-0 transition hover:text-neutral-900 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-neutral-400 opacity-0 transition hover:text-neutral-900 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </>
          )}

        </div>

        {/* Line-segment indicators — below the image (not overlaid) so they read
            clearly and show exactly how many images there are. */}
        {multiple && (
          <div className="mt-3 flex gap-1.5 opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === index}
                className={`h-0.5 flex-1 transition-colors ${
                  i === index
                    ? "bg-neutral-900"
                    : "bg-neutral-300 hover:bg-neutral-500"
                }`}
              />
            ))}
          </div>
        )}

        <Link href={href}>
          <h2 className="mt-5 text-center font-sans text-[20px] font-normal leading-[23px] tracking-normal text-neutral-800 transition-colors group-hover:text-neutral-500">
            {item.name}
          </h2>
        </Link>
        <p className="mt-2 text-center font-sans text-[14px] font-light leading-[23px] tracking-normal text-neutral-400">
          {item.tagline}
        </p>
      </div>
      <p className="mt-3 text-center font-sans text-[14px] font-light leading-[23px] tracking-normal text-neutral-700">
        {format(item.price)}
      </p>
    </div>
  );
}
