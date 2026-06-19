import Link from "next/link";

const columns = [
  {
    title: "MAISON",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/about", label: "Craftsmanship" },
      { href: "/blog", label: "The Journal" },
      { href: "/contact", label: "Careers" },
    ],
  },
  {
    title: "CLIENT CARE",
    links: [
      { href: "/contact", label: "Contact Us" },
      { href: "/contact", label: "Book an Appointment" },
      { href: "/contact", label: "Shipping & Returns" },
      { href: "/contact", label: "Product Care" },
    ],
  },
  {
    title: "DISCOVER",
    links: [
      { href: "/", label: "High Jewellery" },
      { href: "/", label: "Watches" },
      { href: "/", label: "Collections" },
      { href: "/", label: "Gifts" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 pb-10 pt-16 text-white md:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Newsletter / brand */}
          <div className="md:col-span-1">
            <span className="font-serif text-xl font-light tracking-[0.4em]">
              ÉLORIS
            </span>
            <p className="mt-4 max-w-xs font-sans text-[11px] leading-relaxed tracking-[0.15em] text-white/50">
              Sign up to receive news of our latest collections, events and
              exclusive private viewings.
            </p>
            <form className="mt-5 flex items-center border-b border-white/30 pb-2">
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full bg-transparent font-sans text-xs tracking-[0.15em] text-white placeholder-white/40 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="ml-3 text-white/70 transition-colors hover:text-gold-200"
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
                    d="M5 12h14m-6-6 6 6-6 6"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-sans text-[11px] font-medium tracking-[0.3em] text-white/80">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link, i) => (
                  <li key={`${link.label}-${i}`}>
                    <Link
                      href={link.href}
                      className="font-sans text-xs tracking-[0.1em] text-white/50 transition-colors hover:text-gold-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 border-t border-white/10 pt-8 md:flex-row md:justify-between">
          <p className="font-sans text-[10px] tracking-[0.2em] text-white/40">
            &copy; {new Date().getFullYear()} ÉLORIS USA. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 font-sans text-[10px] tracking-[0.2em] text-white/40">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
