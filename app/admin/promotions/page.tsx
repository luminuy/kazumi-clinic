import type { Metadata } from 'next';
import { serviceCategories } from '@/lib/services';
import { getAllPromotions } from '@/lib/promotions-store';
import {
  PromotionEditor,
  type AdminPromotion,
  type CategoryOption,
} from '@/components/admin/promotion-editor';
import { PageHeading } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'โปรโมชั่น' };

// The clinic's promotions are per-request state, not build output.
export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  const rows = await getAllPromotions();
  const promotions: AdminPromotion[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    detail: row.detail ?? '',
    price: row.price,
    originalPrice: row.original_price,
    note: row.note ?? '',
    validUntil: row.valid_until,
    categorySlug: row.category_slug ?? '',
    imagePublicId: row.image_public_id,
  }));

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
        description="เพิ่ม แก้ไข หรือลบโปรโมชั่นที่แสดงในหน้า /promotions — โปรฯ ที่เลยวันหมดอายุจะถูกซ่อนจากเว็บโดยอัตโนมัติ"
        stat={
          <span>
            ทั้งหมด {promotions.length} · ใช้ได้ <span className="text-forest">{active}</span>
          </span>
        }
      />

      <PromotionEditor promotions={promotions} categories={categories} today={today} />
    </>
  );
}
