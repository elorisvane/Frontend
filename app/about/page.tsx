import type { Metadata } from "next";
import About from "../src/pages/about";

export const metadata: Metadata = {
  title: "Our Story | ÉLORIS",
  description: "Discover the heritage, craftsmanship and values of the ÉLORIS maison.",
};

export default function Page() {
  return <About />;
}
