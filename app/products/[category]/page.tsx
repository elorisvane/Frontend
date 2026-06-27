import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Products from "../../src/pages/products";
import {
  getProducts,
  categorySlug,
  productPath,
} from "../../src/data/products";
import { getProductsMedia } from "../../src/data/home";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const products = await getProducts();
  const label = products.find((p) => categorySlug(p.category) === category)
    ?.category;
  return {
    title: label
      ? `${label.charAt(0) + label.slice(1).toLowerCase()} | ÉLORIS`
      : "Creations | ÉLORIS",
    description: "Discover the ÉLORIS collection.",
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const [products, media] = await Promise.all([
    getProducts(),
    getProductsMedia(),
  ]);

  // Back-compat: an old single-segment product URL (/products/<slug>) lands
  // here — send it on to its canonical /products/<category>/<slug> path.
  const asProduct = products.find((p) => p.slug === category);
  if (asProduct) redirect(productPath(asProduct));

  const label = products.find((p) => categorySlug(p.category) === category)
    ?.category;
  if (!label) notFound();

  return (
    <Products
      products={products}
      activeCategory={label}
      heroMedia={media.hero}
      gridMedia={media.grid}
    />
  );
}
