"use client";

/**
 * Development-only control on the Coming Soon page. Clicking it sets the
 * dev-preview cookie and reloads to the home screen, letting a developer see
 * the real storefront even while Coming Soon mode is switched on in the shared
 * database. This never renders in production (guarded by the layout), and the
 * cookie it sets is ignored by production builds.
 */
export default function DevPreviewEntry({ cookieName }: { cookieName: string }) {
  const enter = () => {
    // Session-length cookie (max-age 12h) so the preview doesn't stick around
    // forever; clear it from devtools to see the Coming Soon page again.
    document.cookie = `${cookieName}=1; path=/; max-age=${60 * 60 * 12}; samesite=lax`;
    window.location.href = "/";
  };

  return (
    <button
      type="button"
      onClick={enter}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white/5 px-5 py-2 font-sans text-[10px] uppercase tracking-[0.3em] text-white/50 transition hover:border-white/40 hover:text-white/80"
    >
      Enter storefront · dev
    </button>
  );
}
