import type { Metadata } from 'next';
import { serviceCategories, type ServiceItem } from '@/lib/services';
import {
  getCategoryItems,
  getHiddenProducts,
  type MergedServiceItem,
} from '@/lib/service-products-store';
import { type AdminProduct } from '@/components/admin/product-category-editor';
import { ProductTabs } from '@/components/admin/product-tabs';
import { PageHeading } from '@/components/admin/ui';
import { getEntityImages } from '@/lib/entity-images-store';

export const metadata: Metadata = { title: 'สินค้า' };

// The clinic's product edits are per-request state, not build output.
export const dynamic = 'force-dynamic';

/**
 * Whether a shipped product's live content actually differs from its code default. Compared by
 * content, not by "has a D1 row" — reordering writes rows for every product in a category, and a
 * product that only moved shouldn't read as "แก้ไขแล้ว".
 */
function isContentEdited(base: ServiceItem, live: MergedServiceItem): boolean {
  if (live.imagePublicId) return true;
  const norm = (v: string | number | undefined) => v ?? '';
  return (
    norm(base.name) !== norm(live.name) ||
    norm(base.detail) !== norm(live.detail) ||
    norm(base.tagline) !== norm(live.tagline) ||
    norm(base.collection) !== norm(live.collection) ||
    norm(base.priceFrom) !== norm(live.priceFrom) ||
    norm(base.unit) !== norm(live.unit) ||
    norm(live.nameEn ?? undefined) !== '' ||
    norm(live.detailEn ?? undefined) !== '' ||
    norm(live.taglineEn ?? undefined) !== '' ||
    JSON.stringify(live.benefitsEn ?? []) !== '[]' ||
    JSON.stringify(base.benefits ?? []) !== JSON.stringify(live.benefits ?? [])
  );
}

async function toAdminProduct(item: MergedServiceItem, base?: ServiceItem): Promise<AdminProduct> {
  const gallery = item.id ? await getEntityImages('product', item.id) : [];
  return {
    id: item.id ?? '',
    name: item.name,
    nameEn: item.nameEn ?? '',
    detail: item.detail ?? '',
    detailEn: item.detailEn ?? '',
    tagline: item.tagline ?? '',
    taglineEn: item.taglineEn ?? '',
    benefits: item.benefits ?? [],
    benefitsEn: item.benefitsEn ?? [],
    collection: item.collection ?? '',
    priceFrom: item.priceFrom ?? null,
    unit: item.unit,
    imagePublicId: item.imagePublicId ?? null,
    isDefault: Boolean(base),
    isEdited: base ? isContentEdited(base, item) : false,
    galleryImages: gallery.map((row) => ({ id: row.id, publicId: row.public_id })),
  };
}

export default async function AdminProductsPage() {
  const categories = await Promise.all(
    serviceCategories.map(async (category) => {
      const baseById = new Map(category.items.map((item) => [item.id, item]));
      const [items, hiddenItems] = await Promise.all([
        getCategoryItems(category.slug),
        getHiddenProducts(category.slug),
      ]);
      const [products, hiddenProducts] = await Promise.all([
        Promise.all(items.map((item) => toAdminProduct(item, baseById.get(item.id)))),
        Promise.all(hiddenItems.map((item) => toAdminProduct(item, baseById.get(item.id)))),
      ]);
      return { slug: category.slug, title: category.title, products, hiddenProducts };
    }),
  );

  const total = categories.reduce((sum, c) => sum + c.products.length, 0);

  return (
    <>
      <PageHeading
        eyebrow="Product Catalogue"
        title="สินค้า"
        description="เพิ่ม ลบ แก้ไข และเรียงลำดับสินค้าในแต่ละหมวด — เปลี่ยนแล้วหน้าบริการอัปเดตทันที"
        stat={
          <span>
            {total} รายการ · {categories.length} หมวด
          </span>
        }
      />

      <ProductTabs categories={categories} />
    </>
  );
}
