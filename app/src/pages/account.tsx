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
import { getProducts, productPath, type Product } from "../data/products";
import { upsertProfile, createAddress } from "../data/profile";
import { COUNTRIES, postalLabel } from "../lib/countries";

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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16.36 12.78c.02 2.36 2.07 3.15 2.1 3.16-.02.06-.33 1.13-1.09 2.24-.66.96-1.34 1.91-2.42 1.93-1.06.02-1.4-.63-2.61-.63-1.21 0-1.59.61-2.59.65-1.04.04-1.83-1.04-2.5-2-1.37-2-.91-5.96 1.25-7.45.56-.5 1.13-.78 1.84-.78 1.13-.02 2.2.76 2.89.76.69 0 1.99-.94 3.35-.8.57.02 2.17.23 3.2 1.74-.08.05-1.91 1.12-1.89 3.33M14.13 7.5c.57-.69.95-1.65.85-2.6-.82.03-1.81.55-2.4 1.24-.53.61-1 1.59-.87 2.53.91.07 1.85-.47 2.42-1.17" />
    </svg>
  );
}

function AuthPanel() {
  const { signIn, signUp, signInWithProvider } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "apple" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [country, setCountry] = useState("US");

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleOAuth(provider: "google" | "apple") {
    if (oauthPending) return;
    setError(null);
    setNotice(null);
    setOauthPending(provider);
    try {
      // On success the browser is redirected to the provider, so control does
      // not return here; we only reach the catch on a configuration error.
      await signInWithProvider(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
      setOauthPending(null);
    }
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
        const firstName = String(data.get("firstName") ?? "");
        const lastName = String(data.get("lastName") ?? "");
        const phone = String(data.get("phone") ?? "").trim();
        const line1 = String(data.get("line1") ?? "").trim();
        const city = String(data.get("city") ?? "").trim();
        const region = String(data.get("state") ?? "").trim();
        const postalCode = String(data.get("postalCode") ?? "").trim();
        const countryCode = String(data.get("country") ?? "US");

        const { needsConfirmation } = await signUp({
          firstName,
          lastName,
          email,
          password,
        });

        if (needsConfirmation) {
          setNotice(
            "Almost there — check your inbox to confirm your email, then sign in. You can add your address from your account afterwards.",
          );
          setMode("signin");
        } else {
          // Session is active — persist the optional contact details + first
          // address. Non-fatal: the account exists regardless, and they can
          // complete these from their account later.
          try {
            if (phone) await upsertProfile({ firstName, lastName, phone });
            if (line1 || city || postalCode) {
              await createAddress({
                recipientName: `${firstName} ${lastName}`.trim() || null,
                phone: phone || null,
                line1: line1 || null,
                city: city || null,
                state: region || null,
                postalCode: postalCode || null,
                country: countryCode,
                isDefaultShipping: true,
                isDefaultBilling: true,
              });
            }
          } catch {
            // Ignore — the address book can be filled in from the account page.
          }
          const redirect = new URLSearchParams(window.location.search).get(
            "redirect",
          );
          if (redirect && /^\/(?![/\\])/.test(redirect)) router.push(redirect);
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

        {/* Social sign-in */}
        <div className="mt-10 space-y-3">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={oauthPending !== null}
            className="flex w-full items-center justify-center gap-3 border border-neutral-300 px-6 py-3 font-sans text-[11px] tracking-[0.25em] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon />
            {oauthPending === "google"
              ? "REDIRECTING…"
              : "CONTINUE WITH GOOGLE"}
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            disabled={oauthPending !== null}
            className="flex w-full items-center justify-center gap-3 border border-neutral-300 px-6 py-3 font-sans text-[11px] tracking-[0.25em] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AppleIcon />
            {oauthPending === "apple" ? "REDIRECTING…" : "CONTINUE WITH APPLE"}
          </button>
        </div>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-neutral-200" />
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-neutral-400">
            or
          </span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
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
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder="Password"
            className={inputClass}
          />

          {mode === "register" && (
            <div className="space-y-7 border-t border-neutral-200 pt-7">
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Phone"
                className={inputClass}
              />
              <input
                name="line1"
                autoComplete="address-line1"
                placeholder="Address"
                className={inputClass}
              />
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <input
                  name="city"
                  autoComplete="address-level2"
                  placeholder="City"
                  className={inputClass}
                />
                <input
                  name="state"
                  autoComplete="address-level1"
                  placeholder="State / Region"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <select
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  autoComplete="country"
                  className={inputClass}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  name="postalCode"
                  autoComplete="postal-code"
                  placeholder={postalLabel(country)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

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
  const [catalog, setCatalog] = useState<Map<string, Product>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getMyOrders(), getProducts()])
      .then(([myOrders, products]) => {
        if (!active) return;
        setOrders(myOrders);
        setCatalog(new Map(products.map((p) => [p.slug, p])));
      })
      .catch(
        (err) =>
          active &&
          setError(
            err instanceof Error ? err.message : "Could not load orders.",
          ),
      );
    return () => {
      active = false;
    };
  }, []);

  // Resolve an order line to its catalogue product (so we can build the
  // /products/<category>/<slug> link). Mirror getProduct's variant rule (a
  // trailing "-2" resolves to the base slug). null = the product is gone, so
  // the line renders un-linked instead of navigating to a 404.
  const resolveProduct = (slug: string): Product | null =>
    (slug && (catalog.get(slug) ?? catalog.get(slug.replace(/-\d+$/, "")))) ||
    null;

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
          <ul className="mt-5 space-y-5">
            {order.items.map((item, i) => {
              const product = resolveProduct(item.slug);
              const body = (
                <>
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-neutral-100">
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
                      {item.material ? `${item.material} · ` : ""}Qty{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-sans text-[13px] tracking-[0.04em] text-neutral-600">
                    {item.price}
                  </span>
                </>
              );
              return (
                <li key={`${item.slug}-${item.material}-${i}`}>
                  {product ? (
                    <Link
                      href={productPath(product)}
                      className="group flex items-center gap-4"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4">{body}</div>
                  )}
                </li>
              );
            })}
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
