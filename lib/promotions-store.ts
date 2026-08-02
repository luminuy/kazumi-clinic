import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { cache } from 'react';
import { localizePromotion } from '@/lib/content-locale';
import type { Locale } from '@/lib/site';
import { activePromotions as codeActivePromotions, type Promotion } from './promotions';

/**
 * The promotions store. Same D1 access and degrade-to-safe philosophy as the other stores, but a
 * simpler shape: /admin/promotions owns the whole `promotions` table outright — there is no
 * hardcoded list to override, because the offers in lib/promotions.ts are expired templates kept
 * only as a fallback.
 *
 * When the D1 binding is missing (e.g. `next dev` with no bindings) a read returns `null`, and the
 * public helpers fall back to the code list so the page still renders. When the binding is present
 * the table is authoritative — an empty table correctly yields the "no current promotions" state.
 *
 * See migrations/0003_promotions.sql for the columns.
 */

export type PromotionRow = {
  id: string;
  name: string;
  name_en: string | null;
  detail: string | null;
  detail_en: string | null;
  price: number | null;
  original_price: number | null;
  note: string | null;
  note_en: string | null;
  valid_until: string;
  category_slug: string | null;
  sort_order: number;
  updated_at: number;
  updated_by: string;
  image_public_id: string | null;
  /** Soft-delete flag — see migrations/0016_promotions_deleted.sql. */
  deleted: number;
};

/** Everything the admin form can set on a promotion. `id` identifies an existing row. */
export type PromotionInput = {
  id: string;
  name: string;
  nameEn?: string | null;
  detail?: string | null;
  detailEn?: string | null;
  price?: number | null;
  originalPrice?: number | null;
  note?: string | null;
  noteEn?: string | null;
  validUntil: string;
  categorySlug?: string | null;
  sortOrder: number;
  imagePublicId?: string | null;
};

async function db() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { NEXT_TAG_CACHE_D1?: D1Database }).NEXT_TAG_CACHE_D1 ?? null;
  } catch {
    return null;
  }
}

/**
 * Every promotion row in display order, or `null` when D1 is unavailable (the caller's cue to fall
 * back to the code list). React cache dedupes the read across a single render.
 */
export const getPromotionRows = cache(async (): Promise<PromotionRow[] | null> => {
  const binding = await db();
  if (!binding) return null;
  try {
    const { results } = await binding
      .prepare('SELECT * FROM promotions ORDER BY sort_order')
      .all<PromotionRow>();
    return results;
  } catch {
    return null;
  }
});

function rowToPromotion(row: PromotionRow): Promotion {
  return {
    name: row.name,
    detail: row.detail ?? undefined,
    price: row.price ?? undefined,
    originalPrice: row.original_price ?? undefined,
    note: row.note ?? undefined,
    validUntil: row.valid_until,
    categorySlug: row.category_slug ?? undefined,
    imagePublicId: row.image_public_id ?? undefined,
  };
}

/**
 * The promotions the public page shows: still-valid rows in admin order. Compares date-only and
 * inclusive of `validUntil`, matching the code fallback. Falls back to lib/promotions.ts when D1
 * is unavailable so `next dev` and a momentary DB outage still render.
 */
export async function getActivePromotions(
  locale: Locale | string = 'th',
  now: Date = new Date(),
): Promise<Promotion[]> {
  const rows = await getPromotionRows();
  if (rows === null) return codeActivePromotions(now);
  const today = now.toISOString().slice(0, 10);
  return rows
    .filter((row) => row.deleted === 0 && row.valid_until >= today)
    .map((row) => rowToPromotion(localizePromotion(row, locale)));
}

/**
 * Every non-hidden promotion, expired ones included — what the main /admin/promotions list
 * renders. Empty when D1 is down. Hidden (soft-deleted) rows live in getHiddenPromotions instead.
 */
export async function getAllPromotions(): Promise<PromotionRow[]> {
  const rows = (await getPromotionRows()) ?? [];
  return rows.filter((row) => row.deleted === 0);
}

/** Promotions the clinic hid, kept separately so the admin can restore them. */
export async function getHiddenPromotions(): Promise<PromotionRow[]> {
  const rows = (await getPromotionRows()) ?? [];
  return rows.filter((row) => row.deleted === 1);
}

// ── Writes (used by the /admin promotions API) ──────────────────────────────────────────────

function requireDb(binding: D1Database | null): asserts binding is D1Database {
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');
}

/**
 * Insert a promotion, or update the editable fields of an existing one. The UPDATE branch
 * deliberately does NOT touch `image_public_id`: the image is owned by `setPromotionImage` (the
 * upload button) alone. Clobbering it here meant a plain field edit — which carries whatever
 * `imagePublicId` the client draft happened to hold, often stale or null — silently wiped an
 * already-uploaded poster. `upsertProduct` and `upsertReview` guard their images the same way.
 */
export async function upsertPromotion(input: PromotionInput, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare(
      `INSERT INTO promotions
         (id, name, name_en, detail, detail_en, price, original_price, note, note_en, valid_until,
          category_slug, sort_order, updated_at, updated_by, image_public_id)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
       ON CONFLICT(id) DO UPDATE SET
         name = ?2, name_en = ?3, detail = ?4, detail_en = ?5, price = ?6,
         original_price = ?7, note = ?8, note_en = ?9, valid_until = ?10,
         category_slug = ?11, updated_at = ?13, updated_by = ?14`,
    )
    .bind(
      input.id,
      input.name,
      input.nameEn ?? null,
      input.detail ?? null,
      input.detailEn ?? null,
      input.price ?? null,
      input.originalPrice ?? null,
      input.note ?? null,
      input.noteEn ?? null,
      input.validUntil,
      input.categorySlug ?? null,
      input.sortOrder,
      Date.now(),
      updatedBy,
      input.imagePublicId ?? null,
    )
    .run();
}

/** Hide a promotion — a tombstone (deleted = 1), never a hard delete, so it stays restorable. */
export async function deletePromotion(id: string, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare('UPDATE promotions SET deleted = 1, updated_at = ?1, updated_by = ?2 WHERE id = ?3')
    .bind(Date.now(), updatedBy, id)
    .run();
}

/** Restore a promotion that was previously hidden with a tombstone. */
export async function restorePromotion(id: string, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare('UPDATE promotions SET deleted = 0, updated_at = ?1, updated_by = ?2 WHERE id = ?3')
    .bind(Date.now(), updatedBy, id)
    .run();
}

/** Updates just the image_public_id for an existing promotion. */
export async function setPromotionImage(id: string, imagePublicId: string, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare('UPDATE promotions SET image_public_id = ?1, updated_at = ?2, updated_by = ?3 WHERE id = ?4')
    .bind(imagePublicId, Date.now(), updatedBy, id)
    .run();
}

/** Persist a new order. Every id is expected to already have a row; unknown ids are ignored. */
export async function reorderPromotions(orderedIds: string[], updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  const now = Date.now();
  const statements = orderedIds.map((id, index) =>
    binding
      .prepare('UPDATE promotions SET sort_order = ?1, updated_at = ?2, updated_by = ?3 WHERE id = ?4')
      .bind(index, now, updatedBy, id),
  );
  if (statements.length > 0) await binding.batch(statements);
}

/** One past the last row — where a brand-new promotion goes by default. */
export async function nextSortOrder(): Promise<number> {
  const rows = await getPromotionRows();
  return rows ? rows.length : 0;
}
