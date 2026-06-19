import type { Metadata } from "next";
import Contact from "../src/pages/contact";

export const metadata: Metadata = {
  title: "Contact Us | ÉLORIS",
  description: "Reach our client advisors or visit an ÉLORIS boutique.",
};

export default function Page() {
  return <Contact />;
}
