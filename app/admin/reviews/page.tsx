import type { Metadata } from 'next';
import { serviceCategories } from '@/lib/services';
import { getAllReviews } from '@/lib/reviews-store';
import {
  ReviewEditor,
  type AdminReview,
  type CategoryOption,
} from '@/components/admin/review-editor';
import { PageHeading } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'รีวิว' };

// The clinic's reviews are per-request state, not build output.
export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const rows = await getAllReviews();
  const reviews: AdminReview[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    rating: row.rating,
    quote: row.quote ?? '',
    procedure: row.procedure ?? '',
    categorySlug: row.category_slug ?? '',
    beforeImagePublicId: row.before_image_public_id,
    afterImagePublicId: row.after_image_public_id,
    consent: row.consent === 1,
    published: row.published === 1,
  }));

  const categories: CategoryOption[] = serviceCategories.map((category) => ({
    slug: category.slug,
    title: category.title,
  }));

  const live = reviews.filter((review) => review.published && review.consent).length;

  return (
    <>
      <PageHeading
        eyebrow="Reviews / Before & After"
        title="รีวิว"
        description="เพิ่มรีวิวและภาพผลลัพธ์ก่อน-หลังของลูกค้า — แสดงบนหน้า /reviews เฉพาะรายการที่ยืนยันความยินยอมและกดเผยแพร่แล้ว"
        stat={
          <span>
            ทั้งหมด {reviews.length} · เผยแพร่ <span className="text-forest">{live}</span>
          </span>
        }
      />

      <ReviewEditor reviews={reviews} categories={categories} />
    </>
  );
}
