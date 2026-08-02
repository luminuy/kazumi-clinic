import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { cache } from 'react';

/**
 * The extra-photos gallery shared by products, promotions, and blog posts — see
 * migrations/0019_entity_images.sql for why this is one table rather than three. Each entity's
 * existing single `image_public_id`/`cover_image_public_id` column is untouched by this store and
 * keeps driving every public-facing render; this is purely the admin-managed "additional photos"
 * gallery, not yet wired into any public template.
 */

export type EntityType = 'product' | 'promotion' | 'post';

export type EntityImageRow = {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  public_id: string;
  sort_order: number;
  created_at: number;
};

/** No admin-facing gallery may exceed this many photos — enforced server-side, not just in the UI. */
export const MAX_IMAGES_PER_ENTITY = 6;

async function db() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { NEXT_TAG_CACHE_D1?: D1Database }).NEXT_TAG_CACHE_D1 ?? null;
  } catch {
    return null;
  }
}

function requireDb(binding: D1Database | null): asserts binding is D1Database {
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');
}

/** Every extra photo for one entity, in gallery order. Empty when D1 is unavailable. */
export const getEntityImages = cache(
  async (entityType: EntityType, entityId: string): Promise<EntityImageRow[]> => {
    const binding = await db();
    if (!binding) return [];
    try {
      const { results } = await binding
        .prepare(
          'SELECT * FROM entity_images WHERE entity_type = ?1 AND entity_id = ?2 ORDER BY sort_order ASC',
        )
        .bind(entityType, entityId)
        .all<EntityImageRow>();
      return results;
    } catch {
      return [];
    }
  },
);

/**
 * Appends a photo to an entity's gallery. Throws GALLERY_FULL rather than silently dropping the
 * upload when the cap is already hit — the caller (the API route) turns that into a 4xx the admin
 * actually sees, instead of an upload that looked like it worked but didn't.
 */
export async function addEntityImage(
  entityType: EntityType,
  entityId: string,
  publicId: string,
): Promise<EntityImageRow> {
  const binding = await db();
  requireDb(binding);
  const existing = await getEntityImages(entityType, entityId);
  if (existing.length >= MAX_IMAGES_PER_ENTITY) {
    throw new Error('GALLERY_FULL');
  }
  const row: EntityImageRow = {
    id: `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    entity_type: entityType,
    entity_id: entityId,
    public_id: publicId,
    sort_order: existing.length,
    created_at: Date.now(),
  };
  await binding
    .prepare(
      'INSERT INTO entity_images (id, entity_type, entity_id, public_id, sort_order, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)',
    )
    .bind(row.id, row.entity_type, row.entity_id, row.public_id, row.sort_order, row.created_at)
    .run();
  return row;
}

/** Removes one photo from a gallery. Returns false when the id matched nothing. */
export async function removeEntityImage(id: string): Promise<boolean> {
  const binding = await db();
  requireDb(binding);
  const result = await binding.prepare('DELETE FROM entity_images WHERE id = ?1').bind(id).run();
  return result.meta.changes > 0;
}

/** Persists a new photo order within one entity's gallery. Unknown ids are ignored. */
export async function reorderEntityImages(
  entityType: EntityType,
  entityId: string,
  orderedIds: string[],
): Promise<void> {
  const binding = await db();
  requireDb(binding);
  const statements = orderedIds.map((id, index) =>
    binding
      .prepare(
        'UPDATE entity_images SET sort_order = ?1 WHERE id = ?2 AND entity_type = ?3 AND entity_id = ?4',
      )
      .bind(index, id, entityType, entityId),
  );
  if (statements.length > 0) await binding.batch(statements);
}
