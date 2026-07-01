const DEFAULT_HEADING = "Something extraordinary is coming";
const DEFAULT_MESSAGE =
  "Our new collection is being crafted with the utmost care. Please return shortly to discover the Maison ÉLORIS.";

/**
 * Full-screen Coming Soon page shown while the storefront is locked (toggled
 * from the Admin's Site Availability screen). Self-contained — it deliberately
 * renders no header, footer, or navigation, so the rest of the site stays
 * sealed off.
 */
export default function ComingSoon({
  heading,
  message,
}: {
  heading?: string;
  message?: string;
}) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-6 text-center text-white">
      <div className="animate-fade-in-up flex flex-col items-center">
        <p className="font-serif text-4xl tracking-[0.4em] sm:text-6xl">
          ÉLORIS
        </p>
        <span className="mt-6 block h-px w-16 bg-white/30" />

        <h1 className="mt-10 max-w-2xl font-serif text-2xl font-light leading-snug sm:text-4xl">
          {heading?.trim() || DEFAULT_HEADING}
        </h1>

        <p className="mt-6 max-w-md font-sans text-sm leading-relaxed tracking-[0.1em] text-white/60">
          {message?.trim() || DEFAULT_MESSAGE}
        </p>

        <p className="mt-14 font-sans text-[10px] uppercase tracking-[0.35em] text-white/40">
          Opening soon
        </p>
      </div>
    </main>
  );
}
