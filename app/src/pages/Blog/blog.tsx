import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { Post } from "../../data/posts";

export default function Blog({ posts }: { posts: Post[] }) {
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-gold-200 selection:text-black">
      <Header light />

      <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        {/* Title */}
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-neutral-500">
            Stories &amp; Insights
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            The Journal
          </h1>
        </div>

        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group mt-20 grid grid-cols-1 items-center gap-10 md:grid-cols-2"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              priority
              quality={90}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
          <div>
            <span className="font-sans text-[10px] tracking-[0.35em] text-neutral-500">
              {featured.category}
            </span>
            <h2 className="mt-4 font-serif text-3xl font-light leading-snug tracking-[0.04em] md:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-5 font-sans text-sm leading-loose tracking-[0.04em] text-neutral-500">
              {featured.excerpt}
            </p>
            <p className="mt-6 font-sans text-[10px] tracking-[0.25em] text-neutral-400">
              {featured.date} &middot; {featured.readTime}
            </p>
            <span className="mt-6 inline-block border-b border-neutral-300 pb-1 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors group-hover:border-neutral-900 group-hover:text-neutral-500">
              READ ARTICLE
            </span>
          </div>
        </Link>

        {/* Grid of remaining posts */}
        <div className="mt-24 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  quality={90}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <span className="mt-5 block font-sans text-[10px] tracking-[0.35em] text-neutral-500">
                {post.category}
              </span>
              <h3 className="mt-3 font-serif text-2xl font-light leading-snug tracking-[0.04em]">
                {post.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed tracking-[0.04em] text-neutral-500">
                {post.excerpt}
              </p>
              <p className="mt-4 font-sans text-[10px] tracking-[0.25em] text-neutral-400">
                {post.date} &middot; {post.readTime}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
