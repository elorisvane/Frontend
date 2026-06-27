import { getSupabase } from "../lib/supabase";

export type MediaType = "image" | "video";

/** A full-screen campaign panel at the top of the home page. */
export interface CampaignSection {
  id: string;
  title: string;
  subtitle: string;
  mediaType: MediaType;
  /** Path relative to /public, or a full URL. */
  src: string;
  /** Optional still frame for videos. */
  poster?: string;
  /** Optional click-through URL — makes the caption a link. */
  linkUrl?: string;
}

/** An item in the horizontal gallery strip near the bottom of the home page. */
export interface GalleryItem {
  id: string;
  alt: string;
  mediaType: MediaType;
  src: string;
  poster?: string;
  /** Optional click-through URL — makes the image a link. */
  linkUrl?: string;
}

export interface HomeMediaContent {
  sections: CampaignSection[];
  gallery: GalleryItem[];
}

/** The maison's original artwork — used until the `home_media` table is
 *  populated (or when Supabase is not configured), so the home page is never
 *  blank. */
const defaultSections: CampaignSection[] = [
  { id: "cast", title: "A CUTTING-EDGE CAST", subtitle: "DISCOVER THE COUNTRYSIDE", mediaType: "image", src: "/assets/1 (1).png" },
  { id: "category", title: "JEWELLERY BY CATEGORY", subtitle: "DISCOVER THE CAMPAIGN", mediaType: "image", src: "/assets/1 (3).png" },
  { id: "collection", title: "JEWELLERY BY COLLECTION", subtitle: "DISCOVER THE CAMPAIGN", mediaType: "image", src: "/assets/1 (5).png" },
  { id: "high-jewellery", title: "HIGH JEWELLERY", subtitle: "DISCOVER THE CAMPAIGN", mediaType: "image", src: "/assets/1 (6).png" },
  { id: "watch", title: "WATCH", subtitle: "DISCOVER THE CAMPAIGN", mediaType: "image", src: "/assets/1 (7).png" },
  { id: "brooch", title: "BROOCH", subtitle: "DISCOVER THE CAMPAIGN", mediaType: "image", src: "/assets/1 (2).png" },
];

const defaultGallery: GalleryItem[] = [
  { id: "gallery-1", alt: "Diamond earring", mediaType: "image", src: "/assets/1 (2).png" },
  { id: "gallery-2", alt: "Gold chain necklace", mediaType: "image", src: "/assets/1 (5).png" },
  { id: "gallery-3", alt: "Sculpted ring", mediaType: "image", src: "/assets/1 (6).png" },
  { id: "gallery-4", alt: "Sculpted ring", mediaType: "image", src: "/assets/1 (7).png" },
];

export const homeMediaDefaults: HomeMediaContent = {
  sections: defaultSections,
  gallery: defaultGallery,
};

type Placement =
  | "campaign"
  | "gallery"
  | "products_hero"
  | "products_grid";

interface HomeMediaRow {
  id: string;
  placement: Placement | null;
  media_type: MediaType | null;
  src: string;
  poster: string | null;
  title: string | null;
  subtitle: string | null;
  alt: string | null;
  link_url: string | null;
  sort_order: number | null;
}

/**
 * Reads the admin-managed home page media from Supabase, grouped into campaign
 * sections and gallery items. Falls back to the bundled defaults per-group, so
 * an empty table — or a missing Supabase config — still renders the original
 * artwork rather than a blank page.
 */
export async function getHomeMedia(): Promise<HomeMediaContent> {
  const supabase = getSupabase();
  if (!supabase) return homeMediaDefaults;

  try {
    const { data, error } = await supabase
      .from("home_media")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) return homeMediaDefaults;

    const rows = data as HomeMediaRow[];

    const sections: CampaignSection[] = rows
      .filter((r) => (r.placement ?? "campaign") === "campaign")
      .map((r) => ({
        id: r.id,
        title: r.title ?? "",
        subtitle: r.subtitle ?? "",
        mediaType: r.media_type ?? "image",
        src: r.src,
        poster: r.poster ?? undefined,
        linkUrl: r.link_url ?? undefined,
      }));

    const gallery: GalleryItem[] = rows
      .filter((r) => r.placement === "gallery")
      .map((r) => ({
        id: r.id,
        alt: r.alt ?? r.title ?? "",
        mediaType: r.media_type ?? "image",
        src: r.src,
        poster: r.poster ?? undefined,
        linkUrl: r.link_url ?? undefined,
      }));

    return {
      sections: sections.length ? sections : defaultSections,
      gallery: gallery.length ? gallery : defaultGallery,
    };
  } catch {
    return homeMediaDefaults;
  }
}

/** An admin-managed image/video slot (products page hero + lifestyle banner). */
export interface MediaSlot {
  mediaType: MediaType;
  /** Path relative to /public, or a full URL. */
  src: string;
  poster?: string;
  alt: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
}

export interface ProductsMedia {
  hero: MediaSlot | null;
  grid: MediaSlot | null;
}

/**
 * The two media slots for the products page (top hero banner + in-grid
 * lifestyle banner), or null per slot when the admin hasn't set one — the page
 * then falls back to its bundled artwork.
 */
export async function getProductsMedia(): Promise<ProductsMedia> {
  const supabase = getSupabase();
  if (!supabase) return { hero: null, grid: null };
  try {
    const { data, error } = await supabase
      .from("home_media")
      .select("*")
      .in("placement", ["products_hero", "products_grid"])
      .order("sort_order", { ascending: true });
    if (error || !data) return { hero: null, grid: null };
    const rows = data as HomeMediaRow[];

    const pick = (placement: Placement): MediaSlot | null => {
      const r = rows.find((x) => x.placement === placement);
      if (!r) return null;
      return {
        mediaType: r.media_type ?? "image",
        src: r.src,
        poster: r.poster ?? undefined,
        alt: r.alt ?? r.title ?? "",
        title: r.title ?? undefined,
        subtitle: r.subtitle ?? undefined,
        linkUrl: r.link_url ?? undefined,
      };
    };

    return { hero: pick("products_hero"), grid: pick("products_grid") };
  } catch {
    return { hero: null, grid: null };
  }
}
