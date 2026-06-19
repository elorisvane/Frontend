import Header from "./Header";
import Footer from "./Footer";

export interface LegalSection {
  heading: string;
  /** Each entry is rendered as its own paragraph. */
  paragraphs: string[];
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalLayout({
  title,
  lastUpdated,
  intro,
  sections,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header />

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-36 md:pt-44">
        {/* Title */}
        <div className="border-b border-white/10 pb-10 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-200">
            Legal
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.12em] md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 font-sans text-[10px] tracking-[0.25em] text-white/40">
            LAST UPDATED: {lastUpdated}
          </p>
        </div>

        {/* Intro */}
        <p className="mt-12 font-sans text-[15px] leading-loose tracking-[0.03em] text-white/70">
          {intro}
        </p>

        {/* Sections */}
        <div className="mt-12 space-y-12">
          {sections.map((section, i) => (
            <div key={section.heading}>
              <h2 className="font-serif text-2xl font-light tracking-[0.06em] text-white">
                {i + 1}. {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((para, j) => (
                  <p
                    key={j}
                    className="font-sans text-[15px] leading-loose tracking-[0.03em] text-white/65"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
