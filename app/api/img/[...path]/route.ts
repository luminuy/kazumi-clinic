import { cloudinaryUrlFromProxyPath } from '@/lib/image-proxy';

/**
 * Serves Cloudinary-hosted images from our own origin.
 *
 * Why this exists: the home page's LCP element is an image, and it used to live on
 * res.cloudinary.com. A second origin costs the browser DNS + TCP + TLS before it can send the
 * request at all — Lighthouse's Slow-4G model charges ~4 round trips (~600ms) of "Load Delay" in
 * front of the largest paint, and measured on production 2026-08-03 that delay was the single
 * biggest LCP phase and the only one that didn't move when other bytes were removed (blocking all
 * RSC prefetches and all fonts changed it by <10%). A real phone on a slow link pays the same toll.
 * Requests here reuse the connection the HTML already opened.
 *
 * The trade is one server-side hop to Cloudinary, which runs over Cloudflare's backbone from the
 * same colo the visitor reached, and which the edge caches — far cheaper than four client round
 * trips over a mobile link.
 *
 * Only `next/image` goes through here. `cld()` still emits absolute Cloudinary URLs for OG/Twitter
 * cards and JSON-LD, because those are fetched by other people's servers.
 *
 * SECURITY: this must never become an open proxy. The cloud name is fixed in code (never taken
 * from the request), and lib/image-proxy.ts validates every path segment against an allowlist of
 * pure resize/encode transformations — no `l_` overlays, no `e_` effects, no remote fetch sources.
 * Anything unrecognised is a 400, never a pass-through.
 */

/** Matches what Cloudinary itself sends, and what the hashed asset URLs already get from _headers. */
const IMMUTABLE = 'public, max-age=31536000, immutable';

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const upstream = cloudinaryUrlFromProxyPath(path);

  if (!upstream) {
    return new Response('Bad image request', { status: 400 });
  }

  const response = await fetch(upstream, {
    headers: {
      // Cloudinary picks AVIF/WebP/JPEG from `f_auto` using this, so it has to survive the hop.
      // Without it every visitor gets the same fallback encoding and the payload grows.
      accept: _request.headers.get('accept') ?? 'image/*',
    },
  });

  if (!response.ok || !response.body) {
    // Don't cache upstream failures — a transient Cloudinary 5xx must not stick to the URL for a
    // year. `no-store` also keeps a deleted-asset 404 from outliving a re-upload via /admin.
    return new Response(null, {
      status: response.status,
      headers: { 'cache-control': 'no-store' },
    });
  }

  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('cache-control', IMMUTABLE);
  // The URL carries the transformation, so the bytes differ per Accept. Without this a shared
  // cache can hand an AVIF to a client that only takes WebP.
  headers.set('vary', 'accept');

  return new Response(response.body, { status: 200, headers });
}
