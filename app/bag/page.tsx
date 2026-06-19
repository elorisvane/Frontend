import type { Metadata } from "next";
import Bag from "../src/pages/bag";

export const metadata: Metadata = {
  title: "Shopping Bag | ÉLORIS",
  description: "Review the pieces in your ÉLORIS shopping bag.",
};

export default function Page() {
  return <Bag />;
}
