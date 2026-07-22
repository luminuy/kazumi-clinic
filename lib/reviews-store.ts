import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { cache } from 'react';

/**
 * The reviews store. Same D1 access and degrade-to-safe philosophy as the other stores. /reviews
 * is driven entirely by the `reviews` table — an empty (or unavailable) table leaves the page in
 * its scaffold state rather than 500-ing.
 *
 * COMPLIANCE (CLAUDE.md §0.2): `getPublishedReviews` returns only rows the clinic has both marked
 * published AND confirmed patient consent for; before/after images are additionally hidden without
 * consent. The admin sees everything via `getAllReviews`.
 *
 * See migrations/0004_reviews.sql for the columns.
 */

export type ReviewRow = {
  id: string;
  name: string;
  rating: number | null;
  quote: string | null;
  procedure: string | null;
  category_slug: string | null;
  before_image_public_id: string | null;
  after_image_public_id: string | null;
  consent: number;
  published: number;
  sort_order: number;
  updated_at: number;
  updated_by: string;
};

/** A review resolved for public rendering — before/after already gated on consent. */
export type PublicReview = {
  id: string;
  name: string;
  rating: number | null;
  quote: string | null;
  procedure: string | null;
  categorySlug: string | null;
  beforeImagePublicId: string | null;
  afterImagePublicId: string | null;
};

/** Everything the admin form can set on a review. `id` identifies an existing row. */
export type ReviewInput = {
  id: string;
  name: string;
  rating?: number | null;
  quote?: string | null;
  procedure?: string | null;
  categorySlug?: string | null;
  consent: boolean;
  published: boolean;
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

/** Every review row in display order. Empty when D1 is unavailable. React cache dedupes the read. */
export const getReviewRows = cache(async (): Promise<ReviewRow[]> => {
  const binding = await db();
  if (!binding) return [];
  try {
    const { results } = await binding
      .prepare('SELECT * FROM reviews ORDER BY sort_order')
      .all<ReviewRow>();
    return results;
  } catch {
    return [];
  }
});

/**
 * The reviews the public page shows: published AND consented, in admin order. Before/after images
 * are stripped when consent is missing — belt and braces, since a non-consented row never reaches
 * here anyway, this keeps the rule local to the mapping too.
 */
export async function getPublishedReviews(): Promise<PublicReview[]> {
  const rows = await getReviewRows();
  return rows
    .filter((row) => row.published === 1 && row.consent === 1)
    .map((row) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      quote: row.quote,
      procedure: row.procedure,
      categorySlug: row.category_slug,
      beforeImagePublicId: row.consent === 1 ? row.before_image_public_id : null,
      afterImagePublicId: row.consent === 1 ? row.after_image_public_id : null,
    }));
}

/** Every review, unpublished included — what the admin list renders. Empty when D1 is down. */
export async function getAllReviews(): Promise<ReviewRow[]> {
  return getReviewRows();
}

// ── Writes (used by the /admin reviews API) ─────────────────────────────────────────────────

function requireDb(binding: D1Database | null): asserts binding is D1Database {
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');
}

/**
 * Insert a review, or edit its text fields and flags. Deliberately does NOT touch the before/after
 * image ids — those are owned by setReviewImage — so editing the quote never wipes an uploaded photo.
 */
export async function upsertReview(input: ReviewInput, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare(
      `INSERT INTO reviews
         (id, name, rating, quote, procedure, category_slug, consent, published,
          sort_order, updated_at, updated_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
       ON CONFLICT(id) DO UPDATE SET
         name = ?2, rating = ?3, quote = ?4, procedure = ?5, category_slug = ?6,
         consent = ?7, published = ?8, updated_at = ?10, updated_by = ?11`,
    )
    .bind(
      input.id,
      input.name,
      input.rating ?? null,
      input.quote ?? null,
      input.procedure ?? null,
      input.categorySlug ?? null,
      input.consent ? 1 : 0,
      input.published ? 1 : 0,
      input.sortOrder,
      Date.now(),
      updatedBy,
    )
    .run();
}

/** Sets one of the before/after photos. `which` decides the column. */
export async function setReviewImage(
  id: string,
  which: 'before' | 'after',
  imagePublicId: string,
  updatedBy: string,
) {
  const binding = await db();
  requireDb(binding);
  const column = which === 'before' ? 'before_image_public_id' : 'after_image_public_id';
  await binding
    .prepare(`UPDATE reviews SET ${column} = ?1, updated_at = ?2, updated_by = ?3 WHERE id = ?4`)
    .bind(imagePublicId, Date.now(), updatedBy, id)
    .run();
}

/** Remove a review outright — there is no code default for it to fall back to. */
export async function deleteReview(id: string) {
  const binding = await db();
  requireDb(binding);
  await binding.prepare('DELETE FROM reviews WHERE id = ?1').bind(id).run();
}

/** Persist a new order. Every id is expected to already have a row; unknown ids are ignored. */
export async function reorderReviews(orderedIds: string[], updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  const now = Date.now();
  const statements = orderedIds.map((id, index) =>
    binding
      .prepare('UPDATE reviews SET sort_order = ?1, updated_at = ?2, updated_by = ?3 WHERE id = ?4')
      .bind(index, now, updatedBy, id),
  );
  if (statements.length > 0) await binding.batch(statements);
}

/** One past the last row — where a brand-new review goes by default. */
export async function nextSortOrder(): Promise<number> {
  return (await getReviewRows()).length;
}
