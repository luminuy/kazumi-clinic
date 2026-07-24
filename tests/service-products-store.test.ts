import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProductRow } from '@/lib/service-products-store';

const fakeRows = new Map<string, ProductRow[]>();

// getCategoryItems closes over its local reader binding. Replace the reader's React cache wrapper
// so the real merge functions consume the same fixed D1-layer result as the public mock below.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: <T extends (...args: never[]) => unknown>(reader: T) => {
      void reader;
      return (async () => fakeRows) as T;
    },
  };
});

vi.mock('@/lib/service-products-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/service-products-store')>();
  return {
    ...actual,
    getProductRowsByCategory: vi.fn(async () => fakeRows),
  };
});

const { getCategoryItems, getHiddenDefaultProducts } = await import('@/lib/service-products-store');
const { serviceCategories } = await import('@/lib/services');

const category = serviceCategories.find((item) => item.slug === 'filler')!;
const shippedItem = category.items.find((item) => item.id === 'filler-neura-deep-1cc')!;

function productRow(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: shippedItem.id!,
    category: category.slug,
    name: shippedItem.name,
    detail: shippedItem.detail ?? null,
    tagline: shippedItem.tagline ?? null,
    benefits: shippedItem.benefits ? JSON.stringify(shippedItem.benefits) : null,
    collection: shippedItem.collection ?? null,
    price_from: shippedItem.priceFrom ?? null,
    unit: shippedItem.unit,
    image_public_id: null,
    sort_order: 0,
    deleted: 0,
    updated_at: 1,
    updated_by: 'test-admin',
    ...overrides,
  };
}

afterEach(() => {
  fakeRows.clear();
});

describe('service product override merge', () => {
  it('keeps a shipped product unchanged when D1 has no row for it', async () => {
    const items = await getCategoryItems(category.slug);

    expect(items.find((item) => item.id === shippedItem.id), 'missing D1 rows must preserve defaults').toEqual(
      shippedItem,
    );
  });

  it('hides a tombstoned shipped product but returns it for admin restore', async () => {
    fakeRows.set(category.slug, [productRow({ deleted: 1 })]);

    const items = await getCategoryItems(category.slug);
    const hidden = await getHiddenDefaultProducts(category.slug);

    expect(items.some((item) => item.id === shippedItem.id), 'tombstone must remove product from the site').toBe(false);
    expect(hidden.map((item) => item.id), 'tombstone must remain available to restore').toContain(shippedItem.id);
  });

  it('uses the D1 row fields for an edited shipped product', async () => {
    fakeRows.set(
      category.slug,
      [productRow({ name: 'Neura Deep — edited by clinic', price_from: 4321, detail: 'clinic-specific detail' })],
    );

    const item = (await getCategoryItems(category.slug)).find((candidate) => candidate.id === shippedItem.id);

    expect(item?.name, 'D1 name must override the shipped name').toBe('Neura Deep — edited by clinic');
    expect(item?.priceFrom, 'D1 price must override the shipped price').toBe(4321);
    expect(item?.detail).toBe('clinic-specific detail');
  });

  it('includes an active clinic-added product that is absent from the shipped catalogue', async () => {
    fakeRows.set(
      category.slug,
      [
        productRow({
          id: 'clinic-added-filler-test',
          name: 'Clinic-added filler',
          detail: 'custom package',
          benefits: '["custom benefit"]',
          price_from: 7654,
          sort_order: 99,
        }),
      ],
    );

    const item = (await getCategoryItems(category.slug)).find((candidate) => candidate.id === 'clinic-added-filler-test');

    expect(item).toMatchObject({
      id: 'clinic-added-filler-test',
      name: 'Clinic-added filler',
      detail: 'custom package',
      benefits: ['custom benefit'],
      priceFrom: 7654,
    });
  });

  it('does not expose a deleted clinic-added row in the shipped-product restore list', async () => {
    fakeRows.set(category.slug, [productRow({ id: 'clinic-added-deleted-test', deleted: 1 })]);

    const hidden = await getHiddenDefaultProducts(category.slug);

    expect(hidden.map((item) => item.id), 'only shipped-product tombstones are restorable').not.toContain(
      'clinic-added-deleted-test',
    );
  });
});
