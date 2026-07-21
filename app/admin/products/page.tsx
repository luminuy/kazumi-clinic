import type { Metadata } from 'next';
import { serviceCategories, type ServiceItem } from '@/lib/services';
import { getCategoryItems } from '@/lib/service-products-store';
import { ProductCategoryEditor, type AdminProduct } from '@/components/admin/product-category-editor';
import { PageHeading } from '@/components/admin/ui';
import { SectionNav } from '@/components/admin/nav';

export const metadata: Metadata = { title: 'สินค้า' };

// The clinic's product edits are per-request state, not build output.
export const dynamic = 'force-dynamic';

/**
 * Whether a shipped product's live content actually differs from its code default. Compared by
 * content, not by "has a D1 row" — reordering writes rows for every product in a category, and a
 * product that only moved shouldn't read as "แก้ไขแล้ว".
 */
function isContentEdited(base: ServiceItem, live: ServiceItem): boolean {
  if (live.imagePublicId) return true;
  const norm = (v: string | number | undefined) => v ?? '';
  return (
    norm(base.name) !== norm(live.name) ||
    norm(base.detail) !== norm(live.detail) ||
    norm(base.tagline) !== norm(live.tagline) ||
    norm(base.collection) !== norm(live.collection) ||
    norm(base.priceFrom) !== norm(live.priceFrom) ||
    norm(base.unit) !== norm(live.unit) ||
    JSON.stringify(base.benefits ?? []) !== JSON.stringify(live.benefits ?? [])
  );
}

export default async function AdminProductsPage() {
  const categories = await Promise.all(
    serviceCategories.map(async (category) => {
      const baseById = new Map(category.items.map((item) => [item.id, item]));
      const items = await getCategoryItems(category.slug);
      const products: AdminProduct[] = items.map((item) => {
        const base = baseById.get(item.id);
        return {
          id: item.id ?? '',
          name: item.name,
          detail: item.detail ?? '',
          tagline: item.tagline ?? '',
          benefits: item.benefits ?? [],
          collection: item.collection ?? '',
          priceFrom: item.priceFrom ?? null,
          unit: item.unit,
          imagePublicId: item.imagePublicId ?? null,
          isDefault: Boolean(base),
          isEdited: base ? isContentEdited(base, item) : false,
        };
      });
      return { slug: category.slug, title: category.title, products };
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

      {/* Direct child of <main> on purpose: position:sticky can only travel within its parent's
          box, so wrapping this in a short div would pin it for a few pixels and drop it. */}
      <SectionNav
        items={categories.map((category) => ({
          id: `products-${category.slug}`,
          label: category.title,
        }))}
      />

      <div className="mt-10 space-y-16">
        {categories.map((category) => (
          <ProductCategoryEditor
            key={category.slug}
            slug={category.slug}
            title={category.title}
            products={category.products}
          />
        ))}
      </div>
    </>
  );
}
