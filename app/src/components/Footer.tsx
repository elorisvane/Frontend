import Link from "next/link";
import CurrencySwitcher from "./CurrencySwitcher";
import NewsletterSignup from "./NewsletterSignup";

const columns = [
  {
    title: "CONTACT US",
    links: [
      { href: "/products", label: "Jewelry" },
      { href: "/products", label: "High Jewelry" },
      { href: "/about", label: "The Maison" },
      { href: "/contact", label: "Our Boutiques" },
    ],
  },
  {
    title: "CUSTOMER SERVICE",
    links: [
      { href: "/contact", label: "Contact Us" },
      { href: "/contact", label: "Delivery & Returns" },
      { href: "/account", label: "My Account" },
      { href: "/contact", label: "Advice & Services" },
      { href: "/contact", label: "Any Question?" },
    ],
  },
  {
    title: "SHOP",
    links: [{ href: "/contact", label: "Find a Boutique" }],
  },
];

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/eloris_offical",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
      />
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
        <path
          d="M10.5 9.2v5.6l4.8-2.8-4.8-2.8Z"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),
  },
  {
    label: "Pinterest",
    href: "#",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path
          strokeLinecap="round"
          d="M9.5 20c.6-2 .4-2.6 1.4-6.6.3-1.2-.3-2.3-.3-2.9 0-1.4.8-2.4 1.9-2.4.9 0 1.4.7 1.4 1.6 0 1-.6 2.4-1 3.7-.3 1.1.5 2 1.6 2 1.9 0 3.2-2.5 3.2-5.3 0-2.2-1.5-3.9-4.2-3.9-3 0-4.9 2.3-4.9 4.8 0 .9.3 1.5.7 2 .2.2.2.3.1.6l-.2.9"
        />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <>
      <NewsletterSignup />
      <footer className="border-t border-white/10 bg-black px-6 pb-10 pt-16 text-white md:px-12">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 md:gap-12">
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
                        className="font-sans text-xs tracking-[0.1em] text-white/50 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Follow us (newsletter now lives in the bar above the footer) */}
            <div>
              <h3 className="font-sans text-[11px] font-medium tracking-[0.3em] text-white/80">
                FOLLOW US
              </h3>
              <p className="mt-5 max-w-xs font-sans text-xs leading-relaxed tracking-[0.1em] text-white/50">
                Follow the maison for our latest collections, events and private
                viewings.
              </p>

              {/* Social icons */}
              <div className="mt-6 flex items-center gap-5">
                {socials.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="text-white/50 transition-colors hover:text-white"
                  >
                    <svg
                      className="h-[18px] w-[18px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      viewBox="0 0 24 24"
                    >
                      {s.icon}
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center gap-5 border-t border-white/10 pt-8 md:flex-row md:justify-between">
            <p className="order-2 text-center font-sans text-[10px] tracking-[0.25em] text-white/40 md:order-1 md:text-left">
              ÉLORIS, Inc. {new Date().getFullYear()} All rights reserved.{" "}
              <Link
                href="https://mobintix.app"
                className="font-sans text-[10px] tracking-[0.25em] text-white/40 underline"
              >
                Mobintix Infotech
              </Link>
            </p>
            <CurrencySwitcher
              className="order-1 md:order-2"
              menuPlacement="up"
            />
          </div>
        </div>
      </footer>
    </>
  );
}
