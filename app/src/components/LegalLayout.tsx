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
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-36 md:pt-44">
        {/* Title */}
        <div className="border-b border-neutral-200 pb-10 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-neutral-500">
            Legal
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.12em] md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 font-sans text-[10px] tracking-[0.25em] text-neutral-400">
            LAST UPDATED: {lastUpdated}
          </p>
        </div>

        {/* Intro */}
        <p className="mt-12 font-sans text-[15px] leading-loose tracking-[0.03em] text-neutral-600">
          {intro}
        </p>

        {/* Sections */}
        <div className="mt-12 space-y-12">
          {sections.map((section, i) => (
            <div key={section.heading}>
              <h2 className="font-serif text-2xl font-light tracking-[0.06em] text-neutral-900">
                {i + 1}. {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((para, j) => (
                  <p
                    key={j}
                    className="font-sans text-[15px] leading-loose tracking-[0.03em] text-neutral-600"
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
