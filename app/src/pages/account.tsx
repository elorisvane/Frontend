"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PersonalDetails from "../components/account/PersonalDetails";
import AddressBook from "../components/account/AddressBook";
import { useAuth } from "../lib/auth";
import { getMyOrders, type Order } from "../data/orders";

const inputClass =
  "w-full border-b border-neutral-300 bg-transparent py-3 font-sans text-sm tracking-[0.05em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none";

type Mode = "signin" | "register";

export default function Account() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        {loading ? (
          <p className="text-center font-sans text-[11px] tracking-[0.3em] text-neutral-400">
            LOADING…
          </p>
        ) : user ? (
          <Dashboard />
        ) : (
          <AuthPanel />
        )}
      </section>

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Signed-out: sign in / register                                             */
/* -------------------------------------------------------------------------- */

function AuthPanel() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setNotice(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
      if (mode === "signin") {
        await signIn(email, password);
        // On success the auth listener flips this page to the dashboard; honour
        // a ?redirect target (e.g. back to the bag) when one was passed.
        const redirect = new URLSearchParams(window.location.search).get(
          "redirect",
        );
        // Same-origin paths only: `startsWith("/")` alone still allows
        // "//evil.com" (protocol-relative) and "/\evil.com", which redirect
        // off-site. Require a single leading slash not followed by / or \.
        if (redirect && /^\/(?![/\\])/.test(redirect)) router.push(redirect);
      } else {
        const { needsConfirmation } = await signUp({
          firstName: String(data.get("firstName") ?? ""),
          lastName: String(data.get("lastName") ?? ""),
          email,
          password,
        });
        if (needsConfirmation) {
          setNotice(
            "Almost there — check your inbox to confirm your email, then sign in.",
          );
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-neutral-500">
          My Account
        </p>
        <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
          {mode === "signin" ? "Welcome Back" : "Create an Account"}
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
          Access your orders, wishlist and private appointments, and enjoy a
          personalised experience across the maison.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-md">
        <div className="flex justify-center gap-10 border-b border-neutral-200 pb-5">
          <button
            onClick={() => switchMode("signin")}
            className={`font-sans text-[11px] tracking-[0.3em] transition-colors ${
              mode === "signin"
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-900"
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`font-sans text-[11px] tracking-[0.3em] transition-colors ${
              mode === "register"
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-900"
            }`}
          >
            REGISTER
          </button>
        </div>

        {notice && (
          <p className="mt-8 text-center font-sans text-[12px] leading-relaxed tracking-[0.1em] text-gold-600">
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-7">
          {mode === "register" && (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <input
                required
                name="firstName"
                type="text"
                placeholder="First name"
                className={inputClass}
              />
              <input
                required
                name="lastName"
                type="text"
                placeholder="Last name"
                className={inputClass}
              />
            </div>
          )}
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            className={inputClass}
          />
          <input
            required
            name="password"
            type="password"
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="Password"
            className={inputClass}
          />

          {error && (
            <p className="font-sans text-[12px] tracking-[0.08em] text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full border border-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "PLEASE WAIT…"
              : mode === "signin"
                ? "SIGN IN"
                : "CREATE ACCOUNT"}
          </button>
        </form>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Signed-in: account dashboard (tabbed: details / addresses / orders)        */
/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "details", label: "MY DETAILS" },
  { id: "addresses", label: "ADDRESS BOOK" },
  { id: "orders", label: "ORDER HISTORY" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Dashboard() {
  const { displayName, user, signOut } = useAuth();
  const [tab, setTab] = useState<TabId>("details");
  const activeLabel = TABS.find((t) => t.id === tab)!.label;

  return (
    <>
      {/* Greeting */}
      <div className="text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-neutral-500">
          My Account
        </p>
        <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
          {displayName ? `Bonjour, ${displayName.split(" ")[0]}` : "Bonjour"}
        </h1>
        <p className="mt-6 font-sans text-sm tracking-[0.04em] text-neutral-500">
          {user?.email}
        </p>
        <button
          onClick={() => signOut()}
          className="mt-6 font-sans text-[11px] tracking-[0.3em] text-neutral-400 underline underline-offset-4 transition-colors hover:text-neutral-900"
        >
          SIGN OUT
        </button>
      </div>

      {/* Section nav + active panel */}
      <div className="mx-auto mt-16 grid max-w-5xl gap-10 lg:grid-cols-[230px_1fr] lg:gap-16">
        <nav
          aria-label="Account sections"
          className="flex gap-8 overflow-x-auto pb-1 lg:sticky lg:top-32 lg:flex-col lg:gap-1 lg:self-start lg:overflow-visible lg:pb-0"
        >
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 pb-3 text-left font-sans text-[11px] tracking-[0.3em] transition-colors lg:border-b-0 lg:border-l-2 lg:py-2.5 lg:pb-2.5 lg:pl-5 ${
                  active
                    ? "border-gold-500 text-neutral-900"
                    : "border-transparent text-neutral-400 hover:text-neutral-900"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="min-h-[340px]">
          <h2 className="border-b border-neutral-200 pb-4 font-sans text-[11px] tracking-[0.35em] text-neutral-700">
            {activeLabel}
          </h2>
          {tab === "details" && <PersonalDetails />}
          {tab === "addresses" && <AddressBook />}
          {tab === "orders" && <OrderHistory />}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Order history (loads only when its tab is opened)                          */
/* -------------------------------------------------------------------------- */

function OrderHistory() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyOrders()
      .then((data) => active && setOrders(data))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <p className="mt-8 font-sans text-[12px] tracking-[0.08em] text-red-600">
        {error}
      </p>
    );
  }

  if (orders === null) {
    return (
      <p className="mt-8 font-sans text-[11px] tracking-[0.3em] text-neutral-400">
        LOADING…
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="font-serif text-2xl font-light tracking-[0.05em] text-neutral-700">
          No orders yet
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block border border-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          DISCOVER THE CREATIONS
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-2 divide-y divide-neutral-200">
      {orders.map((order) => (
        <li key={order.id} className="py-7">
          <div className="flex items-baseline justify-between">
            <span className="font-sans text-[11px] tracking-[0.2em] text-neutral-400">
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold-600">
              {order.status}
            </span>
          </div>
          <ul className="mt-4 space-y-4">
            {order.items.map((item, i) => (
              <li key={`${item.slug}-${item.material}-${i}`}>
                <Link
                  href={`/products/${item.slug}`}
                  className="group flex items-center gap-4"
                >
                  <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-neutral-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[15px] font-light tracking-[0.03em] text-neutral-800 transition-colors group-hover:text-gold-600">
                      {item.name}
                    </p>
                    <p className="mt-1 font-sans text-[11px] tracking-[0.1em] text-neutral-400">
                      {item.material ? `${item.material} · ` : ""}Qty {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-sans text-[13px] tracking-[0.04em] text-neutral-600">
                    {item.price}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {order.total && (
            <p className="mt-3 text-right font-serif text-lg font-light tracking-[0.05em] text-neutral-800">
              {order.total}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
