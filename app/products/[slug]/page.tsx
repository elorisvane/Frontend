import type { Metadata } from "next";
import ProductDetail from "../../src/pages/product-detail";
import { getProduct, products } from "../../src/data/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Creations | ÉLORIS" };
  return { title: `${product.name} | ÉLORIS`, description: product.tagline };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
