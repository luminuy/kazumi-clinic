import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { cache } from 'react';
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
  detail: string | null;
  price: number;
  original_price: number | null;
  note: string | null;
  valid_until: string;
  category_slug: string | null;
  sort_order: number;
  updated_at: number;
  updated_by: string;
};

/** Everything the admin form can set on a promotion. `id` identifies an existing row. */
export type PromotionInput = {
  id: string;
  name: string;
  detail?: string | null;
  price: number;
  originalPrice?: number | null;
  note?: string | null;
  validUntil: string;
  categorySlug?: string | null;
  sortOrder: number;
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
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    note: row.note ?? undefined,
    validUntil: row.valid_until,
    categorySlug: row.category_slug ?? undefined,
  };
}

/**
 * The promotions the public page shows: still-valid rows in admin order. Compares date-only and
 * inclusive of `validUntil`, matching the code fallback. Falls back to lib/promotions.ts when D1
 * is unavailable so `next dev` and a momentary DB outage still render.
 */
export async function getActivePromotions(now: Date = new Date()): Promise<Promotion[]> {
  const rows = await getPromotionRows();
  if (rows === null) return codeActivePromotions(now);
  const today = now.toISOString().slice(0, 10);
  return rows.filter((row) => row.valid_until >= today).map(rowToPromotion);
}

/** Every promotion, expired ones included — what the admin list renders. Empty when D1 is down. */
export async function getAllPromotions(): Promise<PromotionRow[]> {
  return (await getPromotionRows()) ?? [];
}

// ── Writes (used by the /admin promotions API) ──────────────────────────────────────────────

function requireDb(binding: D1Database | null): asserts binding is D1Database {
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');
}

/** Insert a promotion, or replace every field of an existing one. The row is self-contained. */
export async function upsertPromotion(input: PromotionInput, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare(
      `INSERT INTO promotions
         (id, name, detail, price, original_price, note, valid_until, category_slug,
          sort_order, updated_at, updated_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
       ON CONFLICT(id) DO UPDATE SET
         name = ?2, detail = ?3, price = ?4, original_price = ?5, note = ?6, valid_until = ?7,
         category_slug = ?8, updated_at = ?10, updated_by = ?11`,
    )
    .bind(
      input.id,
      input.name,
      input.detail ?? null,
      input.price,
      input.originalPrice ?? null,
      input.note ?? null,
      input.validUntil,
      input.categorySlug ?? null,
      input.sortOrder,
      Date.now(),
      updatedBy,
    )
    .run();
}

/** Remove a promotion outright — there is no code default for it to fall back to. */
export async function deletePromotion(id: string) {
  const binding = await db();
  requireDb(binding);
  await binding.prepare('DELETE FROM promotions WHERE id = ?1').bind(id).run();
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
