import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/bag", "/wishlist"],
    },
    sitemap: "https://eloris.com/sitemap.xml",
  };
}
