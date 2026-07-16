import type { Metadata } from 'next';
import { siteImages } from '@/lib/site-images';
import { getImageOverrides } from '@/lib/site-images-store';
import { ImageSlotCard, type ImageSlot } from '@/components/admin/image-slot-card';

export const metadata: Metadata = { title: 'รูปภาพ' };

// The clinic's uploads are per-request state, not build output.
export const dynamic = 'force-dynamic';

export default async function AdminImagesPage() {
  const overrides = await getImageOverrides();

  const slots: ImageSlot[] = siteImages.map((image) => {
    const override = overrides.get(image.key);
    return {
      ...image,
      currentPublicId: override?.public_id ?? image.defaultPublicId,
      isOverridden: Boolean(override),
      updatedAt: override?.updated_at ?? null,
      updatedBy: override?.updated_by ?? null,
    };
  });

  const changed = slots.filter((slot) => slot.isOverridden).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-olive/15 pb-5">
        <div>
          <h1 className="font-serif text-3xl text-olive-deep">รูปภาพ</h1>
          <p className="mt-1.5 text-sm text-ink/60">
            เปลี่ยนรูปได้ทุกใบที่เว็บใช้ — กดเปลี่ยนแล้วหน้าที่ใช้รูปนั้นอัปเดตทันที
          </p>
        </div>
        <p className="text-xs text-ink/45">
          ทั้งหมด {slots.length} รูป · เปลี่ยนแล้ว {changed}
        </p>
      </div>

      <ul className="mt-6 grid gap-4 lg:grid-cols-2">
        {slots.map((slot) => (
          <ImageSlotCard key={slot.key} slot={slot} />
        ))}
      </ul>
    </>
  );
}
