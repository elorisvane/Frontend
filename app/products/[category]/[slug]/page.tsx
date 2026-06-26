import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProductDetail from "../../../src/pages/product-detail";
import {
  getProduct,
  getProducts,
  categorySlug,
  productPath,
} from "../../../src/data/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Creations | ÉLORIS" };
  return { title: `${product.name} | ÉLORIS`, description: product.tagline };
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // Keep the URL canonical: if the category segment doesn't match the piece's
  // real category (e.g. an old or hand-typed link), redirect to the right path.
  if (categorySlug(product.category) !== category) {
    redirect(productPath(product));
  }

  const all = await getProducts();
  const related = all.filter((p) => p.slug !== product.slug).slice(0, 3);

  return <ProductDetail product={product} related={related} />;
}
