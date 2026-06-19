import type { Metadata } from "next";
import TermsOfService from "../src/pages/Privacy Policy/terms-of-service";

export const metadata: Metadata = {
  title: "Terms of Service | ÉLORIS",
  description: "The terms governing your use of the ÉLORIS website and services.",
};

export default function Page() {
  return <TermsOfService />;
}
