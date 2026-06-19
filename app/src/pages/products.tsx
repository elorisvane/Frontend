import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { products } from "../data/products";

export default function Products() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-gold-300 selection:text-black">
      <Header />

      <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
        {/* Title */}
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-200">
            The Collection
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.15em] md:text-6xl">
            Creations
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-loose tracking-[0.04em] text-white/60">
            Each ÉLORIS piece is conceived in our ateliers and brought to life by
            hand. Discover the maison&rsquo;s high jewellery, watches and
            signature creations.
          </p>
        </div>

        {/* Product grid */}
        <div className="mt-20 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <span className="mt-5 block font-sans text-[10px] tracking-[0.35em] text-gold-200">
                {product.category}
              </span>
              <h2 className="mt-3 font-serif text-2xl font-light leading-snug tracking-[0.04em]">
                {product.name}
              </h2>
              <p className="mt-2 font-sans text-sm leading-relaxed tracking-[0.04em] text-white/55">
                {product.tagline}
              </p>
              <p className="mt-4 font-sans text-[13px] tracking-[0.15em] text-white/80">
                {product.price}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
