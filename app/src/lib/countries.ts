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
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "CH", name: "Switzerland" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "IE", name: "Ireland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" },
  { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "KR", name: "South Korea" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "ZA", name: "South Africa" },
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
