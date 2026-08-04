import Script from 'next/script';

/**
 * GA4, loaded only when `GA_MEASUREMENT_ID` is configured.
 *
 * PERFORMANCE, measured 2026-08-04 — this is not a free swap for Cloudflare Web Analytics:
 *
 * | | transferred | uncompressed |
 * | --- | --- | --- |
 * | Cloudflare beacon.min.js | 11 KB | 32 KB |
 * | GA4 gtag.js | **148 KB** | **418 KB** |
 *
 * That is 13× the bytes and 13× the JavaScript to parse and execute, plus a new origin
 * (googletagmanager.com) to resolve and handshake, plus the /g/collect requests after it. Expect
 * TBT and the Lighthouse Performance score to drop — GA4 buys much richer data, not speed.
 *
 * `afterInteractive` is Google's and Next's recommended strategy: the tag loads as soon as the page
 * is interactive, which keeps session/bounce data accurate. Switching to `lazyOnload` moves it past
 * the window load event and costs the score noticeably less, at the price of missing very short
 * visits. If the Performance number matters more than exact bounce counts, change it there.
 *
 * CONFIGURATION — `GA_MEASUREMENT_ID` must be a **build-time** env var, not a `wrangler.jsonc`
 * var. Most public pages are prerendered, so this runs during `opennextjs-cloudflare build` and the
 * tag is baked into the static HTML; a runtime-only Worker var would put GA on the dynamic routes
 * and nothing on the prerendered ones (verified 2026-08-04 — with the var set only at runtime the
 * home page shipped no tag at all). It's wired into .github/workflows/deploy.yml from a repository
 * *variable*; a measurement ID is public by design, so it is not a secret.
 */
/**
 * GA4 measurement IDs are `G-` plus an alphanumeric stream id. Validating the shape rather than
 * escaping an arbitrary string is the stronger guarantee: this value ends up inside an inline
 * <script>, and a var set by hand in a dashboard is exactly the kind of input that arrives
 * malformed. Anything that doesn't match is treated as "not configured".
 */
const MEASUREMENT_ID = /^G-[A-Z0-9]{4,20}$/i;

export function GoogleAnalytics() {
  const measurementId = process.env.GA_MEASUREMENT_ID?.trim();
  if (!measurementId || !MEASUREMENT_ID.test(measurementId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(measurementId)});`}
      </Script>
    </>
  );
}
