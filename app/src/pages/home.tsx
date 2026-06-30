"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StoreAdvantages from "../components/StoreAdvantages";
import type { CampaignSection, GalleryItem, MediaType } from "../data/home";

/** Remote URLs need a `remotePatterns` allow-list to pass through next/image, so
 *  render those with a plain <img>; local /public paths get next/image. */
function isRemote(src: string) {
  return /^https?:\/\//i.test(src);
}

/** Renders an image or video that fills its (positioned) parent. Used for both
 *  the full-screen campaign panels and the gallery strip. */
function FillMedia({
  src,
  alt,
  mediaType,
  poster,
  eager = false,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  mediaType: MediaType;
  poster?: string;
  eager?: boolean;
  sizes: string;
  className: string;
}) {
  if (mediaType === "video") {
    return (
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }
  if (isRemote(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      preload={eager}
      quality={90}
      sizes={sizes}
      className={className}
    />
  );
}

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

/** Wraps children in a link when `href` is set, otherwise a plain element.
 *  External (http) URLs open in a new tab; relative paths navigate in place. */
function MaybeLink({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) return <div className={className}>{children}</div>;
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/** Full-bleed campaign image with its gradient scrim and bottom caption.
 *  Shared by both the static (fallback) and the scroll-reveal layouts. */
function CampaignArtwork({
  section,
  eager,
}: {
  section: CampaignSection;
  eager: boolean;
}) {
  return (
    <>
      <FillMedia
        src={section.src}
        alt={section.title}
        mediaType={section.mediaType}
        poster={section.poster}
        eager={eager}
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Subtle gradient so the caption stays legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-16 text-center md:pb-20">
        <MaybeLink
          href={section.linkUrl}
          className="flex flex-col items-center transition-opacity hover:opacity-80"
        >
          <h2 className="font-sans text-2xl md:text-[30px] font-medium uppercase tracking-wider text-white drop-shadow-sm">
            {section.title}
          </h2>
          <p className="mt-3 font-sans text-[10px] uppercase tracking-wider text-white underline underline-offset-4 transition-opacity hover:opacity-70">
            {section.subtitle}
          </p>
        </MaybeLink>
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

export default function Home({
  sections,
  gallery,
}: {
  sections: CampaignSection[];
  gallery: GalleryItem[];
}) {
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

  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);

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
  }, [revealEnabled, sections.length]);

  // Scroll-bound horizontal translation for the desktop gallery
  useEffect(() => {
    const container = galleryContainerRef.current;
    const track = galleryTrackRef.current;
    if (!container || !track) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      if (window.innerWidth < 768) {
        track.style.transform = "";
        return;
      }

      const rect = container.getBoundingClientRect();
      const scrolled = -rect.top;
      const maxScroll = container.offsetHeight - window.innerHeight;

      if (maxScroll <= 0) return;

      const progress = Math.min(1, Math.max(0, scrolled / maxScroll));
      const maxTrackScroll = track.scrollWidth - window.innerWidth;
      
      if (maxTrackScroll <= 0) {
        track.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      track.style.transform = `translate3d(${-progress * maxTrackScroll}px, 0, 0)`;
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
  }, [gallery]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header transparent />

      {/* --- FULL-SCREEN CAMPAIGN SECTIONS --- */}
      <main>
        {/* MOBILE — full-screen vertical swipe. Each campaign image fills the
            screen and snaps cleanly into place ("magnet"), so the page never
            rests on a half image mid-scroll. The desktop scroll-reveal (below)
            is what caused the half-image effect on phones, so mobile uses a
            plain scroll-snap carousel instead. */}
        <div className="no-scrollbar h-[100dvh] snap-y snap-mandatory overflow-y-auto md:hidden">
          {sections.map((section, i) => (
            <section
              key={section.id}
              className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden"
            >
              <CampaignArtwork section={section} eager={i === 0} />
            </section>
          ))}
        </div>

        {/* DESKTOP — the scroll-reveal stack (or reduced-motion fallback). */}
        <div className="hidden md:block">
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
        </div>

        {/* --- BOTTOM GALLERY --- */}
        <section
          ref={galleryContainerRef}
          className="relative w-full md:h-[250vh] bg-white"
        >
          {/* Mobile scroll strip */}
          <div className="no-scrollbar flex snap-x snap-mandatory gap-[2px] overflow-x-auto md:hidden">
            {gallery.map((item) => (
              <MaybeLink
                key={item.id}
                href={item.linkUrl}
                className="group relative block aspect-[839/1075] w-[85vw] shrink-0 snap-start overflow-hidden"
              >
                <FillMedia
                  src={item.src}
                  alt={item.alt}
                  mediaType={item.mediaType}
                  poster={item.poster}
                  sizes="85vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {item.alt && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-12 z-10 px-4 text-center font-sans text-[40px] font-medium leading-[30px] tracking-normal text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
                    {item.alt}
                  </span>
                )}
              </MaybeLink>
            ))}
          </div>

          {/* Desktop full-bleed/scroll track */}
          <div className="hidden md:block sticky top-0 h-screen w-full overflow-hidden">
            <div
              ref={galleryTrackRef}
              className="flex h-full items-center gap-[2px] will-change-transform"
              style={{ width: "max-content" }}
            >
              {gallery.map((item) => (
                <MaybeLink
                  key={item.id}
                  href={item.linkUrl}
                  className="group relative block h-screen aspect-[839/1075] shrink-0 overflow-hidden"
                >
                  <FillMedia
                    src={item.src}
                    alt={item.alt}
                    mediaType={item.mediaType}
                    poster={item.poster}
                    sizes="50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {item.alt && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-12 z-10 px-4 text-center font-sans text-[40px] font-medium leading-[30px] tracking-normal text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
                      {item.alt}
                    </span>
                  )}
                </MaybeLink>
              ))}
            </div>
          </div>
        </section>
      </main>
      <StoreAdvantages />
      <Footer />
    </div>
  );
}
