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

/** Thin vertical three-dot indicator shown beneath each caption. */
function DotIndicator() {
  return (
    <span className="mt-4 flex flex-col items-center gap-[3px]" aria-hidden>
      <span className="h-[3px] w-[3px] rounded-full bg-white/80" />
      <span className="h-[3px] w-[3px] rounded-full bg-white/80" />
      <span className="h-[3px] w-[3px] rounded-full bg-white/80" />
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header transparent />

      {/* --- FULL-SCREEN CAMPAIGN SECTIONS --- */}
      <main>
        {sections.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            className="relative flex h-screen w-full snap-start flex-col items-center justify-end overflow-hidden"
          >
            <Image
              src={section.image}
              alt={section.title}
              fill
              preload={i === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Subtle gradient so the caption stays legible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="relative z-10 flex flex-col items-center pb-16 text-center md:pb-20">
              <h2 className="font-sans text-lg font-medium uppercase tracking-[0.35em] text-white drop-shadow-sm md:text-xl">
                {section.title}
              </h2>
              <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.4em] text-white/70">
                {section.subtitle}
              </p>
              <DotIndicator />
            </div>
          </section>
        ))}

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
