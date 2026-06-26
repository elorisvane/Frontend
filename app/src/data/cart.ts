import { getSupabase } from "../lib/supabase";
import type { CartItem } from "../lib/cart";

/**
 * Server-side bag persistence for signed-in shoppers. RLS scopes every row to
 * the current user, so the Admin app can see live bag contents. Guests (no
 * session) keep their bag in localStorage only — these helpers no-op for them.
 */

interface CartRow {
  product_slug: string;
  material: string | null;
  name: string | null;
  image: string | null;
  price: string | null;
  quantity: number | null;
}

function mapRow(r: CartRow): CartItem {
  return {
    slug: r.product_slug,
    material: r.material ?? "",
    name: r.name ?? "",
    image: r.image ?? "",
    price: r.price ?? "",
    quantity: r.quantity ?? 1,
  };
}

/** The signed-in shopper's bag lines (RLS-scoped), oldest first. */
export async function getServerCart(): Promise<CartItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("carts")
    .select("product_slug, material, name, image, price, quantity, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapRow(r as CartRow));
}

/** Insert or update a bag line at an absolute quantity (no-op when signed out). */
export async function upsertServerCartLine(item: CartItem): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("carts").upsert(
    {
      user_id: user.id,
      product_slug: item.slug,
      material: item.material ?? "",
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_slug,material" },
  );
  if (error) throw new Error(error.message);
}

/** Remove a bag line (no-op when signed out). */
export async function removeServerCartLine(
  slug: string,
  material: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("carts")
    .delete()
    .eq("user_id", user.id)
    .eq("product_slug", slug)
    .eq("material", material ?? "");
  if (error) throw new Error(error.message);
}

/** Empty the signed-in shopper's bag, e.g. after an order is placed. */
export async function clearServerCart(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("carts").delete().eq("user_id", user.id);
  if (error) throw new Error(error.message);
}
