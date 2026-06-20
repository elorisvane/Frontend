"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface Section {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

const sections: Section[] = [
  {
    id: "cast",
    title: "A CUTTING-EDGE CAST",
    subtitle: "DISCOVER THE COUNTRYSIDE",
    image: "/assets/1 (1).png",
  },
  {
    id: "category",
    title: "JEWELLERY BY CATEGORY",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (3).png",
  },
  {
    id: "collection",
    title: "JEWELLERY BY COLLECTION",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (5).png",
  },
  {
    id: "high-jewellery",
    title: "HIGH JEWELLERY",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (4).png",
  },
  {
    id: "watch",
    title: "WATCH",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (7).png",
  },
  {
    id: "brooch",
    title: "BROOCH",
    subtitle: "DISCOVER THE CAMPAIGN",
    image: "/assets/1 (2).png",
  },
];

const galleryImages = [
  { src: "/assets/1 (2).png", alt: "Diamond earring" },
  { src: "/assets/1 (5).png", alt: "Gold chain necklace" },
  { src: "/assets/1 (6).png", alt: "Sculpted ring" },
];

/** Animated vertical loading indicator (Lottie) shown beneath each caption.
 *  Falls back to no animation when the visitor prefers reduced motion. */
function DotIndicator() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let cancelled = false;
    let anim: { destroy: () => void } | undefined;

    // lottie-web touches `document` at import time, so load it lazily on the
    // client only — never during SSR.
    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !node) return;
      const animate = !window.matchMedia(REDUCED_MOTION).matches;
      anim = lottie.loadAnimation({
        container: node,
        renderer: "svg",
        loop: animate,
        autoplay: animate,
        path: "/assets/loader.json",
      });
    });

    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, []);

  return <div ref={containerRef} className="mt-4 h-8 w-[5px]" aria-hidden />;
}

/** Full-bleed campaign image with its gradient scrim and bottom caption.
 *  Shared by both the static (fallback) and the scroll-reveal layouts. */
function CampaignArtwork({
  section,
  eager,
}: {
  section: Section;
  eager: boolean;
}) {
  return (
    <>
      <Image
        src={section.image}
        alt={section.title}
        fill
        preload={eager}
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Subtle gradient so the caption stays legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-16 text-center md:pb-20">
        <h2 className="font-sans text-lg font-medium uppercase tracking-[0.35em] pl-[0.35em] text-white drop-shadow-sm md:text-xl">
          {section.title}
        </h2>
        <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.4em] pl-[0.4em] text-white/70">
          {section.subtitle}
        </p>
        <DotIndicator />
      </div>
    </>
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Subscribe to changes in the visitor's reduced-motion preference. */
function subscribeMotionPreference(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Client: enable the reveal only when motion is allowed. */
function getMotionAllowed() {
  return !window.matchMedia(REDUCED_MOTION).matches;
}

/** Server / first paint: render the static fallback (no client-only APIs). */
function getMotionAllowedOnServer() {
  return false;
}

export default function Home() {
  // `false` during SSR + hydration (matching the static fallback markup), then
  // `true` on the client when motion is allowed. useSyncExternalStore keeps the
  // swap hydration-safe and re-evaluates if the OS preference changes.
  const revealEnabled = useSyncExternalStore(
    subscribeMotionPreference,
    getMotionAllowed,
    getMotionAllowedOnServer,
  );
  const stackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Slide-up cover: as the page scrolls through the pinned stack, each next
  // image slides up from below and fully covers the current one, so the
  // incoming photo settles cleanly into place (later panels sit on top).
  useEffect(() => {
    if (!revealEnabled) return;
    const stack = stackRef.current;
    if (!stack) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // One "unit" of scroll == one panel; derive it from the container so the
      // math stays consistent across vh/dvh differences on mobile.
      const unit = stack.offsetHeight / sections.length || 1;
      const scrolled = -stack.getBoundingClientRect().top;
      const segment = scrolled / unit;

      const panels = panelRefs.current;
      for (let i = 0; i < panels.length; i++) {
        const el = panels[i];
        if (!el) continue;
        // Panel i waits one screen below, then slides up to 0 (covering the
        // previous image) as the scroll passes through its segment. Panel 0 is
        // the base layer and never moves.
        const offset = Math.min(1, Math.max(0, i - segment)) * 100;
        el.style.transform = `translate3d(0, ${offset}%, 0)`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [revealEnabled]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header transparent />

      {/* --- FULL-SCREEN CAMPAIGN SECTIONS --- */}
      <main>
        {revealEnabled ? (
          /* Scroll-reveal: a tall scroll track with a pinned viewport-height
             frame holding every campaign image stacked on top of one another. */
          <div
            ref={stackRef}
            className="relative"
            style={{ height: `${sections.length * 100}vh` }}
          >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
              {sections.map((section, i) => (
                <div
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                  className="absolute inset-0 overflow-hidden will-change-transform"
                  style={{
                    zIndex: i,
                    // Resting state for scroll position 0: panel 0 is shown,
                    // the rest wait one screen below until JS scrubs them up.
                    transform: `translate3d(0, ${i === 0 ? 0 : 100}%, 0)`,
                  }}
                >
                  <CampaignArtwork section={section} eager={i === 0} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Fallback (no JS / reduced motion): the original one-by-one snap. */
          sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className="relative flex h-screen w-full snap-start flex-col items-center justify-end overflow-hidden"
            >
              <CampaignArtwork section={section} eager={i === 0} />
            </section>
          ))
        )}

        {/* --- BOTTOM GALLERY --- */}
        <section className="grid grid-cols-1 gap-[2px] bg-[#0d0d0d] md:grid-cols-3 snap-start">
          {galleryImages.map((img) => (
            <div
              key={img.src}
              className="group relative aspect-[3/4] overflow-hidden"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
