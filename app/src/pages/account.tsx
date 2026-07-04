"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PersonalDetails from "../components/account/PersonalDetails";
import AddressBook from "../components/account/AddressBook";
import PhoneCountrySelect from "../components/PhoneCountrySelect";
import { useAuth } from "../lib/auth";
import { useCurrency } from "../components/CurrencyProvider";
import { getMyOrders, type Order } from "../data/orders";
import { getProducts, productPath, type Product } from "../data/products";
import { upsertProfile } from "../data/profile";
import { setSessionPersistence } from "../lib/supabase";
import { COUNTRIES } from "../lib/countries";

// Honorifics offered on the register form (matches the account dashboard).
const TITLES = ["Mr", "Mrs", "Ms", "Mx", "Dr"];

// Register password rule shown in the hint: min 8, no spaces, and at least one
// uppercase, one lowercase, one digit and one special character.
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;
const PASSWORD_HINT =
  "Min. 8 characters with no space, uppercase letter, lowercase letter, number, special character.";

// Boxed field — full border, matches the login mockup. `inputBase` omits the
// width so it can sit in a flex row (select + input) without `w-full` forcing
// a sibling to overflow; `inputClass` is the standard full-width field.
const inputBase =
  "border border-neutral-300 bg-transparent px-4 py-3.5 font-sans text-sm tracking-[0.05em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none";
const inputClass = `w-full ${inputBase}`;

// Solid primary action. NB: `gold-*` is a monochrome greyscale on this site, so
// the mockup's olive button renders as solid black to stay on-palette.
const primaryBtnClass =
  "w-full bg-neutral-900 px-10 py-3.5 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50";

// Bordered secondary action (Google, Create account, Back).
const outlineBtnClass =
  "flex w-full items-center justify-center gap-3 border border-neutral-300 px-6 py-3.5 font-sans text-[11px] tracking-[0.25em] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50";

type Mode = "signin" | "register";

/* -------------------------------------------------------------------------- */
/* Forgot password — request a reset link                                     */
/* -------------------------------------------------------------------------- */

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send the reset email.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="text-center">
        <p className="font-sans text-[11px] tracking-[0.3em] text-neutral-900">
          RESET YOUR PASSWORD
        </p>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[13px] leading-relaxed tracking-[0.04em] text-neutral-500">
          Enter your account email and we’ll send you a link to choose a new
          password.
        </p>
      </div>

      {sent ? (
        <div className="mt-10 text-center">
          <p className="font-sans text-[13px] leading-relaxed tracking-[0.06em] text-gold-600">
            We’ve emailed a reset link to {email.trim()}. Check your inbox (and
            spam).
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-8 font-sans text-[11px] tracking-[0.3em] text-neutral-400 underline underline-offset-4 transition-colors hover:text-neutral-900"
          >
            BACK TO SIGN IN
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-7">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="Email address"
            autoFocus
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
            className={primaryBtnClass}
          >
            {pending ? "SENDING…" : "SEND RESET LINK"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="block w-full text-center font-sans text-[11px] tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-900"
          >
            BACK TO SIGN IN
          </button>
        </form>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Password reset (after following the email link)                            */
/* -------------------------------------------------------------------------- */

function EyeButton({
  shown,
  onToggle,
}: {
  shown: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      aria-pressed={shown}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-900"
    >
      {shown ? (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3l18 18" />
          <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3 3.9" />
          <path d="M6.6 6.6A17.2 17.2 0 0 0 2 12s3.6 7 10 7a10.3 10.3 0 0 0 4.2-.9" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

function ResetPasswordPanel() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await updatePassword(password);
      setDone(true);
      // `recovery` flips to false, so the page swaps to the signed-in dashboard.
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update your password.",
      );
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
          Set a New Password
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
          Choose a new password for your ÉLORIS account.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-md">
        {done ? (
          <p className="text-center font-sans text-[13px] leading-relaxed tracking-[0.06em] text-gold-600">
            Your password has been updated. You’re now signed in.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="relative">
              <input
                required
                type={show ? "text" : "password"}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="New password"
                className={`${inputClass} pr-10`}
              />
              <EyeButton shown={show} onToggle={() => setShow((s) => !s)} />
            </div>
            {error && (
              <p className="font-sans text-[12px] tracking-[0.08em] text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className={primaryBtnClass}
            >
              {pending ? "UPDATING…" : "UPDATE PASSWORD"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export default function Account() {
  const { user, loading, recovery } = useAuth();

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        {loading ? (
          <p className="text-center font-sans text-[11px] tracking-[0.3em] text-neutral-400">
            LOADING…
          </p>
        ) : recovery ? (
          <ResetPasswordPanel />
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

function AuthPanel() {
  const { signIn, signUp, signInWithProvider } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [forgot, setForgot] = useState(false);
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "apple" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [remember, setRemember] = useState(true);
  // Register password validation, shown inline by the relevant field.
  const [pwError, setPwError] = useState(false); // strength rule not met
  const [confirmError, setConfirmError] = useState(false); // confirm ≠ password
  // Register-only fields that need controlled state (native selects can't be
  // read from FormData with a styled placeholder / derived flag).
  const [title, setTitle] = useState("");
  const [dialCountry, setDialCountry] = useState("US");

  function switchMode(next: Mode) {
    setMode(next);
    setForgot(false);
    setError(null);
    setNotice(null);
    setPwError(false);
    setConfirmError(false);
  }

  async function handleOAuth(provider: "google" | "apple") {
    if (oauthPending) return;
    setError(null);
    setNotice(null);
    setOauthPending(provider);
    try {
      // Social sign-ins stay signed in across restarts.
      setSessionPersistence(true);
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

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    // Register-only client validation, before we hit the network. Failures show
    // inline by the relevant password field rather than as a detached banner.
    if (mode === "register") {
      const confirm = String(data.get("confirmPassword") ?? "");
      if (!PASSWORD_RE.test(password)) {
        setPwError(true);
        setConfirmError(false);
        return;
      }
      if (password !== confirm) {
        setPwError(false);
        setConfirmError(true);
        return;
      }
      setPwError(false);
      setConfirmError(false);
    }

    setError(null);
    setNotice(null);
    setPending(true);

    try {
      if (mode === "signin") {
        await signIn(email, password, remember);
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
        const localNumber = String(data.get("phone") ?? "").trim();
        const dial = COUNTRIES.find((c) => c.code === dialCountry)?.dial ?? "";
        // Store the phone in international form, e.g. "+44 7911 123456".
        const phone = localNumber ? `${dial} ${localNumber}`.trim() : "";

        // New accounts stay signed in across restarts.
        setSessionPersistence(true);
        const { needsConfirmation } = await signUp({
          firstName,
          lastName,
          email,
          password,
        });

        if (needsConfirmation) {
          setNotice(
            "Almost there — check your inbox to confirm your email, then sign in.",
          );
          setMode("signin");
        } else {
          // Session is active — persist the title + phone onto the profile.
          // Non-fatal: the account exists regardless, and these can be edited
          // from the account page later.
          try {
            await upsertProfile({
              title: title || null,
              firstName,
              lastName,
              phone: phone || null,
            });
          } catch {
            // Ignore — details can be completed from the account page.
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

      <div
        className={`mx-auto mt-16 ${
          mode === "register" ? "max-w-3xl" : "max-w-md"
        }`}
      >
        {forgot ? (
          <ForgotPasswordForm onBack={() => setForgot(false)} />
        ) : mode === "signin" ? (
          /* ------------------------------- SIGN IN ------------------------------- */
          <>
            {notice && (
              <p className="mb-8 text-center font-sans text-[12px] leading-relaxed tracking-[0.1em] text-neutral-700">
                {notice}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className={inputClass}
              />
              <div className="relative">
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  autoComplete="current-password"
                  placeholder="Password"
                  className={`${inputClass} pr-12`}
                />
                <EyeButton
                  shown={showPassword}
                  onToggle={() => setShowPassword((s) => !s)}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2.5 font-sans text-[12px] tracking-[0.06em] text-neutral-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 accent-neutral-900"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setNotice(null);
                    setForgot(true);
                  }}
                  className="font-sans text-[12px] tracking-[0.06em] text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-500"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="font-sans text-[12px] tracking-[0.08em] text-red-600">
                  {error}
                </p>
              )}

              <button type="submit" disabled={pending} className={primaryBtnClass}>
                {pending ? "PLEASE WAIT…" : "LOGIN"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-neutral-200" />
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-neutral-400">
                or
              </span>
              <span className="h-px flex-1 bg-neutral-200" />
            </div>
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={oauthPending !== null}
              className={outlineBtnClass}
            >
              <GoogleIcon />
              {oauthPending === "google"
                ? "REDIRECTING…"
                : "CONTINUE WITH GOOGLE"}
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`${outlineBtnClass} mt-3`}
            >
              CREATE AN ACCOUNT
            </button>
          </>
        ) : (
          /* --------------------------- CREATE AN ACCOUNT --------------------------- */
          <>
            {notice && (
              <p className="mb-8 text-center font-sans text-[12px] leading-relaxed tracking-[0.1em] text-neutral-700">
                {notice}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2 md:gap-0 md:divide-x md:divide-neutral-200">
                {/* Left — who you are */}
                <div className="space-y-5 md:pr-10">
                  <div className="flex gap-4">
                    <select
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      aria-label="Title"
                      className={`${inputBase} w-24 shrink-0 ${
                        title ? "" : "text-neutral-400"
                      }`}
                    >
                      <option value="">Title</option>
                      {TITLES.map((t) => (
                        <option key={t} value={t} className="text-neutral-900">
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="First Name*"
                      className={`${inputBase} min-w-0 flex-1`}
                    />
                  </div>
                  <input
                    required
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last Name*"
                    className={inputClass}
                  />
                  <div className="flex gap-4">
                    <PhoneCountrySelect
                      value={dialCountry}
                      onChange={setDialCountry}
                    />
                    <input
                      required
                      name="phone"
                      type="tel"
                      autoComplete="tel-national"
                      placeholder="Phone Number*"
                      className={`${inputBase} min-w-0 flex-1`}
                    />
                  </div>
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address*"
                    className={inputClass}
                  />
                </div>

                {/* Right — password + consent */}
                <div className="space-y-5 md:pl-10">
                  <div>
                    <div className="relative">
                      <input
                        required
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Set Password*"
                        onInput={() => pwError && setPwError(false)}
                        aria-invalid={pwError}
                        className={`${inputClass} pr-12 ${
                          pwError ? "border-red-400" : ""
                        }`}
                      />
                      <EyeButton
                        shown={showPassword}
                        onToggle={() => setShowPassword((s) => !s)}
                      />
                    </div>
                    <p
                      className={`mt-2 flex items-start gap-2 font-sans text-[11px] leading-relaxed tracking-[0.02em] ${
                        pwError ? "text-red-600" : "text-neutral-400"
                      }`}
                    >
                      <span aria-hidden className="mt-px">
                        ⓘ
                      </span>
                      <span>{PASSWORD_HINT}</span>
                    </p>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        required
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Confirm Password*"
                        onInput={() => confirmError && setConfirmError(false)}
                        aria-invalid={confirmError}
                        className={`${inputClass} pr-12 ${
                          confirmError ? "border-red-400" : ""
                        }`}
                      />
                      <EyeButton
                        shown={showConfirm}
                        onToggle={() => setShowConfirm((s) => !s)}
                      />
                    </div>
                    {confirmError && (
                      <p className="mt-2 font-sans text-[11px] leading-relaxed tracking-[0.02em] text-red-600">
                        Passwords do not match.
                      </p>
                    )}
                  </div>
                  <p className="font-sans text-[12px] leading-relaxed tracking-[0.03em] text-neutral-500">
                    By clicking submit you are accepting the{" "}
                    <Link
                      href="/terms-of-service"
                      className="font-medium text-neutral-900 underline underline-offset-2 transition-colors hover:text-neutral-600"
                    >
                      terms and conditions
                    </Link>{" "}
                    as well as the{" "}
                    <Link
                      href="/privacy-policy"
                      className="font-medium text-neutral-900 underline underline-offset-2 transition-colors hover:text-neutral-600"
                    >
                      privacy policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-center font-sans text-[12px] tracking-[0.08em] text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={pending}
                  className={`${primaryBtnClass} max-w-xs`}
                >
                  {pending ? "PLEASE WAIT…" : "SUBMIT"}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center font-sans text-[12px] tracking-[0.06em] text-neutral-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-500"
              >
                Sign in
              </button>
            </p>
          </>
        )}
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
  const { format } = useCurrency();

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
                    {format(item.price)}
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
              {format(order.total)}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
