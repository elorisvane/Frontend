import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./src/components/Providers";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "./src/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Self-hosted Futura PT from public/font (paths resolve relative to this file)
const futura = localFont({
  variable: "--font-futura",
  display: "swap",
  src: [
    {
      path: "../public/font/FuturaPT-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/font/FuturaPT-LightObl.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/font/FuturaPT-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/FuturaPT-BookObl.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/font/FuturaPT-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/font/FuturaPT-MediumObl.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/font/FuturaPT-Demi.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/font/FuturaPT-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/font/FuturaPT-BoldObl.woff2",
      weight: "700",
      style: "italic",
    },
  ],
});

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ÉLORIS | High Jewellery, Watches & Signature Creations",
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  // Browser tab / bookmark / home-screen icon — the ÉLORIS logo. SVG first for
  // crisp modern browsers, PNG as a fallback; Apple touch icon must be raster.
  icons: {
    icon: [
      { url: "/logo/tab-icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/logo/tab-icon.png", type: "image/png", sizes: "118x118" },
    ],
    shortcut: "/logo/tab-icon.png",
    apple: "/logo/tab-icon.png",
  },
  keywords: [
    "ÉLORIS",
    "High Jewellery",
    "Luxury Watches",
    "Fine Jewellery",
    "Savoir-faire",
    "Maison ÉLORIS",
    "Diamonds",
    "Emeralds",
    "Sapphires",
    "Gold Jewellery",
  ],
  openGraph: {
    title: "ÉLORIS | High Jewellery, Watches & Signature Creations",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ÉLORIS | High Jewellery, Watches & Signature Creations",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${futura.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
