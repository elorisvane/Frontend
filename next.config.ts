import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
