import { getSupabase } from "../lib/supabase";
import type { WishlistItem } from "../lib/wishlist";

/**
 * Server-side wishlist persistence for signed-in shoppers. RLS scopes every row
 * to the current user, so the Admin app can later see who saved what. Guests
 * (no session) keep their wishlist in localStorage only — these helpers no-op
 * for them.
 */

interface WishlistRow {
  product_slug: string;
  name: string | null;
  image: string | null;
  price: string | null;
  category: string | null;
}

function mapRow(r: WishlistRow): WishlistItem {
  return {
    slug: r.product_slug,
    name: r.name ?? "",
    image: r.image ?? "",
    price: r.price ?? "",
    category: r.category ?? "",
  };
}

/** The signed-in shopper's saved pieces, newest first (RLS-scoped). */
export async function getServerWishlist(): Promise<WishlistItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("wishlists")
    .select("product_slug, name, image, price, category, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapRow(r as WishlistRow));
}

/** Save a piece for the signed-in shopper (no-op when signed out). */
export async function addServerWishlist(item: WishlistItem): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("wishlists").upsert(
    {
      user_id: user.id,
      product_slug: item.slug,
      name: item.name,
      image: item.image,
      price: item.price,
      category: item.category,
    },
    { onConflict: "user_id,product_slug", ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
}

/** Remove a saved piece for the signed-in shopper (no-op when signed out). */
export async function removeServerWishlist(slug: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("product_slug", slug);
  if (error) throw new Error(error.message);
}
