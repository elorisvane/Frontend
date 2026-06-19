import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

const values = [
  {
    title: "HERITAGE",
    text: "Founded on a singular vision of timeless elegance, the maison has spent decades refining an unmistakable signature.",
  },
  {
    title: "CRAFTSMANSHIP",
    text: "Every creation is shaped entirely by hand in our ateliers, where tradition and precision meet in quiet harmony.",
  },
  {
    title: "RESPONSIBILITY",
    text: "We source our gemstones and precious metals with uncompromising care for the people and places they come from.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header transparent />

      {/* --- HERO --- */}
      <section className="relative flex h-[80vh] w-full items-end justify-center overflow-hidden">
        <Image
          src="/assets/1 (3).png"
          alt="The ÉLORIS maison"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="relative z-10 pb-20 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-200">
            The Maison
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            Our Story
          </h1>
        </div>
      </section>

      {/* --- INTRO --- */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-serif text-2xl font-light leading-relaxed tracking-[0.04em] text-white/90 md:text-3xl">
          &ldquo;We do not follow time. We create pieces that defy it.&rdquo;
        </p>
        <p className="mt-8 font-sans text-sm leading-loose tracking-[0.05em] text-white/60">
          ÉLORIS was born from a belief that true luxury is felt, not merely seen. From a
          modest atelier to a name spoken in the same breath as the world&rsquo;s great
          houses, our journey has been guided by one principle — that beauty, made with
          patience and intention, becomes eternal.
        </p>
      </section>

      {/* --- VALUES --- */}
      <section className="border-y border-white/10 bg-black/40 px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="text-center md:text-left">
              <h2 className="font-sans text-xs font-medium tracking-[0.35em] text-gold-200">
                {v.title}
              </h2>
              <p className="mt-5 font-sans text-sm leading-loose tracking-[0.04em] text-white/60">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- SPLIT FEATURE --- */}
      <section className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 md:px-12">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="/assets/1 (6).png"
            alt="Inside the atelier"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="md:pl-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-200">
            The Atelier
          </p>
          <h2 className="mt-4 font-serif text-3xl font-light tracking-[0.1em] md:text-4xl">
            Where hands shape history
          </h2>
          <p className="mt-6 font-sans text-sm leading-loose tracking-[0.04em] text-white/60">
            Behind every ÉLORIS creation stands a community of artisans — gem-setters,
            polishers, designers and goldsmiths — who devote their lives to a single
            pursuit. It is here, in the quiet of the workshop, that raw materials are
            transformed into objects of lasting wonder.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block border border-white/40 px-8 py-3 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:border-gold-200 hover:text-gold-200"
          >
            VISIT US
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
