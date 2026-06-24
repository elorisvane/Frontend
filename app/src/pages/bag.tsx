"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../lib/auth";
import { useCart, formatCartTotal } from "../lib/cart";
import { createOrder } from "../data/orders";

export default function Bag() {
  const { items, setQuantity, remove, clear } = useCart();
  const { user, loading } = useAuth();

  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  const total = formatCartTotal(items);

  async function placeOrder() {
    if (placing) return;
    setError(null);
    setPlacing(true);
    try {
      await createOrder({ items, total, note });
      clear();
      setPlaced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-neutral-500">
            Shopping Bag
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            Your Bag
          </h1>
        </div>

        {placed ? (
          <OrderPlaced />
        ) : items.length === 0 ? (
          <EmptyBag />
        ) : (
          <div className="mx-auto mt-16 grid max-w-5xl gap-16 lg:grid-cols-[1fr_360px]">
            {/* Line items */}
            <ul className="divide-y divide-neutral-200">
              {items.map((item) => (
                <li
                  key={`${item.slug}-${item.material}`}
                  className="flex gap-6 py-8"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-neutral-100"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      quality={90}
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-serif text-lg font-light tracking-[0.04em] transition-colors hover:text-gold-600"
                      >
                        {item.name}
                      </Link>
                      <span className="font-serif text-lg font-light tracking-[0.05em] text-neutral-800">
                        {item.price}
                      </span>
                    </div>
                    {item.material && (
                      <span className="mt-1 font-sans text-[11px] tracking-[0.2em] text-neutral-400">
                        {item.material}
                      </span>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-5">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-neutral-300">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setQuantity(
                              item.slug,
                              item.material,
                              item.quantity - 1,
                            )
                          }
                          className="px-3 py-1.5 font-sans text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center font-sans text-[13px] tracking-[0.1em]">
                          {item.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() =>
                            setQuantity(
                              item.slug,
                              item.material,
                              item.quantity + 1,
                            )
                          }
                          className="px-3 py-1.5 font-sans text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => remove(item.slug, item.material)}
                        className="font-sans text-[10px] tracking-[0.25em] text-neutral-400 transition-colors hover:text-neutral-900"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Summary / checkout */}
            <aside className="lg:pt-8">
              <div className="border-t border-neutral-900 pt-6">
                <div className="flex justify-between font-sans text-[12px] tracking-[0.2em] text-neutral-500">
                  <span>SUBTOTAL</span>
                  <span className="font-serif text-lg font-light tracking-[0.05em] text-neutral-900">
                    {total}
                  </span>
                </div>
                <p className="mt-3 font-sans text-[11px] leading-relaxed tracking-[0.05em] text-neutral-400">
                  ÉLORIS pieces are made to order. Placing an order sends a
                  request to your client advisor, who will confirm the details
                  and arrange payment and delivery.
                </p>
              </div>

              <label className="mt-8 block">
                <span className="font-sans text-[11px] tracking-[0.25em] text-neutral-600">
                  NOTE FOR YOUR ADVISOR
                </span>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Sizing, engraving, occasion…"
                  className="mt-3 w-full resize-y border border-neutral-300 bg-transparent p-3 font-sans text-sm tracking-[0.03em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none"
                />
              </label>

              {error && (
                <p className="mt-4 font-sans text-[12px] tracking-[0.08em] text-red-600">
                  {error}
                </p>
              )}

              {loading ? (
                <p className="mt-8 font-sans text-[11px] tracking-[0.3em] text-neutral-400">
                  LOADING…
                </p>
              ) : user ? (
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="mt-8 w-full bg-neutral-900 px-10 py-4 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placing ? "PLACING ORDER…" : "PLACE ORDER"}
                </button>
              ) : (
                <div className="mt-8">
                  <Link
                    href="/account?redirect=/bag"
                    className="block w-full bg-neutral-900 px-10 py-4 text-center font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700"
                  >
                    SIGN IN TO ORDER
                  </Link>
                  <p className="mt-4 text-center font-sans text-[11px] tracking-[0.05em] text-neutral-400">
                    Your bag is saved on this device.
                  </p>
                </div>
              )}

              <Link
                href="/products"
                className="mt-6 block text-center font-sans text-[11px] tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-900"
              >
                CONTINUE SHOPPING
              </Link>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function OrderPlaced() {
  return (
    <div className="mx-auto mt-20 flex max-w-md flex-col items-center text-center">
      <p className="font-serif text-3xl font-light tracking-[0.05em]">
        Thank you
      </p>
      <p className="mt-6 font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
        Your order has been received. A client advisor will be in touch shortly
        to confirm the details. You can review it any time in your account.
      </p>
      <Link
        href="/account"
        className="mt-10 inline-block border border-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
      >
        VIEW MY ORDERS
      </Link>
    </div>
  );
}

function EmptyBag() {
  return (
    <div className="mx-auto mt-20 flex max-w-md flex-col items-center text-center">
      <svg
        className="h-12 w-12 text-neutral-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12l-1 12H7L6 8Z" />
        <path strokeLinecap="round" d="M9 8a3 3 0 0 1 6 0" />
      </svg>
      <p className="mt-8 font-serif text-2xl font-light tracking-[0.05em]">
        Your bag is empty
      </p>
      <p className="mt-4 font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
        Discover our collections and add the pieces you wish to acquire. Our
        client advisors are also available to assist you with any purchase.
      </p>
      <Link
        href="/products"
        className="mt-10 inline-block border border-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
      >
        CONTINUE SHOPPING
      </Link>
      <Link
        href="/contact"
        className="mt-6 font-sans text-[11px] tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-900"
      >
        CONTACT A CLIENT ADVISOR
      </Link>
    </div>
  );
}
