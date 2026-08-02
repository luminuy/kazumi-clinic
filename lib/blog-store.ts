import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { cache } from 'react';
import { localizePost } from '@/lib/content-locale';
import type { Locale } from '@/lib/site';

/**
 * The blog store. Drives /blog and /blog/[slug] entirely from the `posts` D1 table, with the same
 * degrade-to-safe reads as the other stores: no binding (or a DB blip) yields an empty list rather
 * than a 500. See migrations/0005_posts.sql.
 */

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  excerpt: string | null;
  excerpt_en: string | null;
  body: string;
  body_en: string | null;
  cover_image_public_id: string | null;
  author: string | null;
  published: number;
  published_at: number | null;
  updated_at: number;
  updated_by: string;
  /** A serviceCategories slug (lib/services.ts) or null — drives the /blog category filter. */
  category: string | null;
  /** Manual order for /admin/blog — see migrations/0015_posts_sort_order.sql. */
  sort_order: number;
};

/** Everything the admin form can set on a post. `id` identifies an existing row. */
export type PostInput = {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  excerpt?: string | null;
  excerptEn?: string | null;
  body: string;
  bodyEn?: string | null;
  author?: string | null;
  published: boolean;
  category?: string | null;
  /** Only used on a fresh INSERT — upsert keeps an existing row's order (see upsertPost). */
  sortOrder?: number;
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
 * Every post in admin order. Empty when D1 is unavailable. React cache dedupes the read.
 * `sort_order` leads (manual arrangement from /admin/blog); `updated_at DESC` breaks ties, which
 * is every row until the first reorder — so this is a no-op change in ordering right after the
 * migration runs, not a visible reshuffle.
 */
export const getPostRows = cache(async (): Promise<PostRow[]> => {
  const binding = await db();
  if (!binding) return [];
  try {
    const { results } = await binding
      .prepare('SELECT * FROM posts ORDER BY sort_order ASC, updated_at DESC')
      .all<PostRow>();
    return results;
  } catch {
    return [];
  }
});

/** Published posts, newest published first — the /blog listing. */
export async function getPublishedPosts(locale: Locale | string = 'th'): Promise<PostRow[]> {
  const rows = await getPostRows();
  return rows
    .filter((row) => row.published === 1)
    .sort((a, b) => (b.published_at ?? 0) - (a.published_at ?? 0))
    .map((row) => localizePost(row, locale));
}

/** A single published post by slug, or undefined — the /blog/[slug] page. */
export async function getPublishedPostBySlug(
  slug: string,
  locale: Locale | string = 'th',
): Promise<PostRow | undefined> {
  const rows = await getPostRows();
  const row = rows.find((candidate) => candidate.slug === slug && candidate.published === 1);
  return row ? localizePost(row, locale) : undefined;
}

/** Every post, drafts included — what the admin list renders. */
export async function getAllPosts(): Promise<PostRow[]> {
  return getPostRows();
}

// ── Writes (used by the /admin blog API) ────────────────────────────────────────────────────

function requireDb(binding: D1Database | null): asserts binding is D1Database {
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');
}

/** True when `slug` is already taken by a different post — the API rejects the save if so. */
export async function slugTaken(slug: string, exceptId: string): Promise<boolean> {
  const binding = await db();
  if (!binding) return false;
  try {
    const row = await binding
      .prepare('SELECT id FROM posts WHERE slug = ?1 AND id != ?2')
      .bind(slug, exceptId)
      .first<{ id: string }>();
    return row !== null;
  } catch {
    return false;
  }
}

/**
 * Insert or update a post. Deliberately does NOT touch `cover_image_public_id` (owned by
 * setPostImage) so editing text never wipes the cover. `published_at` is stamped the first time a
 * post goes live and preserved thereafter, so editing a published post doesn't reset its date.
 */
export async function upsertPost(input: PostInput, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  const now = Date.now();
  const publishedAt = input.published ? now : null;
  try {
    await binding
      .prepare(
        `INSERT INTO posts
           (id, slug, title, title_en, excerpt, excerpt_en, body, body_en, author, published,
            published_at, updated_at, updated_by, category, sort_order)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
         ON CONFLICT(id) DO UPDATE SET
           slug = ?2, title = ?3, title_en = ?4, excerpt = ?5, excerpt_en = ?6,
           body = ?7, body_en = ?8, author = ?9, published = ?10,
           -- Keep the original publish date once set; only stamp it on the first publish.
           published_at = CASE
             WHEN ?10 = 1 AND posts.published_at IS NOT NULL THEN posts.published_at
             WHEN ?10 = 1 THEN ?12
             ELSE NULL
           END,
           -- sort_order is deliberately absent here: an edit never moves a post, only reorderPosts() does.
           updated_at = ?12, updated_by = ?13, category = ?14`,
      )
      .bind(
        input.id,
        input.slug,
        input.title,
        input.titleEn ?? null,
        input.excerpt ?? null,
        input.excerptEn ?? null,
        input.body,
        input.bodyEn ?? null,
        input.author ?? null,
        input.published ? 1 : 0,
        publishedAt,
        now,
        updatedBy,
        input.category ?? null,
        input.sortOrder ?? 0,
      )
      .run();
  } catch (error) {
    // `ON CONFLICT(id)` only covers the id collision — a concurrent save picking the same new
    // slug for a *different* id can still race past the slugTaken() pre-check in the API route
    // and hit the separate UNIQUE constraint on posts.slug. Map that to the same typed error the
    // pre-check would have thrown, so the route doesn't need to know which guard actually caught it.
    if (error instanceof Error && /UNIQUE constraint failed.*posts\.slug/.test(error.message)) {
      throw new Error('SLUG_TAKEN');
    }
    throw error;
  }
}

/** Persists a new manual order for /admin/blog — mirrors reorderPromotions/reorderReviews. */
export async function reorderPosts(orderedIds: string[], updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  const now = Date.now();
  const statements = orderedIds.map((id, index) =>
    binding
      .prepare('UPDATE posts SET sort_order = ?1, updated_at = ?2, updated_by = ?3 WHERE id = ?4')
      .bind(index, now, updatedBy, id),
  );
  if (statements.length > 0) await binding.batch(statements);
}

/** One past the last row — where a brand-new post goes by default, same as promotions/reviews. */
export async function nextSortOrder(): Promise<number> {
  const rows = await getPostRows();
  return rows.length;
}

/** Sets a post's cover photo, leaving every other field untouched. */
export async function setPostImage(id: string, imagePublicId: string, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare(
      'UPDATE posts SET cover_image_public_id = ?1, updated_at = ?2, updated_by = ?3 WHERE id = ?4',
    )
    .bind(imagePublicId, Date.now(), updatedBy, id)
    .run();
}

/** Remove a post outright. */
/**
 * Removes a post and reports the slug it had. The caller needs that slug to purge the article's own
 * cached URL: without it a deleted post keeps being served from the ISR cache for up to an hour —
 * which for clinic content (a wrong price, an unreviewed medical claim) is exactly the case where
 * "deleted" has to mean gone now. Returns null when the id matched nothing.
 */
export async function deletePost(id: string): Promise<string | null> {
  const binding = await db();
  requireDb(binding);
  const row = await binding
    .prepare('DELETE FROM posts WHERE id = ?1 RETURNING slug')
    .bind(id)
    .first<{ slug: string }>();
  return row?.slug ?? null;
}
