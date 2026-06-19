import LegalLayout, { LegalSection } from "../../components/LegalLayout";

const sections: LegalSection[] = [
  {
    heading: "Information We Collect",
    paragraphs: [
      "We collect information you provide directly to us, such as your name, contact details, shipping and billing address, and payment information when you make a purchase, create an account, book an appointment, or contact our client services team.",
      "We also automatically collect certain information about your device and how you interact with our website, including IP address, browser type, pages viewed, and the dates and times of your visits.",
    ],
  },
  {
    heading: "How We Use Your Information",
    paragraphs: [
      "We use the information we collect to process and fulfil your orders, provide client services, personalise your experience, send you communications about our collections and events where you have consented, and improve and secure our website.",
      "We may also use your information to comply with legal obligations and to protect the rights, property and safety of ÉLORIS, our clients and others.",
    ],
  },
  {
    heading: "Sharing of Information",
    paragraphs: [
      "We do not sell your personal information. We may share it with trusted service providers who perform services on our behalf, such as payment processing, shipping and logistics, and marketing, subject to appropriate confidentiality obligations.",
      "We may disclose your information where required by law or in connection with a corporate transaction such as a merger or acquisition.",
    ],
  },
  {
    heading: "Cookies & Tracking",
    paragraphs: [
      "Our website uses cookies and similar technologies to remember your preferences, analyse site traffic, and deliver relevant content. You may manage your cookie preferences through your browser settings, though disabling certain cookies may affect site functionality.",
    ],
  },
  {
    heading: "Your Rights",
    paragraphs: [
      "Depending on your location, you may have the right to access, correct, delete, or restrict the processing of your personal information, as well as the right to data portability and to object to certain processing.",
      "To exercise any of these rights, please contact us using the details below. We will respond to your request in accordance with applicable law.",
    ],
  },
  {
    heading: "Data Security & Retention",
    paragraphs: [
      "We implement appropriate technical and organisational measures to protect your personal information. We retain your information only for as long as necessary to fulfil the purposes described in this policy, unless a longer retention period is required by law.",
    ],
  },
  {
    heading: "Contact Us",
    paragraphs: [
      "If you have any questions about this Privacy Policy or our handling of your personal information, please contact our Client Services team at care@eloris.com.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="JUNE 19, 2026"
      intro="ÉLORIS is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share and safeguard your personal information when you visit our website, purchase our products, or otherwise interact with the maison."
      sections={sections}
    />
  );
}
