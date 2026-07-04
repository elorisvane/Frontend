/**
 * A curated list of countries for the address book + checkout, plus a helper
 * that adapts the postal-code field label to the selected country (ZIP for the
 * US, PIN for India, "Postal code" everywhere else). Kept deliberately small
 * and dependency-free; extend the list as new markets open.
 */

export interface Country {
  /** ISO-3166 alpha-2 code, e.g. "US". */
  code: string;
  name: string;
  /** International dialling code including the leading "+", e.g. "+44". */
  dial: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", dial: "+1" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "BE", name: "Belgium", dial: "+32" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "DK", name: "Denmark", dial: "+45" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "AT", name: "Austria", dial: "+43" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "HK", name: "Hong Kong", dial: "+852" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "KR", name: "South Korea", dial: "+82" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "ZA", name: "South Africa", dial: "+27" },
];

/** Human-readable country name for an ISO code (falls back to the code). */
export function countryName(code: string | null | undefined): string {
  if (!code) return "";
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

/** The postal-code field label appropriate for the given country. */
export function postalLabel(code: string | null | undefined): string {
  switch (code) {
    case "US":
      return "ZIP code";
    case "IN":
      return "PIN code";
    default:
      return "Postal code";
  }
}
