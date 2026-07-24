import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServiceItem } from '@/lib/services';

type MergedCategory = { slug: string; title: string; items: ServiceItem[] };

const { getAllMergedCategoriesMock } = vi.hoisted(() => ({
  getAllMergedCategoriesMock: vi.fn<() => Promise<MergedCategory[]>>(),
}));

vi.mock('@/lib/service-products-store', () => ({
  getAllMergedCategories: getAllMergedCategoriesMock,
}));

const { getAllMergedCategories } = await import('@/lib/service-products-store');
const { purchasableProducts, findPurchasableProduct, isPurchasable } = await import('@/lib/members/catalog');
const mockedGetAllMergedCategories = vi.mocked(getAllMergedCategories);

function setMergedCategories(...categories: MergedCategory[]) {
  mockedGetAllMergedCategories.mockResolvedValue(categories as Awaited<ReturnType<typeof getAllMergedCategories>>);
}

beforeEach(() => {
  mockedGetAllMergedCategories.mockReset();
});

describe('members cart catalogue', () => {
  it('maps merged items with ids and prices into cart products, including display titles', async () => {
    setMergedCategories({
      slug: 'merged-filler',
      title: 'Merged Filler',
      items: [
        { id: 'with-detail', name: 'Filler', detail: '1 CC', priceFrom: 1234, unit: 'ครั้ง' },
        { id: 'without-detail', name: 'Simple product', priceFrom: 99, unit: 'ชุด' },
      ],
    });

    await expect(purchasableProducts()).resolves.toEqual([
      {
        id: 'with-detail',
        name: 'Filler',
        detail: '1 CC',
        title: 'Filler · 1 CC',
        priceSatang: 123400,
        unit: 'ครั้ง',
        categorySlug: 'merged-filler',
        categoryTitle: 'Merged Filler',
      },
      {
        id: 'without-detail',
        name: 'Simple product',
        detail: undefined,
        title: 'Simple product',
        priceSatang: 9900,
        unit: 'ชุด',
        categorySlug: 'merged-filler',
        categoryTitle: 'Merged Filler',
      },
    ]);
  });

  it('excludes items without a published price or stable id', async () => {
    setMergedCategories({
      slug: 'consultation-only',
      title: 'Consultation only',
      items: [
        { id: 'ask-price', name: 'Ask price', unit: 'ครั้ง' },
        { name: 'Unidentified product', priceFrom: 500, unit: 'ครั้ง' },
      ],
    });

    await expect(purchasableProducts()).resolves.toEqual([]);
    await expect(findPurchasableProduct('ask-price')).resolves.toBeNull();
  });

  it('finds the matching item across multiple merged categories', async () => {
    setMergedCategories(
      { slug: 'first', title: 'First', items: [{ id: 'first-item', name: 'First', priceFrom: 1, unit: 'ครั้ง' }] },
      { slug: 'second', title: 'Second', items: [{ id: 'target-item', name: 'Target', priceFrom: 2, unit: 'ครั้ง' }] },
    );

    await expect(findPurchasableProduct('target-item')).resolves.toMatchObject({
      id: 'target-item',
      priceSatang: 200,
      categorySlug: 'second',
      categoryTitle: 'Second',
    });
  });

  it('treats an absent product id as not purchasable without reading the catalogue', async () => {
    await expect(isPurchasable(undefined)).resolves.toBe(false);
    expect(mockedGetAllMergedCategories, 'undefined ids must short-circuit before a lookup').not.toHaveBeenCalled();
  });

  it('uses live merged prices and includes products added outside the hardcoded catalogue', async () => {
    // Regression: admin edits and clinic-added products must reach cart pricing via the merged source.
    setMergedCategories({
      slug: 'admin-live',
      title: 'Admin live',
      items: [
        { id: 'edited-shipped-item', name: 'Edited price', priceFrom: 5432, unit: 'ครั้ง' },
        { id: 'clinic-added-item', name: 'Clinic added', priceFrom: 678, unit: 'ชุด' },
      ],
    });

    const products = await purchasableProducts();

    expect(products.find((item) => item.id === 'edited-shipped-item')?.priceSatang).toBe(543200);
    await expect(findPurchasableProduct('clinic-added-item')).resolves.toMatchObject({
      id: 'clinic-added-item',
      priceSatang: 67800,
    });
  });

  it('stops finding an item once the next merged catalogue omits it as hidden', async () => {
    // Regression: a D1 tombstone must remove a formerly purchasable item from cart lookups.
    mockedGetAllMergedCategories
      .mockResolvedValueOnce([
        { slug: 'visible', title: 'Visible', items: [{ id: 'hidden-later', name: 'Visible now', priceFrom: 100, unit: 'ครั้ง' }] },
      ] as Awaited<ReturnType<typeof getAllMergedCategories>>)
      .mockResolvedValueOnce([]);

    await expect(findPurchasableProduct('hidden-later')).resolves.toMatchObject({ id: 'hidden-later' });
    await expect(findPurchasableProduct('hidden-later')).resolves.toBeNull();
  });
});
