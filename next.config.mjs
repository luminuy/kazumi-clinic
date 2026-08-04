import path from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Content-Security-Policy. `script-src` keeps 'unsafe-inline' because Next injects inline hydration
// scripts and this build has no per-request nonce yet (nonce-based CSP via middleware is the next
// step). The real stored-XSS sink — data interpolated into <script type="application/ld+json"> — is
// closed at the source by lib/json-ld.ts, so this CSP is defence-in-depth: it still shuts down
// clickjacking (frame-ancestors), base-tag hijacking, plugin content, and unexpected egress.
// `frame-src` allows the Google Maps embed; `img-src` allows Cloudinary-served images.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' https://res.cloudinary.com https://www.google-analytics.com data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // static.cloudflareinsights.com is Cloudflare Web Analytics (RUM). The edge injects that beacon
  // into every HTML response by itself, so leaving it out of the CSP didn't stop it loading — it
  // only made the browser block it and log a CSP violation on every page view. Allow the script
  // plus the endpoint it reports to. (To drop it instead, turn Web Analytics off in the Cloudflare
  // dashboard — Analytics & Logs → Web Analytics — and revert these two entries.)
  // googletagmanager.com serves gtag.js; GA4 then beacons events to *.google-analytics.com (the
  // region-sharded hosts are why this needs a wildcard) and, for some regions, back to
  // *.analytics.google.com. img-src covers the legacy /collect pixel GA falls back to when
  // sendBeacon/fetch is unavailable. Drop all of these again if GA4 is ever removed.
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com",
  "connect-src 'self' https://cloudflareinsights.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  'frame-src https://www.google.com',
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  // NOTE: `experimental.inlineCss` was measured here on 2026-08-03 and rejected. It does remove the
  // two render-blocking stylesheet requests, but Next also copies the CSS into the inline RSC
  // flight payload — home went 50KB → 90KB gzip and the flight payload 136KB → 273KB, i.e. ~137KB
  // of extra main-thread string parsing. TBT is already this page's worst metric, and a paired
  // Lighthouse A/B showed no improvement. Don't re-enable without measuring both numbers again.
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: {
    // Delegates resizing to Cloudinary (see lib/cloud.ts default export) instead of Next's
    // own optimizer — required because @opennextjs/cloudflare doesn't run Next's image API.
    loader: 'custom',
    loaderFile: './lib/cloud.ts',
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
