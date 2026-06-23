"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { sendContactMessage } from "../data/contact";

const boutiques = [
  { city: "NEW YORK", address: "744 Fifth Avenue, NY 10019", phone: "+1 212 555 0100" },
  { city: "PARIS", address: "12 Place Vendôme, 75001", phone: "+33 1 55 00 12 00" },
  { city: "TOKYO", address: "Ginza 2-Chome, Chūō City", phone: "+81 3 5555 0000" },
];

const inputClass =
  "w-full border-b border-neutral-300 bg-transparent py-3 font-sans text-sm tracking-[0.05em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    try {
      await sendContactMessage({
        firstName: String(data.get("firstName") ?? ""),
        lastName: String(data.get("lastName") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Your message could not be sent. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      {/* spacing for the fixed header */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-neutral-500">
            Client Services
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
            Our client advisors are available to assist you with any enquiry, from product
            information to private appointments.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-16 md:grid-cols-2">
          {/* Form */}
          <div>
            <h2 className="font-sans text-xs font-medium tracking-[0.35em] text-neutral-700">
              SEND US A MESSAGE
            </h2>
            {submitted ? (
              <p className="mt-8 font-serif text-2xl font-light tracking-[0.05em] text-neutral-800">
                Thank you. A client advisor will be in touch shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-7">
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
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="Email address"
                  className={inputClass}
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone (optional)"
                  className={inputClass}
                />
                <textarea
                  required
                  name="message"
                  rows={4}
                  maxLength={5000}
                  placeholder="How may we help you?"
                  className={`${inputClass} resize-none`}
                />
                {error && (
                  <p className="font-sans text-[12px] tracking-[0.08em] text-red-600">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="border border-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "SENDING…" : "SUBMIT"}
                </button>
              </form>
            )}
          </div>

          {/* Boutiques */}
          <div>
            <h2 className="font-sans text-xs font-medium tracking-[0.35em] text-neutral-700">
              OUR BOUTIQUES
            </h2>
            <div className="mt-8 space-y-8">
              {boutiques.map((b) => (
                <div key={b.city} className="border-b border-neutral-200 pb-6">
                  <h3 className="font-serif text-xl font-light tracking-[0.2em]">{b.city}</h3>
                  <p className="mt-2 font-sans text-sm tracking-[0.05em] text-neutral-500">
                    {b.address}
                  </p>
                  <p className="mt-1 font-sans text-sm tracking-[0.05em] text-neutral-500">
                    {b.phone}
                  </p>
                </div>
              ))}
              <div>
                <h3 className="font-sans text-[11px] tracking-[0.3em] text-neutral-700">
                  CLIENT CARE
                </h3>
                <p className="mt-2 font-sans text-sm tracking-[0.05em] text-neutral-500">
                  Monday–Saturday, 10am–7pm
                </p>
                <a
                  href="mailto:care@eloris.com"
                  className="mt-1 inline-block font-sans text-sm tracking-[0.05em] text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-500"
                >
                  care@eloris.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
