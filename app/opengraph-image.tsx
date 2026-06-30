import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "./src/lib/site";

// Social-share card shown when an eloris.shop link is posted to WhatsApp,
// Instagram, X, Facebook, iMessage, etc. Next auto-adds the og:image (and
// twitter:image falls back to it) tags for every route from this file.
export const alt = "ÉLORIS — High Jewellery, Watches & Signature Creations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Satori (the engine behind ImageResponse) needs ttf/otf/woff — not woff2 —
  // so load the bundled Futura PT .ttf files for an on-brand card.
  const [demi, book] = await Promise.all([
    readFile(join(process.cwd(), "public/font/FuturaPT-Demi.ttf")),
    readFile(join(process.cwd(), "public/font/FuturaPT-Book.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontFamily: "Futura",
            fontWeight: 600,
            fontSize: 150,
            letterSpacing: 22,
            paddingLeft: 22,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: "Futura",
            fontWeight: 400,
            fontSize: 28,
            letterSpacing: 8,
            paddingLeft: 8,
            color: "#a3a3a3",
          }}
        >
          HIGH JEWELLERY · WATCHES · SIGNATURE CREATIONS
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Futura", data: demi, style: "normal", weight: 600 },
        { name: "Futura", data: book, style: "normal", weight: 400 },
      ],
    },
  );
}
