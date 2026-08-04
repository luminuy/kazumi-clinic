import { CLOUD_NAME } from '@/lib/cloud';

/**
 * URL logic for the same-origin image route, kept out of the route handler so it can be tested
 * without a Worker. See app/api/img/[...path]/route.ts for why the route exists at all.
 */

/**
 * Cloudinary transformation keys this proxy is willing to forward.
 *
 * The point of the allowlist is that the route must never become an open proxy or a way to run
 * arbitrary Cloudinary operations on the clinic's account. Everything here is a pure
 * resize/encode instruction; notably absent are `l_` (layer/overlay — can composite *any other
 * asset* into the response), `if_`/`e_` (conditionals and effects, an enormous surface) and
 * `fetch`-style remote sources.
 */
const ALLOWED_TRANSFORM_KEYS = new Set(['f', 'q', 'c', 'w', 'h', 'g', 'x', 'y', 'dpr', 'ar']);

/** `f_auto`, `w_750`, `c_crop`, `x_0` … — a key from the allowlist plus a conservative value. */
const TRANSFORM_PART = /^([a-z]{1,3})_([a-z0-9]{1,12})$/;

/** Cloudinary public IDs here are folder-ish: `kazumi-clinic/hero-home-1784812468748`. */
const PUBLIC_ID_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

/** True when a path segment is a Cloudinary transformation list rather than part of the public ID. */
export function isTransformSegment(segment: string): boolean {
  const parts = segment.split(',');
  return parts.length > 0 && parts.every((part) => TRANSFORM_PART.test(part));
}

function isSafeTransformSegment(segment: string): boolean {
  return segment.split(',').every((part) => {
    const match = TRANSFORM_PART.exec(part);
    return match !== null && ALLOWED_TRANSFORM_KEYS.has(match[1]);
  });
}

/**
 * Turns the proxy route's captured path back into the Cloudinary delivery URL it stands for, or
 * returns null when anything about it fails validation — the caller must treat null as a 400 and
 * never fall back to "just fetch whatever was asked for".
 */
export function cloudinaryUrlFromProxyPath(segments: string[]): string | null {
  if (segments.length === 0) return null;

  const transforms: string[] = [];
  let index = 0;

  // Zero or more leading transformation segments, then the public ID. cldSrc() can produce two
  // (a crop box followed by the loader's resize), so this isn't capped at one.
  while (index < segments.length && isTransformSegment(segments[index])) {
    if (!isSafeTransformSegment(segments[index])) return null;
    transforms.push(segments[index]);
    index += 1;
  }

  const publicIdSegments = segments.slice(index);
  if (publicIdSegments.length === 0 || publicIdSegments.length > 8) return null;
  if (!publicIdSegments.every((segment) => PUBLIC_ID_SEGMENT.test(segment))) return null;

  const path = [...transforms, ...publicIdSegments].join('/');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${path}`;
}
