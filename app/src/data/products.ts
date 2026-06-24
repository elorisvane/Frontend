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
  {
    slug: "aurora-diamond-necklace",
    name: "Aurora Diamond Necklace",
    category: "HIGH JEWELLERY",
    price: "$48,500",
    tagline: "Brilliant-cut diamonds set in 18k white gold",
    image: "/assets/1 (4).png",
    description: [
      "A cascade of brilliant-cut diamonds drawn from a single exceptional parcel, the Aurora necklace is the purest expression of the maison's savoir-faire. Each stone is hand-selected for its fire and clarity, then set by a master jeweller over more than two hundred hours.",
      "Designed to catch the light from every angle, Aurora moves with the wearer — a living constellation that transforms an evening into an occasion.",
    ],
    details: [
      { label: "Reference", value: "ELR-NK-0142" },
      { label: "Centre stone", value: "3.04ct, D Flawless" },
      { label: "Total carat", value: "12.6ct" },
      { label: "Metal", value: "18k white gold" },
    ],
    materials: ["18k White Gold", "18k Yellow Gold", "Platinum"],
  },
  {
    slug: "solene-drop-earrings",
    name: "Soléne Drop Earrings",
    category: "EARRINGS",
    price: "$22,900",
    tagline: "Pear-cut diamonds with an articulated drop",
    image: "/assets/1 (2).png",
    description: [
      "Two pear-cut diamonds suspended from a delicate articulated mount, the Soléne earrings are an study in movement and light. The drop sways with the slightest gesture, lending an effortless elegance to both daylight and evening.",
      "A contemporary silhouette grounded in the maison's classical heritage.",
    ],
    details: [
      { label: "Reference", value: "ELR-EA-0098" },
      { label: "Stones", value: "Pear-cut diamonds" },
      { label: "Total carat", value: "4.2ct" },
      { label: "Metal", value: "18k white gold" },
    ],
    materials: ["18k White Gold", "18k Rose Gold"],
  },
  {
    slug: "emeraude-cocktail-ring",
    name: "Émeraude Cocktail Ring",
    category: "RINGS",
    price: "$36,000",
    tagline: "Colombian emerald framed by a diamond halo",
    image: "/assets/1 (6).png",
    description: [
      "At its heart, a Colombian emerald of extraordinary saturation — an entire forest held within its facets. A halo of brilliant-cut diamonds frames the stone, amplifying its depth and presence.",
      "Sculpted in 18k yellow gold, the Émeraude ring is a singular statement piece, made to be treasured for generations.",
    ],
    details: [
      { label: "Reference", value: "ELR-RG-0211" },
      { label: "Centre stone", value: "5.18ct Colombian emerald" },
      { label: "Halo", value: "1.4ct diamonds" },
      { label: "Metal", value: "18k yellow gold" },
    ],
    materials: ["18k Yellow Gold", "18k White Gold", "Platinum"],
  },
  {
    slug: "celeste-tennis-bracelet",
    name: "Céleste Tennis Bracelet",
    category: "BRACELETS",
    price: "$29,750",
    tagline: "A continuous line of round brilliant diamonds",
    image: "/assets/1 (5).png",
    description: [
      "The Céleste bracelet is a continuous line of perfectly matched round brilliant diamonds, each set in a discreet four-prong mount that lets the light pass through unhindered.",
      "A timeless companion, equally at home with eveningwear or worn simply against the skin.",
    ],
    details: [
      { label: "Reference", value: "ELR-BR-0175" },
      { label: "Stones", value: "Round brilliant diamonds" },
      { label: "Total carat", value: "8.0ct" },
      { label: "Metal", value: "18k white gold" },
    ],
    materials: ["18k White Gold", "18k Yellow Gold"],
  },
  {
    slug: "le-temps-automatic-watch",
    name: "Le Temps Automatic",
    category: "WATCHES",
    price: "$64,000",
    tagline: "In-house movement with a diamond-set bezel",
    image: "/assets/1 (7).png",
    description: [
      "Behind the mother-of-pearl dial of Le Temps lies a movement of hundreds of components, assembled and adjusted entirely by hand. A bezel of brilliant-cut diamonds encircles the face, where engineering meets emotion.",
      "A timepiece worn close to the pulse — a small, beating testament to human ingenuity.",
    ],
    details: [
      { label: "Reference", value: "ELR-WA-0031" },
      { label: "Movement", value: "In-house automatic" },
      { label: "Case", value: "36mm, 18k rose gold" },
      { label: "Bezel", value: "1.1ct diamonds" },
    ],
    materials: ["18k Rose Gold", "18k Yellow Gold", "Steel & Gold"],
  },
  {
    slug: "papillon-diamond-brooch",
    name: "Papillon Diamond Brooch",
    category: "BROOCHES",
    price: "$41,200",
    tagline: "A sculpted butterfly in diamonds and sapphires",
    image: "/assets/1 (3).png",
    description: [
      "The Papillon brooch alights on the lapel as if mid-flight — its wings articulated with pavé diamonds and shaded with a gradient of fancy sapphires.",
      "A reinterpretation of a heritage motif with a distinctly contemporary hand, finished entirely by the maison's master setters.",
    ],
    details: [
      { label: "Reference", value: "ELR-BC-0066" },
      { label: "Stones", value: "Diamonds & fancy sapphires" },
      { label: "Total carat", value: "6.3ct" },
      { label: "Metal", value: "18k white gold" },
    ],
    materials: ["18k White Gold", "Platinum"],
  },
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
