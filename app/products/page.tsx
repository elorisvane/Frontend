import type { Metadata } from "next";
import Products from "../src/pages/products";

export const metadata: Metadata = {
  title: "Creations | ÉLORIS",
  description: "Discover the ÉLORIS collection of high jewellery, watches and signature creations.",
};

export default function Page() {
  return <Products />;
}
