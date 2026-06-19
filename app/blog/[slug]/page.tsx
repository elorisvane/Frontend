import type { Metadata } from "next";
import BlogPost from "../../src/pages/Blog/blogpost";
import { getPost, posts } from "../../src/data/posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Journal | ÉLORIS" };
  return { title: `${post.title} | ÉLORIS`, description: post.excerpt };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPost slug={slug} />;
}
