import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EntityImageRow } from '@/lib/entity-images-store';

/**
 * A minimal in-memory stand-in for the D1 binding, just enough to exercise
 * lib/entity-images-store.ts's SQL without a real Cloudflare runtime.
 */
let rows: EntityImageRow[] = [];

function fakeDb() {
  return {
    prepare(sql: string) {
      const statement = {
        _sql: sql,
        _args: [] as unknown[],
        bind(...args: unknown[]) {
          statement._args = args;
          return statement;
        },
        async all<T>() {
          if (sql.startsWith('SELECT')) {
            const [entityType, entityId] = statement._args as [string, string];
            const results = rows
              .filter((r) => r.entity_type === entityType && r.entity_id === entityId)
              .sort((a, b) => a.sort_order - b.sort_order);
            return { results: results as unknown as T[] };
          }
          return { results: [] as T[] };
        },
        async run() {
          if (sql.startsWith('INSERT')) {
            const [id, entity_type, entity_id, public_id, sort_order, created_at] = statement._args as [
              string,
              string,
              string,
              string,
              number,
              number,
            ];
            rows.push({ id, entity_type: entity_type as EntityImageRow['entity_type'], entity_id, public_id, sort_order, created_at });
          } else if (sql.startsWith('DELETE')) {
            const [id] = statement._args as [string];
            const before = rows.length;
            rows = rows.filter((r) => r.id !== id);
            return { meta: { changes: before - rows.length } };
          } else if (sql.startsWith('UPDATE')) {
            const [sortOrder, id] = statement._args as [number, string];
            const row = rows.find((r) => r.id === id);
            if (row) row.sort_order = sortOrder;
          }
          return { meta: { changes: 1 } };
        },
      };
      return statement;
    },
    async batch(statements: { run: () => Promise<unknown> }[]) {
      for (const statement of statements) await statement.run();
    },
  };
}

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(async () => ({ env: { NEXT_TAG_CACHE_D1: fakeDb() } })),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, cache: <T,>(fn: T) => fn };
});

const { addEntityImage, getEntityImages, removeEntityImage, reorderEntityImages, MAX_IMAGES_PER_ENTITY } =
  await import('@/lib/entity-images-store');

afterEach(() => {
  rows = [];
});

describe('entity image gallery (migrations/0019_entity_images.sql)', () => {
  it('appends photos in order and reports them back for that entity only', async () => {
    await addEntityImage('product', 'p1', 'photo-a');
    await addEntityImage('product', 'p1', 'photo-b');
    await addEntityImage('product', 'other', 'unrelated');

    const gallery = await getEntityImages('product', 'p1');
    expect(gallery.map((row) => row.public_id)).toEqual(['photo-a', 'photo-b']);
  });

  it(`refuses a ${MAX_IMAGES_PER_ENTITY + 1}th photo instead of silently dropping it`, async () => {
    for (let i = 0; i < MAX_IMAGES_PER_ENTITY; i++) {
      await addEntityImage('post', 'article-1', `photo-${i}`);
    }

    await expect(addEntityImage('post', 'article-1', 'one-too-many')).rejects.toThrow('GALLERY_FULL');
    expect(await getEntityImages('post', 'article-1')).toHaveLength(MAX_IMAGES_PER_ENTITY);
  });

  it('removing a photo makes room for a new one again', async () => {
    const added: string[] = [];
    for (let i = 0; i < MAX_IMAGES_PER_ENTITY; i++) {
      const row = await addEntityImage('promotion', 'promo-1', `photo-${i}`);
      added.push(row.id);
    }

    await removeEntityImage(added[0]);
    await expect(addEntityImage('promotion', 'promo-1', 'fresh-photo')).resolves.toMatchObject({
      public_id: 'fresh-photo',
    });
  });

  it('reorder persists the new sequence', async () => {
    const a = await addEntityImage('product', 'p2', 'first');
    const b = await addEntityImage('product', 'p2', 'second');

    await reorderEntityImages('product', 'p2', [b.id, a.id]);

    const gallery = await getEntityImages('product', 'p2');
    expect(gallery.map((row) => row.public_id)).toEqual(['second', 'first']);
  });
});
