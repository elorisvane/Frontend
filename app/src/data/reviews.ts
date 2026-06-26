import { getSupabase } from "../lib/supabase";

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string | null;
  createdAt: string;
}

interface ReviewRow {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  author_name: string | null;
  created_at: string;
}

function mapRow(r: ReviewRow): Review {
  return {
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    authorName: r.author_name,
    createdAt: r.created_at,
  };
}

const SELECT = "id, rating, title, body, author_name, created_at";

/** Published reviews for a piece, newest first. */
export async function getProductReviews(slug: string): Promise<Review[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select(SELECT)
    .eq("product_slug", slug)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapRow(r as ReviewRow));
}

/** The signed-in shopper's own review for a piece (or null), even if hidden. */
export async function getMyReview(slug: string): Promise<Review | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("reviews")
    .select(SELECT)
    .eq("product_slug", slug)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as ReviewRow) : null;
}

/** Create or update the signed-in shopper's review for a piece. */
export async function submitReview(input: {
  slug: string;
  rating: number;
  title?: string;
  body: string;
}): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Reviews are unavailable right now.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to write a review.");

  const meta = user.user_metadata as
    | { full_name?: string; first_name?: string }
    | undefined;
  const authorName = meta?.full_name || meta?.first_name || null;

  const { error } = await supabase.from("reviews").upsert(
    {
      product_slug: input.slug,
      user_id: user.id,
      author_name: authorName,
      rating: input.rating,
      title: input.title?.trim() || null,
      body: input.body.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_slug" },
  );
  if (error) throw new Error(error.message);
}

/** Remove the signed-in shopper's review for a piece. */
export async function deleteMyReview(slug: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("product_slug", slug);
  if (error) throw new Error(error.message);
}
