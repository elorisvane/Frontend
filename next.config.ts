import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Prefer AVIF (sharper at a given file size than WebP) and fall back to
    // WebP — crisper jewellery photos for the same bandwidth.
    formats: ["image/avif", "image/webp"],
    // Next 16 restricts allowed quality values to [75] by default and coerces
    // anything else down. Allow higher fidelity for these detail-rich photos;
    // components request 90 for content and 100 for the product close-up.
    qualities: [75, 90, 100],
    // The Admin uploads home / product / journal imagery to Supabase Storage,
    // so allow next/image to optimize from any Supabase project's public
    // storage bucket. (Local /public paths and the home page's plain-<img>
    // remote fallback are unaffected.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
