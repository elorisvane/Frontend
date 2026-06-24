import { getSupabase } from "../lib/supabase";

export interface Product {
  slug: string;
  name: string;
  category: string;
  /** Display price, pre-formatted (these are made-to-order pieces). */
  price: string;
  /** Short line shown under the name in listings. */
  tagline: string;
  /** Hero / card image. */
  image: string;
  /** Full photo gallery (cover first). Optional; falls back to `[image]`. */
  images?: string[];
  /** Longer descriptive paragraphs for the product page. */
  description: string[];
  /** Key specifications shown as a detail list. */
  details: { label: string; value: string }[];
  /** Available material / metal options. */
  materials: string[];
}

/** Bundled sample catalogue — the fallback when Supabase is unavailable, and a
 *  lightweight static index for the client-side header search. */
export const fallbackProducts: Product[] = [

];

interface ProductRow {
  slug: string;
  name: string;
  category: string;
  price: string;
  tagline: string;
  image: string;
  images: string[] | null;
  description: string[] | null;
  details: { label: string; value: string }[] | null;
  materials: string[] | null;
}

function mapProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    tagline: row.tagline,
    image: row.image,
    images: row.images?.length ? row.images : row.image ? [row.image] : [],
    description: row.description ?? [],
    details: row.details ?? [],
    materials: row.materials ?? [],
  };
}

/**
 * All products, read from Supabase ordered by the admin's sort order. Falls back
 * to the bundled sample catalogue when Supabase is not configured, errors, or is
 * empty — so the storefront always has something to show.
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return fallbackProducts;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallbackProducts;
    return (data as ProductRow[]).map(mapProduct);
  } catch {
    return fallbackProducts;
  }
}

/**
 * A single product by slug. The listing page mocks an expanded catalogue by
 * appending a numeric variant suffix (e.g. "-2", "-3") to real slugs; resolve
 * those back to the base product so variant cards never land on a 404.
 */
export async function getProduct(slug: string): Promise<Product | undefined> {
  const all = await getProducts();
  const exact = all.find((p) => p.slug === slug);
  if (exact) return exact;
  const base = slug.replace(/-\d+$/, "");
  return all.find((p) => p.slug === base);
}
