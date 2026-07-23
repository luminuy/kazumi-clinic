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
  "img-src 'self' https://res.cloudinary.com data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
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
