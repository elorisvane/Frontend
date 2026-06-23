import type { Metadata } from "next";
import Blog from "../src/pages/Blog/blog";
import { getPosts } from "../src/data/posts";

export const metadata: Metadata = {
  title: "The Journal | ÉLORIS",
  description: "Stories and insights from the world of ÉLORIS high jewellery.",
};

// Read the latest admin-managed journal on every request.
export const dynamic = "force-dynamic";

export default async function Page() {
  const posts = await getPosts();
  return <Blog posts={posts} />;
}
