import type { Metadata } from 'next';
import { serviceCategories, type ServiceItem } from '@/lib/services';
import { getCategoryItems } from '@/lib/service-products-store';
import { ProductCategoryEditor, type AdminProduct } from '@/components/admin/product-category-editor';

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
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-olive/15 pb-5">
        <div>
          <h1 className="font-serif text-3xl text-olive-deep">สินค้า</h1>
          <p className="mt-1.5 text-sm text-ink/60">
            เพิ่ม ลบ แก้ไข และเรียงลำดับสินค้าในแต่ละหมวด — เปลี่ยนแล้วหน้าบริการอัปเดตทันที
          </p>
        </div>
        <p className="text-xs text-ink/45">ทั้งหมด {total} รายการ · {categories.length} หมวด</p>
      </div>

      <nav
        aria-label="หมวดหมู่สินค้า"
        className="sticky top-14 z-10 -mx-6 mt-6 flex gap-1.5 overflow-x-auto border-b border-olive/10 bg-sand/95 px-6 py-3 backdrop-blur"
      >
        {categories.map((category) => (
          <a
            key={category.slug}
            href={`#products-${category.slug}`}
            className="shrink-0 rounded-full border border-olive/15 px-3 py-1.5 text-xs text-ink/70 transition-colors hover:border-olive/30 hover:bg-olive/5 hover:text-olive-deep"
          >
            {category.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-14">
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
