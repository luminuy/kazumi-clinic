import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { siteImages, type SiteImageKey } from './site-images';
import { cld } from './cloud';

/**
 * Resolves the Cloudinary public ID for each image slot: whatever the clinic uploaded through
 * /admin, falling back to the default compiled into lib/site-images.ts.
 *
 * Every read is wrapped so a missing or broken D1 binding degrades to the defaults instead of
 * throwing. That matters twice over: `next dev` on a machine that can't run workerd has no
 * bindings at all, and a clinic website should render its shipped photos rather than 500 if the
 * database is briefly unreachable.
 */

export const SITE_IMAGES_TAG = 'site-images';

const defaults = new Map(siteImages.map((image) => [image.key, image.defaultPublicId]));

type Row = { key: string; public_id: string; updated_at: number; updated_by: string };

async function db() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { NEXT_TAG_CACHE_D1?: D1Database }).NEXT_TAG_CACHE_D1 ?? null;
  } catch {
    return null;
  }
}

/** Every override the clinic has saved, keyed by slot. Empty when D1 is unavailable. */
export async function getImageOverrides(): Promise<Map<string, Row>> {
  const binding = await db();
  if (!binding) return new Map();
  try {
    const { results } = await binding
      .prepare('SELECT key, public_id, updated_at, updated_by FROM site_images')
      .all<Row>();
    return new Map(results.map((row: Row) => [row.key, row]));
  } catch {
    return new Map();
  }
}

/** The public ID to render for one slot. */
export async function getImage(key: SiteImageKey): Promise<string> {
  const overrides = await getImageOverrides();
  return overrides.get(key)?.public_id ?? defaults.get(key) ?? '';
}

/** Records the clinic's replacement for a slot. Upsert: re-uploading a slot replaces the row. */
export async function setImage(key: SiteImageKey, publicId: string, updatedBy: string) {
  const binding = await db();
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');
  await binding
    .prepare(
      `INSERT INTO site_images (key, public_id, updated_at, updated_by)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(key) DO UPDATE SET public_id = ?2, updated_at = ?3, updated_by = ?4`,
    )
    .bind(key, publicId, Date.now(), updatedBy)
    .run();
}

/** Drops the clinic's override so the slot falls back to the shipped default. */
export async function resetImage(key: SiteImageKey) {
  const binding = await db();
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');
  await binding.prepare('DELETE FROM site_images WHERE key = ?1').bind(key).run();
}

/**
 * The 1200x630 OG image for a slot, resolved through the override layer.
 *
 * Pages must call this from `generateMetadata`, not a module-level const: a const is evaluated
 * once at build and would keep sharing the shipped photo to LINE and Facebook long after the
 * clinic replaced it.
 */
export async function getOgImage(key: SiteImageKey) {
  const publicId = await getImage(key);
  return cld(publicId, { width: 1200, height: 630, crop: 'fill', gravity: 'auto' });
}
