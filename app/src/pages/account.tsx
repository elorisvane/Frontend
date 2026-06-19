"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inputClass =
  "w-full border-b border-white/30 bg-transparent py-3 font-sans text-sm tracking-[0.05em] text-white placeholder-white/40 transition-colors focus:border-gold-200 focus:outline-none";

type Mode = "signin" | "register";

export default function Account() {
  const [mode, setMode] = useState<Mode>("signin");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Placeholder — wire up to a real authentication endpoint here.
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header />

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-200">
            My Account
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            {mode === "signin" ? "Welcome Back" : "Create an Account"}
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-loose tracking-[0.04em] text-white/60">
            Access your orders, wishlist and private appointments, and enjoy a
            personalised experience across the maison.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-md">
          {/* Mode toggle */}
          <div className="flex justify-center gap-10 border-b border-white/10 pb-5">
            <button
              onClick={() => {
                setMode("signin");
                setSubmitted(false);
              }}
              className={`font-sans text-[11px] tracking-[0.3em] transition-colors ${
                mode === "signin"
                  ? "text-gold-200"
                  : "text-white/50 hover:text-white"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => {
                setMode("register");
                setSubmitted(false);
              }}
              className={`font-sans text-[11px] tracking-[0.3em] transition-colors ${
                mode === "register"
                  ? "text-gold-200"
                  : "text-white/50 hover:text-white"
              }`}
            >
              REGISTER
            </button>
          </div>

          {submitted ? (
            <p className="mt-12 text-center font-serif text-2xl font-light tracking-[0.05em] text-gold-200">
              {mode === "signin"
                ? "Welcome back to ÉLORIS."
                : "Your account has been created."}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-7">
              {mode === "register" && (
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <input
                    required
                    type="text"
                    placeholder="First name"
                    className={inputClass}
                  />
                  <input
                    required
                    type="text"
                    placeholder="Last name"
                    className={inputClass}
                  />
                </div>
              )}
              <input
                required
                type="email"
                placeholder="Email address"
                className={inputClass}
              />
              <input
                required
                type="password"
                placeholder="Password"
                className={inputClass}
              />

              {mode === "signin" && (
                <div className="text-right">
                  <a
                    href="#"
                    className="font-sans text-[11px] tracking-[0.2em] text-white/50 transition-colors hover:text-gold-200"
                  >
                    Forgotten your password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full border border-white/40 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:border-gold-200 hover:text-gold-200"
              >
                {mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
