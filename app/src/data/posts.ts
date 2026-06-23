import { getSupabase } from "../lib/supabase";

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  /** Article body as an array of paragraphs. */
  body: string[];
}

/** Bundled sample journal — the fallback when Supabase is unavailable, and a
 *  lightweight static index for the client-side header search. */
export const fallbackPosts: Post[] = [
  {
    slug: "the-art-of-high-jewellery",
    title: "The Art of High Jewellery",
    excerpt:
      "Inside the ateliers where a single creation can take more than a thousand hours to perfect.",
    category: "CRAFTSMANSHIP",
    date: "June 12, 2026",
    readTime: "6 min read",
    image: "/assets/1 (4).png",
    body: [
      "High jewellery is the purest expression of the maison's savoir-faire — a discipline where time is measured not in hours, but in devotion. Each piece begins as a sketch, an idea drawn in gouache long before a single stone is set.",
      "Our master craftsmen work with gems sourced from the most exceptional mines in the world, selecting each for its fire, clarity and character. A necklace may pass through a dozen pairs of hands before it is deemed worthy of the ÉLORIS name.",
      "It is this uncompromising pursuit of perfection that transforms precious materials into objects of lasting emotion — heirlooms designed to outlive trends and be treasured for generations.",
    ],
  },
  {
    slug: "a-cutting-edge-cast",
    title: "A Cutting-Edge Cast",
    excerpt:
      "How our latest campaign reimagines the countryside through a lens of modern elegance.",
    category: "CAMPAIGN",
    date: "May 28, 2026",
    readTime: "4 min read",
    image: "/assets/1 (1).png",
    body: [
      "For our newest campaign we returned to the landscapes that have inspired the maison since its founding — sun-drenched gardens, weathered stone and the quiet luxury of the countryside.",
      "The collection plays with contrast: the softness of natural light against the precision of brilliant-cut diamonds, heritage motifs reinterpreted with a distinctly contemporary hand.",
      "The result is a portrait of effortless sophistication — jewellery made to be lived in, not locked away.",
    ],
  },
  {
    slug: "the-language-of-colour",
    title: "The Language of Colour",
    excerpt:
      "From Burmese rubies to Colombian emeralds, a meditation on the stones that define a collection.",
    category: "GEMOLOGY",
    date: "May 9, 2026",
    readTime: "5 min read",
    image: "/assets/1 (5).png",
    body: [
      "Colour is the soul of a gemstone. A truly exceptional ruby glows with an inner fire the trade calls 'pigeon's blood'; a fine emerald holds an entire forest within its facets.",
      "Our gemologists travel the world to source stones of extraordinary saturation and life, often waiting years for a single specimen worthy of a high-jewellery creation.",
      "Understanding colour is to understand the very language of our craft — and the dialogue between a stone and the setting that frames it.",
    ],
  },
  {
    slug: "time-and-the-watchmaker",
    title: "Time and the Watchmaker",
    excerpt:
      "A look at the mechanical artistry behind our latest timepieces, where engineering meets emotion.",
    category: "WATCHES",
    date: "April 22, 2026",
    readTime: "7 min read",
    image: "/assets/1 (7).png",
    body: [
      "A fine watch is a paradox — a machine built to measure something we can never hold. Behind each ÉLORIS timepiece lies a movement of hundreds of components, assembled and adjusted entirely by hand.",
      "Our watchmakers train for years before they are permitted to touch a complication. Patience is not a virtue here; it is a prerequisite.",
      "The finished piece is more than an instrument. It is a small, beating testament to human ingenuity, worn close to the pulse.",
    ],
  },
];

interface PostRow {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  read_time: string;
  image: string;
  body: string[] | null;
}

function mapPost(row: PostRow): Post {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    body: row.body ?? [],
  };
}

/**
 * All journal posts, read from Supabase ordered by the admin's sort order. Falls
 * back to the bundled sample journal when Supabase is not configured, errors, or
 * is empty.
 */
export async function getPosts(): Promise<Post[]> {
  const supabase = getSupabase();
  if (!supabase) return fallbackPosts;
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallbackPosts;
    return (data as PostRow[]).map(mapPost);
  } catch {
    return fallbackPosts;
  }
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}
