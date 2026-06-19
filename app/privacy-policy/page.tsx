import type { Metadata } from "next";
import PrivacyPolicy from "../src/pages/Privacy Policy/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy | ÉLORIS",
  description: "How ÉLORIS collects, uses and protects your personal information.",
};

export default function Page() {
  return <PrivacyPolicy />;
}
