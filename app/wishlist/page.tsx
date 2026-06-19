import type { Metadata } from "next";
import Wishlist from "../src/pages/wishlist";

export const metadata: Metadata = {
  title: "My Wishlist | ÉLORIS",
  description: "The ÉLORIS creations you have saved to revisit and share.",
};

export default function Page() {
  return <Wishlist />;
}
