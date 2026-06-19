"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const boutiques = [
  { city: "NEW YORK", address: "744 Fifth Avenue, NY 10019", phone: "+1 212 555 0100" },
  { city: "PARIS", address: "12 Place Vendôme, 75001", phone: "+33 1 55 00 12 00" },
  { city: "TOKYO", address: "Ginza 2-Chome, Chūō City", phone: "+81 3 5555 0000" },
];

const inputClass =
  "w-full border-b border-white/30 bg-transparent py-3 font-sans text-sm tracking-[0.05em] text-white placeholder-white/40 transition-colors focus:border-gold-200 focus:outline-none";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Placeholder — wire up to a real endpoint / form service here.
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header />

      {/* spacing for the fixed header */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-200">
            Client Services
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-loose tracking-[0.04em] text-white/60">
            Our client advisors are available to assist you with any enquiry, from product
            information to private appointments.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-16 md:grid-cols-2">
          {/* Form */}
          <div>
            <h2 className="font-sans text-xs font-medium tracking-[0.35em] text-white/80">
              SEND US A MESSAGE
            </h2>
            {submitted ? (
              <p className="mt-8 font-serif text-2xl font-light tracking-[0.05em] text-gold-200">
                Thank you. A client advisor will be in touch shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-7">
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <input required type="text" placeholder="First name" className={inputClass} />
                  <input required type="text" placeholder="Last name" className={inputClass} />
                </div>
                <input required type="email" placeholder="Email address" className={inputClass} />
                <input type="tel" placeholder="Phone (optional)" className={inputClass} />
                <textarea
                  required
                  rows={4}
                  placeholder="How may we help you?"
                  className={`${inputClass} resize-none`}
                />
                <button
                  type="submit"
                  className="border border-white/40 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:border-gold-200 hover:text-gold-200"
                >
                  SUBMIT
                </button>
              </form>
            )}
          </div>

          {/* Boutiques */}
          <div>
            <h2 className="font-sans text-xs font-medium tracking-[0.35em] text-white/80">
              OUR BOUTIQUES
            </h2>
            <div className="mt-8 space-y-8">
              {boutiques.map((b) => (
                <div key={b.city} className="border-b border-white/10 pb-6">
                  <h3 className="font-serif text-xl font-light tracking-[0.2em]">{b.city}</h3>
                  <p className="mt-2 font-sans text-sm tracking-[0.05em] text-white/60">
                    {b.address}
                  </p>
                  <p className="mt-1 font-sans text-sm tracking-[0.05em] text-white/60">
                    {b.phone}
                  </p>
                </div>
              ))}
              <div>
                <h3 className="font-sans text-[11px] tracking-[0.3em] text-white/80">
                  CLIENT CARE
                </h3>
                <p className="mt-2 font-sans text-sm tracking-[0.05em] text-white/60">
                  Monday–Saturday, 10am–7pm
                </p>
                <a
                  href="mailto:care@eloris.com"
                  className="mt-1 inline-block font-sans text-sm tracking-[0.05em] text-gold-200 transition-colors hover:text-gold-100"
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
