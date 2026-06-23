import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPost from "../../src/pages/Blog/blogpost";
import { getPost, getPosts } from "../../src/data/posts";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Journal | ÉLORIS" };
  return { title: `${post.title} | ÉLORIS`, description: post.excerpt };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const all = await getPosts();
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  return <BlogPost post={post} related={related} />;
}
