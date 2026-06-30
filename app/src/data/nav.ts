import { getSupabase } from "../lib/supabase";

/** A single category tile inside a mega-menu panel. `image` is optional — when
 *  omitted the tile renders a neutral placeholder (drop in real artwork later). */
export interface MegaTile {
  label: string;
  href: string;
  image?: string;
}

/** A top-level tab in the mega-menu and the tiles it reveals. */
export interface MegaSection {
  id: string;
  label: string;
  /** Where the tab links when it has no tiles of its own. */
  href: string;
  tiles: MegaTile[];
}

/**
 * Bundled fallback navigation — shown instantly on first paint, when Supabase is
 * not configured, or if the live read fails/returns nothing. The atelier manages
 * the live version in the Admin app's "Menu & categories" section.
 */
export const fallbackNav: MegaSection[] = [
  {
    id: "high-jewellery",
    label: "HIGH JEWELLERY",
    href: "/products",
    tiles: [
      { label: "Necklaces & Pendants", href: "/products/necklaces" },
      { label: "Rings", href: "/products/rings" },
      { label: "Earrings", href: "/products/earrings" },
      { label: "Bracelets", href: "/products/bracelets" },
      { label: "Brooches", href: "/products/brooches" },
    ],
  },
  {
    id: "fine-jewellery",
    label: "FINE JEWELLERY",
    href: "/products",
    tiles: [
      { label: "Necklaces & Pendants", href: "/products/necklaces" },
      { label: "Rings", href: "/products/rings" },
      { label: "Earrings", href: "/products/earrings" },
      { label: "Bracelets", href: "/products/bracelets" },
    ],
  },
  {
    id: "collections",
    label: "JEWELLERY COLLECTION",
    href: "/products",
    tiles: [
      { label: "Signature", href: "/products" },
      { label: "Heritage", href: "/products" },
      { label: "Countryside", href: "/products" },
      { label: "Iconic", href: "/products" },
    ],
  },
  {
    id: "gifts",
    label: "GIFT IDEAS",
    href: "/products",
    tiles: [
      { label: "For Her", href: "/products" },
      { label: "For Him", href: "/products" },
      { label: "New Arrivals", href: "/products" },
    ],
  },
  {
    id: "bespoke",
    label: "BESPOKE",
    href: "/contact",
    tiles: [
      { label: "Design Service", href: "/contact" },
      { label: "Book an Appointment", href: "/contact" },
      { label: "The Atelier", href: "/about" },
    ],
  },
  {
    id: "engagement",
    label: "ENGAGEMENT RINGS",
    href: "/products/rings",
    tiles: [
      { label: "Solitaire", href: "/products/rings" },
      { label: "Diamond", href: "/products/rings" },
      { label: "Wedding Bands", href: "/products/rings" },
    ],
  },
];

/** Raw sub-category tile as stored in the `nav_categories.subcategories` jsonb. */
interface NavSubcategoryRow {
  label?: unknown;
  image?: unknown;
  link_url?: unknown;
}

interface NavCategoryRow {
  id: string;
  label: string;
  link_url: string | null;
  sort_order: number | null;
  subcategories: unknown;
}

function mapTile(value: unknown): MegaTile {
  const o = (value ?? {}) as NavSubcategoryRow;
  const image = typeof o.image === "string" ? o.image.trim() : "";
  return {
    label: typeof o.label === "string" ? o.label : "",
    href: typeof o.link_url === "string" && o.link_url ? o.link_url : "/products",
    image: image || undefined,
  };
}

function mapSection(row: NavCategoryRow): MegaSection {
  return {
    id: row.id,
    label: row.label,
    href: row.link_url || "/products",
    tiles: Array.isArray(row.subcategories)
      ? row.subcategories.map(mapTile).filter((t) => t.label)
      : [],
  };
}

/**
 * The storefront navigation, read from Supabase ordered by the admin's sort
 * order. Falls back to the bundled menu when Supabase is not configured, errors,
 * or is empty — so the header always has categories to show.
 */
export async function getNavCategories(): Promise<MegaSection[]> {
  const supabase = getSupabase();
  if (!supabase) return fallbackNav;
  try {
    const { data, error } = await supabase
      .from("nav_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallbackNav;
    return (data as NavCategoryRow[]).map(mapSection);
  } catch {
    return fallbackNav;
  }
}
