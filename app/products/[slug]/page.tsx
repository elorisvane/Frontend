import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "../../src/pages/product-detail";
import { getProduct, getProducts } from "../../src/data/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Creations | ÉLORIS" };
  return { title: `${product.name} | ÉLORIS`, description: product.tagline };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = all.filter((p) => p.slug !== product.slug).slice(0, 3);

  return <ProductDetail product={product} related={related} />;
}
