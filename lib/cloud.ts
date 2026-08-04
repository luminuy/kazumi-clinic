// Cloudinary helpers — single source of truth for the cloud name and URL building.
// Assets live under the `kazumi-clinic/` folder in the account.
export const CLOUD_NAME = 'dvskwrapm';

/**
 * Inline images are delivered through our own origin instead of res.cloudinary.com — see
 * app/api/img/[...path]/route.ts. Only the `next/image` loader uses this; `cld()` below still
 * returns absolute Cloudinary URLs because OG/Twitter/JSON-LD consumers need a fully-qualified
 * one they can fetch without our site in the loop.
 */
export const IMAGE_PROXY_PREFIX = '/api/img';

type CldOptions = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'pad' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
};

/** Build a Cloudinary delivery URL with f_auto,q_auto plus any explicit transforms. */
export function cld(publicId: string, opts: CldOptions = {}) {
  const parts = ['f_auto', 'q_auto'];
  if (opts.crop) parts.push(`c_${opts.crop}`);
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  if (opts.gravity) parts.push(`g_${opts.gravity}`);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${parts.join(',')}/${publicId}`;
}

/**
 * A `next/image` src that carries its own leading transformation segment, e.g.
 * `cldSrc(cloudAssets.heroHome, 'c_crop,w_1060,h_1080,x_0,y_0')`. The loader below appends
 * its `f_auto,q_,w_` segment *after* these, which is the order Cloudinary needs for a crop
 * (a single `c_crop,...,w_,h_` segment would treat width/height as the crop box, not the final
 * output size) — so this is how you feed next/image a sub-region of an asset.
 */
export function cldSrc(publicId: string, transforms: string) {
  return `${transforms}/${publicId}`;
}

/** A src's first path segment is a transformation list if it looks like `c_crop`/`w_100`, not a folder. */
const TRANSFORM_SEGMENT = /^[a-z]+_/;

/**
 * next/image loader that delegates resizing to Cloudinary instead of Next's own optimizer.
 * Wired globally via `images.loaderFile` in next.config.mjs (default export = the loader) —
 * a `loader` prop can't be passed from Server Components, so images just use `src={cloudAssets.x}` directly.
 *
 * `c_limit` is required, not cosmetic: next/image's default deviceSizes top out at 3840, so every
 * srcset gets a w_3840 candidate. Without a crop mode Cloudinary upscales to reach that width, and
 * on a tall source that overshoots the account's 25 Megapixel cap — hero-filler (400x1750) scales
 * to 3840x16800 = 64.5MP and the derived image 400s with `x-cld-error: Maximum image size is 25
 * Megapixels`. `c_limit` caps the resize at the source's own dimensions rather than upscaling.
 */
function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Public-folder assets are already optimized and served by Next directly.
  // Keep them local instead of treating `/images/...` as a Cloudinary public ID.
  if (src.startsWith('/')) return src;

  const resize = `f_auto,q_${quality ?? 'auto'},c_limit,w_${width}`;
  const [head, ...rest] = src.split('/');
  const prefix = rest.length > 0 && TRANSFORM_SEGMENT.test(head) ? `${head}/` : '';
  const publicId = prefix ? rest.join('/') : src;
  // Same-origin on purpose. res.cloudinary.com is a second origin, so the browser has to pay DNS +
  // TCP + TLS before it can even ask for the image — and on this site the LCP element IS an image.
  // Lighthouse's Slow-4G model charges that as ~4 round trips (~600ms) of "Load Delay" in front of
  // the largest paint, and a real phone on a slow link pays the same. Going through our own origin
  // reuses the connection the HTML already opened; the Worker's fetch to Cloudinary happens over
  // Cloudflare's backbone from the same colo and is cached at the edge.
  return `${IMAGE_PROXY_PREFIX}/${prefix}${resize}/${publicId}`;
}

export default cloudinaryLoader;

// Known asset public IDs — keep in sync with what's actually uploaded in Cloudinary.
//
// EVERY ID HERE MUST RESOLVE. A shipped ID that 404s is worse than no ID at all: the page renders a
// broken image, and /admin's "คืนรูปเดิม" turns that into the live state with one click. That is
// exactly what `brand-mark` and `hero-home` became — both were deleted from the media library, and
// only the clinic's own uploads (rows in D1 `site_images`) were hiding it. Slots with nothing to
// fall back to are declared without `defaultPublicId` in lib/site-images.ts, and the pages render
// their tonal/icon fallback instead. Verify with:
//   curl -o /dev/null -w '%{http_code}' https://res.cloudinary.com/dvskwrapm/image/upload/<id>
export const cloudAssets = {
  // Flower mark + KAZUMI CLINIC wordmark on olive — the logo Google is shown in JSON-LD, and the
  // fallback for the `brand-logo` slot until the clinic uploads its own.
  logo: 'kazumi-clinic/logo',
  // Moved out of public/ so /admin can replace them — a file under public/ is baked into
  // the build and can only change by shipping code.
  promoActiveRefresh: 'kazumi-clinic/promo-active-refresh',
  promoFillerNeura: 'kazumi-clinic/promo-filler-neura',
  // promo-karisma-collagen and promo-velvet-glow hold each other's artwork — the two source
  // files were swapped long before they reached Cloudinary, and an unsigned upload can't
  // overwrite, so these two IDs replace them. The old pair is now orphaned; delete it from the
  // Cloudinary media library when convenient.
  promoOxelleSkinBooster: 'kazumi-clinic/promo-oxelle-skin-booster',
  promoRadiantBright: 'kazumi-clinic/promo-radiant-bright',
  promoSignatureFlawless: 'kazumi-clinic/promo-signature-flawless',
} as const;

// The old `hero-home` asset had the logo and the "Where balance purity…" quote burnt into its
// right third, so the homepage cropped it to the clean left portion. That asset is gone from
// Cloudinary and the crop box was only ever right for that one file (docs/images.md), so nothing
// is cropped by default any more — whatever the clinic uploads is shown whole.
