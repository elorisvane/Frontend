import { getSupabase } from "../lib/supabase";

export interface SiteSettings {
  /** When true, the storefront is locked behind the Coming Soon page. */
  comingSoon: boolean;
  /** Admin-supplied Coming Soon heading; blank means "use the default below". */
  heading: string;
  /** Admin-supplied Coming Soon body copy; blank means "use the default below". */
  message: string;
}

const DEFAULTS: SiteSettings = {
  comingSoon: false,
  heading: "",
  message: "",
};

/**
 * Read the storefront's global settings (the single site_settings row).
 *
 * Fails **open**: if Supabase isn't configured, the row is missing, or the read
 * errors, we return `comingSoon: false` so a database hiccup can never
 * accidentally lock the live store.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = getSupabase();
  if (!supabase) return DEFAULTS;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("coming_soon, heading, message")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULTS;
    return {
      comingSoon: data.coming_soon ?? false,
      heading: data.heading ?? "",
      message: data.message ?? "",
    };
  } catch {
    return DEFAULTS;
  }
}
