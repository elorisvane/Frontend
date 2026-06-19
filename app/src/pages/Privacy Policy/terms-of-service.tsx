import LegalLayout, { LegalSection } from "../../components/LegalLayout";

const sections: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    paragraphs: [
      "By accessing or using the ÉLORIS website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our website.",
    ],
  },
  {
    heading: "Use of the Website",
    paragraphs: [
      "You may use our website for lawful purposes only. You agree not to use the site in any way that could damage, disable, or impair it, or interfere with any other party's use of the website.",
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
    ],
  },
  {
    heading: "Products & Pricing",
    paragraphs: [
      "We make every effort to display our creations and their prices accurately. However, colours and details may vary by screen, and we reserve the right to correct any errors and to modify prices at any time without prior notice.",
      "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion.",
    ],
  },
  {
    heading: "Orders & Payment",
    paragraphs: [
      "By placing an order you warrant that you are legally capable of entering into binding contracts and that the payment information you provide is accurate. Payment must be received in full before an order is dispatched.",
    ],
  },
  {
    heading: "Intellectual Property",
    paragraphs: [
      "All content on this website, including text, images, designs, logos and the ÉLORIS name, is the property of ÉLORIS or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or use any content without our prior written consent.",
    ],
  },
  {
    heading: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, ÉLORIS shall not be liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, the website or our products.",
    ],
  },
  {
    heading: "Governing Law",
    paragraphs: [
      "These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which ÉLORIS USA is established, without regard to its conflict of law provisions.",
    ],
  },
  {
    heading: "Contact Us",
    paragraphs: [
      "For any questions regarding these Terms of Service, please contact our Client Services team at care@eloris.com.",
    ],
  },
];

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="JUNE 19, 2026"
      intro="Please read these Terms of Service carefully before using the ÉLORIS website. These terms govern your access to and use of our website, products and services."
      sections={sections}
    />
  );
}
