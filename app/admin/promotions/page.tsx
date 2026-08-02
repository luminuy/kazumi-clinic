import type { Metadata } from 'next';
import { serviceCategories } from '@/lib/services';
import { getAllPromotions, getHiddenPromotions, type PromotionRow } from '@/lib/promotions-store';
import {
  PromotionEditor,
  type AdminPromotion,
  type CategoryOption,
} from '@/components/admin/promotion-editor';
import { PageHeading } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'โปรโมชั่น' };

// The clinic's promotions are per-request state, not build output.
export const dynamic = 'force-dynamic';

function toAdminPromotion(row: PromotionRow): AdminPromotion {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en ?? '',
    detail: row.detail ?? '',
    detailEn: row.detail_en ?? '',
    price: row.price,
    originalPrice: row.original_price,
    note: row.note ?? '',
    noteEn: row.note_en ?? '',
    validUntil: row.valid_until,
    categorySlug: row.category_slug ?? '',
    imagePublicId: row.image_public_id,
  };
}

export default async function AdminPromotionsPage() {
  const [rows, hiddenRows] = await Promise.all([getAllPromotions(), getHiddenPromotions()]);
  const promotions = rows.map(toAdminPromotion);
  const hiddenPromotions = hiddenRows.map(toAdminPromotion);

  const categories: CategoryOption[] = serviceCategories.map((category) => ({
    slug: category.slug,
    title: category.title,
  }));

  const today = new Date().toISOString().slice(0, 10);
  const active = promotions.filter((promo) => promo.validUntil >= today).length;

  return (
    <>
      <PageHeading
        eyebrow="Promotions"
        title="โปรโมชั่น"
        description="เพิ่ม แก้ไข หรือซ่อนโปรโมชั่นที่แสดงในหน้า /promotions — โปรฯ ที่เลยวันหมดอายุจะถูกซ่อนจากเว็บโดยอัตโนมัติ"
        stat={
          <span>
            ทั้งหมด {promotions.length} · ใช้ได้ <span className="text-forest">{active}</span>
          </span>
        }
      />

      <PromotionEditor
        promotions={promotions}
        hiddenPromotions={hiddenPromotions}
        categories={categories}
        today={today}
      />
    </>
  );
}
