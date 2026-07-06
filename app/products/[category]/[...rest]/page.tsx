import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProductDetail from "../../../src/pages/product-detail";
import {
  getProduct,
  getProducts,
  productPath,
} from "../../../src/data/products";

export const dynamic = "force-dynamic";

// The product slug is always the last segment of the tail — the path may be
// /products/<category>/<slug> or /products/<category>/<subcategory>/<slug>.
function slugFromRest(rest: string[]): string {
  return rest[rest.length - 1] ?? "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; rest: string[] }>;
}): Promise<Metadata> {
  const { rest } = await params;
  const product = await getProduct(slugFromRest(rest));
  if (!product) return { title: "Creations | ÉLORIS" };
  return { title: `${product.name} | ÉLORIS`, description: product.tagline };
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string; rest: string[] }>;
}) {
  const { category, rest } = await params;
  const product = await getProduct(slugFromRest(rest));
  if (!product) notFound();

  // Keep the URL canonical: if the category / sub-category segments don't match
  // the piece's real taxonomy (an old, hand-typed, or 2-level link for a piece
  // that now has a sub-category), redirect to the correct path.
  const current = `/products/${category}/${rest.join("/")}`;
  if (productPath(product) !== current) {
    redirect(productPath(product));
  }

  const all = await getProducts();
  const related = all.filter((p) => p.slug !== product.slug).slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
