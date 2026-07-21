import type { Metadata } from 'next';
import { siteImages, siteImageGroups, ungroupedSiteImageKeys } from '@/lib/site-images';
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

      <nav
        aria-label="หมวดหมู่รูปภาพ"
        className="sticky top-14 z-10 -mx-6 mt-6 flex gap-1.5 overflow-x-auto border-b border-olive/10 bg-sand/95 px-6 py-3 backdrop-blur"
      >
        {groups.map((group) => (
          <a
            key={group.id}
            href={`#group-${group.id}`}
            className="shrink-0 rounded-full border border-olive/15 px-3 py-1.5 text-xs text-ink/70 transition-colors hover:border-olive/30 hover:bg-olive/5 hover:text-olive-deep"
          >
            {group.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-14">
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
            <section key={group.id} id={`group-${group.id}`} className="scroll-mt-32">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-2xl text-olive-deep">{group.title}</h2>
                <p className="text-xs text-ink/45">{groupCount} รูป</p>
              </div>

              <div className="mt-5 space-y-8">
                {sections.map((section) => (
                  <div key={section.id} id={section.id !== group.id ? section.id : undefined}>
                    {/* A group with one section sharing its own title (e.g. "โปรโมชั่น") already
                        said its name in the h2 above — repeating it as an h3 would be noise. */}
                    {section.id !== group.id && (
                      <h3 className="border-b border-olive/10 pb-2 text-sm font-medium text-ink/70">
                        {section.title}
                      </h3>
                    )}
                    <ul className="mt-4 grid gap-4 lg:grid-cols-2">
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
