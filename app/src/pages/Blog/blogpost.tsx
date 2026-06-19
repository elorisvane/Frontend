import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getPost, posts } from "../../data/posts";

interface BlogPostProps {
  slug: string;
}

export default function BlogPost({ slug }: BlogPostProps) {
  const post = getPost(slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header transparent />

      {/* --- HERO --- */}
      <section className="relative flex h-[70vh] w-full items-end justify-center overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        <div className="relative z-10 max-w-3xl px-6 pb-16 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] text-gold-200">
            {post.category}
          </span>
          <h1 className="mt-5 font-serif text-4xl font-light leading-tight tracking-[0.05em] md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 font-sans text-[10px] tracking-[0.25em] text-white/60">
            {post.date} &middot; {post.readTime}
          </p>
        </div>
      </section>

      {/* --- ARTICLE BODY --- */}
      <article className="mx-auto max-w-2xl px-6 py-20">
        <p className="font-serif text-2xl font-light leading-relaxed tracking-[0.03em] text-white/90">
          {post.excerpt}
        </p>
        <div className="mt-10 space-y-7">
          {post.body.map((para, i) => (
            <p
              key={i}
              className="font-sans text-[15px] leading-loose tracking-[0.03em] text-white/70"
            >
              {para}
            </p>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center">
          <Link
            href="/blog"
            className="font-sans text-[11px] tracking-[0.3em] text-white/60 transition-colors hover:text-gold-200"
          >
            &larr; BACK TO THE JOURNAL
          </Link>
        </div>
      </article>

      {/* --- RELATED --- */}
      <section className="border-t border-white/10 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="text-center font-sans text-xs font-medium tracking-[0.35em] text-white/80">
            CONTINUE READING
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-3">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <span className="mt-4 block font-sans text-[10px] tracking-[0.35em] text-gold-200">
                  {p.category}
                </span>
                <h3 className="mt-2 font-serif text-xl font-light leading-snug tracking-[0.04em]">
                  {p.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
