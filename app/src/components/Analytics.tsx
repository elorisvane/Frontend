import Script from "next/script";

// Public measurement IDs — embedded into the client bundle at build time, so
// they must be NEXT_PUBLIC_*. Each block below only renders when its ID is set,
// so leaving an env var unset simply disables that integration.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // Google Analytics 4 — "G-XXXXXXX"
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID; // Google Ads — "AW-XXXXXXXXX"
const CF_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN; // Cloudflare Web Analytics beacon token

/**
 * Loads the storefront's third-party analytics. Google Analytics and Google Ads
 * share a single `gtag.js` load (configured once per product ID); Cloudflare Web
 * Analytics loads its own privacy-friendly beacon. All use `afterInteractive` so
 * they never block hydration of first-party code.
 */
export default function Analytics() {
  // gtag.js is loaded once with whichever Google ID exists, then each product
  // (Analytics + Ads) is registered through its own gtag('config', …) call.
  const gtagId = GA_ID ?? ADS_ID;

  return (
    <>
      {gtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${GA_ID ? `gtag('config', '${GA_ID}');` : ""}
              ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ""}
            `}
          </Script>
        </>
      )}

      {CF_TOKEN && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({ token: CF_TOKEN })}
        />
      )}
    </>
  );
}
