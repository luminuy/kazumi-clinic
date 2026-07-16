// Cloudinary helpers — single source of truth for the cloud name and URL building.
// Assets live under the `kazumi-clinic/` folder in the account.
const CLOUD_NAME = 'dvskwrapm';

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
 * Exact pixel crop followed by a resize, as two chained transformation segments
 * (Cloudinary requires the crop segment before the resize segment when chaining —
 * a single `c_crop,...,w_,h_` segment treats width/height as the crop box, not the
 * final output size). Used for cropping a sub-region out of a larger source image,
 * e.g. isolating just the flower mark out of the full logo-plus-wordmark asset.
 */
export function cldCropThenResize(
  publicId: string,
  crop: { width: number; height: number; x: number; y: number },
  resize: { width?: number; height?: number } = {},
) {
  const cropSeg = `c_crop,w_${crop.width},h_${crop.height},x_${crop.x},y_${crop.y}`;
  const resizeParts = ['f_auto', 'q_auto'];
  if (resize.width) resizeParts.push(`w_${resize.width}`);
  if (resize.height) resizeParts.push(`h_${resize.height}`);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${cropSeg}/${resizeParts.join(',')}/${publicId}`;
}

/**
 * A `next/image` src that carries its own leading transformation segment, e.g.
 * `cldSrc(cloudAssets.heroHome, 'c_crop,w_1060,h_1080,x_0,y_0')`. The loader below appends
 * its `f_auto,q_,w_` segment *after* these, which is the order Cloudinary needs for a crop
 * (see `cldCropThenResize`) — so this is how you feed next/image a sub-region of an asset.
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
  const resize = `f_auto,q_${quality ?? 'auto'},w_${width}`;
  const [head, ...rest] = src.split('/');
  const prefix = rest.length > 0 && TRANSFORM_SEGMENT.test(head) ? `${head}/` : '';
  const publicId = prefix ? rest.join('/') : src;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${prefix}${resize}/${publicId}`;
}

export default cloudinaryLoader;

// Known asset public IDs — keep in sync with what's actually uploaded in Cloudinary.
// There's no separate og-default asset — the default OG/Twitter image is just heroHome
// cropped to 1200x630 via cld(cloudAssets.heroHome, { width: 1200, height: 630, crop: 'fill' }).
export const cloudAssets = {
  logo: 'kazumi-clinic/logo',
  heroHome: 'kazumi-clinic/hero-home',
  heroFiller: 'kazumi-clinic/hero-filler',
  heroIvDrip1: 'kazumi-clinic/hero-iv-drip-1',
  heroIvDrip2: 'kazumi-clinic/hero-iv-drip-2',
  heroIvDrip3: 'kazumi-clinic/hero-iv-drip-3',
  heroSkinBooster: 'kazumi-clinic/hero-skin-booster',
} as const;

// The `hero-home` asset (1920x1080) has the logo and the "Where balance purity…" quote burnt
// into its right third — showing it behind the page's own <h1> duplicates that copy. The clean
// portrait is everything left of x≈1100, so the homepage hero uses this crop and renders the
// live headline beside it instead of on top of it.
export const heroHomePortrait = cldSrc(cloudAssets.heroHome, 'c_crop,w_1060,h_1080,x_0,y_0');

// `logo` is a 1500x1500 asset with the flower mark up top and "KAZUMI CLINIC" wordmark
// below — the header only wants the mark. Crop box measured directly from the source
// pixels (flower spans roughly x:491-1008, y:306-824) with ~18% padding on each side.
export const logoIconUrl = cldCropThenResize(
  cloudAssets.logo,
  { width: 704, height: 704, x: 397, y: 213 },
  { width: 96, height: 96 },
);
