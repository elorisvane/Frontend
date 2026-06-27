import type { Metadata } from "next";
import Products from "../src/pages/products";
import { getProducts } from "../src/data/products";
import { getProductsMedia } from "../src/data/home";

export const metadata: Metadata = {
  title: "Creations | ÉLORIS",
  description: "Discover the ÉLORIS collection of high jewellery, watches and signature creations.",
};

// Read the latest admin-managed catalogue on every request.
export const dynamic = "force-dynamic";

export default async function Page() {
  const [products, media] = await Promise.all([
    getProducts(),
    getProductsMedia(),
  ]);
  return (
    <Products products={products} heroMedia={media.hero} gridMedia={media.grid} />
  );
}
