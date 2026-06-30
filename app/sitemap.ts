import type { MetadataRoute } from "next";
import {
  getProducts,
  productPath,
  categorySlug,
  type Product,
} from "./src/data/products";
import { getPosts, type Post } from "./src/data/posts";
import { SITE_URL } from "./src/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Fetch dynamic products and blog posts
  let products: Product[] = [];
  let posts: Post[] = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error("Failed to fetch products for sitemap:", err);
  }

  try {
    posts = await getPosts();
  } catch (err) {
    console.error("Failed to fetch posts for sitemap:", err);
  }

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Category index pages (/products/<category>), one per distinct category.
  const categoryRoutes = [
    ...new Set(products.map((p) => categorySlug(p.category))),
  ].map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Map products to sitemap items (/products/<category>/<slug>)
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}${productPath(product)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Map posts to sitemap items
  const postRoutes = posts.map((post) => {
    let parsedDate = new Date();
    try {
      if (post.date) {
        parsedDate = new Date(post.date);
      }
    } catch {
      // fallback to current date
    }
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: parsedDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...postRoutes];
}
