import type { Metadata } from 'next';
import { serviceCategories } from '@/lib/services';
import { getCategoryItems, getProductRowsByCategory } from '@/lib/service-products-store';
import { ProductCategoryEditor, type AdminProduct } from '@/components/admin/product-category-editor';

export const metadata: Metadata = { title: 'สินค้า' };

// The clinic's product edits are per-request state, not build output.
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const rowsByCategory = await getProductRowsByCategory();

  const categories = await Promise.all(
    serviceCategories.map(async (category) => {
      const baseIds = new Set(category.items.map((item) => item.id));
      const rows = rowsByCategory.get(category.slug) ?? [];
      const overridden = new Set(rows.filter((r) => !r.deleted).map((r) => r.id));
      const items = await getCategoryItems(category.slug);
      const products: AdminProduct[] = items.map((item) => ({
        id: item.id ?? '',
        name: item.name,
        detail: item.detail ?? '',
        tagline: item.tagline ?? '',
        benefits: item.benefits ?? [],
        collection: item.collection ?? '',
        priceFrom: item.priceFrom ?? null,
        unit: item.unit,
        imagePublicId: item.imagePublicId ?? null,
        isDefault: baseIds.has(item.id),
        isEdited: overridden.has(item.id ?? ''),
      }));
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
