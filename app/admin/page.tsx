import type { Metadata } from 'next';
import { siteImages, siteImageGroups, ungroupedSiteImageKeys } from '@/lib/site-images';
import { getImageOverrides } from '@/lib/site-images-store';
import { ImageSlotCard, type ImageSlot } from '@/components/admin/image-slot-card';
import { PageHeading, SectionHeading } from '@/components/admin/ui';
import { SectionNav } from '@/components/admin/nav';

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

  const slotByKey = new Map(slots.map((slot) => [slot.key, slot]));
  const changed = slots.filter((slot) => slot.isOverridden).length;

  // Any key siteImageGroups hasn't claimed still gets a card here — see the invariant this
  // guards in lib/site-images.ts — rather than silently vanishing from the admin UI.
  const groups =
    ungroupedSiteImageKeys.length > 0
      ? [
          ...siteImageGroups,
          {
            id: 'other',
            title: 'อื่นๆ',
            sections: [{ id: 'other', title: 'อื่นๆ', keys: ungroupedSiteImageKeys }],
          },
        ]
      : siteImageGroups;

  return (
    <>
      <PageHeading
        eyebrow="Image Library"
        title="รูปภาพ"
        description="เปลี่ยนรูปได้ทุกใบที่เว็บใช้ — กดเปลี่ยนแล้วหน้าที่ใช้รูปนั้นอัปเดตทันที"
        stat={
          <span>
            ทั้งหมด {slots.length} รูป · เปลี่ยนแล้ว <span className="text-forest">{changed}</span>
          </span>
        }
      />

      {/* Direct child of the page content column on purpose: position:sticky can only travel within
          its parent's box, so wrapping this in a short div would pin it for a few pixels and drop it. */}
      <SectionNav
        items={groups.map((group) => ({ id: `group-${group.id}`, label: group.title }))}
      />

      <div className="mt-10 space-y-16">
        {groups.map((group) => {
          const sections = group.sections
            .map((section) => ({
              ...section,
              slots: section.keys
                .map((key) => slotByKey.get(key))
                .filter((slot): slot is ImageSlot => Boolean(slot)),
            }))
            .filter((section) => section.slots.length > 0);
          const groupCount = sections.reduce((sum, section) => sum + section.slots.length, 0);
          if (groupCount === 0) return null;

          return (
            <section key={group.id} id={`group-${group.id}`} className="scroll-mt-36">
              <SectionHeading title={group.title} count={`${groupCount} รูป`} />

              <div className="mt-6 space-y-8">
                {sections.map((section) => (
                  <div key={section.id} id={section.id !== group.id ? section.id : undefined}>
                    {/* A group with one section sharing its own title (e.g. "โปรโมชั่น") already
                        said its name in the h2 above — repeating it as an h3 would be noise. */}
                    {section.id !== group.id && (
                      <h3 className="mb-4 border-b border-black/[0.06] pb-2 text-xs font-medium uppercase tracking-[0.1em] text-ink/45">
                        {section.title}
                      </h3>
                    )}
                    <ul className="grid gap-4 lg:grid-cols-2">
                      {section.slots.map((slot) => (
                        <ImageSlotCard key={slot.key} slot={slot} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
