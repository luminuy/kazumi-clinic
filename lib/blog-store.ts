import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { cache } from 'react';

/**
 * The blog store. Drives /blog and /blog/[slug] entirely from the `posts` D1 table, with the same
 * degrade-to-safe reads as the other stores: no binding (or a DB blip) yields an empty list rather
 * than a 500. See migrations/0005_posts.sql.
 */

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_public_id: string | null;
  author: string | null;
  published: number;
  published_at: number | null;
  updated_at: number;
  updated_by: string;
};

/** Everything the admin form can set on a post. `id` identifies an existing row. */
export type PostInput = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body: string;
  author?: string | null;
  published: boolean;
};

async function db() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { NEXT_TAG_CACHE_D1?: D1Database }).NEXT_TAG_CACHE_D1 ?? null;
  } catch {
    return null;
  }
}

/** Every post, newest edit first. Empty when D1 is unavailable. React cache dedupes the read. */
export const getPostRows = cache(async (): Promise<PostRow[]> => {
  const binding = await db();
  if (!binding) return [];
  try {
    const { results } = await binding
      .prepare('SELECT * FROM posts ORDER BY updated_at DESC')
      .all<PostRow>();
    return results;
  } catch {
    return [];
  }
});

/** Published posts, newest published first — the /blog listing. */
export async function getPublishedPosts(): Promise<PostRow[]> {
  const rows = await getPostRows();
  return rows
    .filter((row) => row.published === 1)
    .sort((a, b) => (b.published_at ?? 0) - (a.published_at ?? 0));
}

/** A single published post by slug, or undefined — the /blog/[slug] page. */
export async function getPublishedPostBySlug(slug: string): Promise<PostRow | undefined> {
  const rows = await getPostRows();
  return rows.find((row) => row.slug === slug && row.published === 1);
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
  await binding
    .prepare(
      `INSERT INTO posts
         (id, slug, title, excerpt, body, author, published, published_at, updated_at, updated_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
       ON CONFLICT(id) DO UPDATE SET
         slug = ?2, title = ?3, excerpt = ?4, body = ?5, author = ?6, published = ?7,
         -- Keep the original publish date once set; only stamp it on the first publish.
         published_at = CASE
           WHEN ?7 = 1 AND posts.published_at IS NOT NULL THEN posts.published_at
           WHEN ?7 = 1 THEN ?9
           ELSE NULL
         END,
         updated_at = ?9, updated_by = ?10`,
    )
    .bind(
      input.id,
      input.slug,
      input.title,
      input.excerpt ?? null,
      input.body,
      input.author ?? null,
      input.published ? 1 : 0,
      publishedAt,
      now,
      updatedBy,
    )
    .run();
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
export async function deletePost(id: string) {
  const binding = await db();
  requireDb(binding);
  await binding.prepare('DELETE FROM posts WHERE id = ?1').bind(id).run();
}
