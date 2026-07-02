"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useWishlist } from "../lib/wishlist";
import { productPath } from "../data/products";
import { useCurrency } from "../components/CurrencyProvider";

export default function Wishlist() {
  const { items, remove } = useWishlist();
  const { format } = useCurrency();

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-neutral-500">
            My Wishlist
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            Saved Creations
          </h1>
          {items.length > 0 && (
            <p className="mt-5 font-sans text-[12px] tracking-[0.2em] text-neutral-400">
              {items.length} {items.length === 1 ? "PIECE" : "PIECES"} SAVED
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.slug} className="group relative">
                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  aria-label={`Remove ${item.name} from wishlist`}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-500 backdrop-blur transition-colors hover:text-neutral-900"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <Link href={productPath(item)} className="block">
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        quality={100}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                  </div>
                  <span className="mt-4 block font-sans text-[10px] tracking-[0.35em] text-neutral-500">
                    {item.category}
                  </span>
                  <h3 className="mt-2 font-serif text-xl font-light leading-snug tracking-[0.04em] transition-colors group-hover:text-gold-600">
                    {item.name}
                  </h3>
                  <p className="mt-2 font-sans text-[12px] tracking-[0.15em] text-neutral-600">
                    {format(item.price)}
                  </p>
                </Link>

                <Link
                  href={productPath(item)}
                  className="mt-4 inline-block border-b border-neutral-900 pb-1 font-sans text-[10px] tracking-[0.3em] text-neutral-900 transition-colors hover:border-gold-600 hover:text-gold-600"
                >
                  VIEW PIECE
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="mx-auto mt-20 flex max-w-md flex-col items-center text-center">
      <svg
        className="h-12 w-12 text-neutral-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.5 4.5 13a4.5 4.5 0 0 1 7.5-4.9A4.5 4.5 0 0 1 19.5 13L12 20.5Z"
        />
      </svg>
      <p className="mt-8 font-serif text-2xl font-light tracking-[0.05em]">
        Your wishlist is empty
      </p>
      <p className="mt-4 font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
        Save the pieces you love to revisit them at any time, or to share with a
        client advisor during a private appointment.
      </p>
      <Link
        href="/products"
        className="mt-10 inline-block border border-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
      >
        DISCOVER THE COLLECTIONS
      </Link>
    </div>
  );
}
