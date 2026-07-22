import type { Metadata } from 'next';
import Image from 'next/image';
import { ExternalLink, Star } from 'lucide-react';
import { site } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import { siteSocialImage } from '@/lib/metadata-images';
import { getPublishedReviews, type PublicReview } from '@/lib/reviews-store';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';
import { LineIcon } from '@/components/brand-icons';

const pageTitle = 'รีวิว / ผลลัพธ์ก่อน-หลัง';
const pageDescription = `รีวิวและผลลัพธ์ก่อน-หลังทำหัตถการที่ ${site.name} ย่านสุขุมวิท กรุงเทพฯ`;

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = await siteSocialImage('hero-iv-drip-1', `${site.name} รีวิวและผลลัพธ์`);

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: `${site.url}/reviews` },
    openGraph: {
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      url: `${site.url}/reviews`,
      type: 'website',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      images: [socialImage.url],
    },
  };
}

// Reviews are managed through /admin/reviews (D1). Re-render hourly on top of the on-write
// revalidatePath so a newly published review appears without a redeploy.
export const revalidate = 3600;

// COMPLIANCE (CLAUDE.md §0.2): reviews are entered and consented to by the clinic through /admin,
// never fabricated here. Before/after photos only render for rows the clinic marked as consented
// (enforced in getPublishedReviews). No Review/AggregateRating JSON-LD is emitted — star ratings
// are shown visually but not asserted as structured data until an audited, verifiable source exists.

function BeforeAfterFigure({ review }: { review: PublicReview }) {
  const both = review.beforeImagePublicId && review.afterImagePublicId;
  if (!review.beforeImagePublicId && !review.afterImagePublicId) return null;

  return (
    <div className={`grid gap-2 ${both ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {review.beforeImagePublicId && (
        <figure className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sand">
          <Image
            src={review.beforeImagePublicId}
            alt={`ผลลัพธ์ก่อนทำ${review.procedure ? review.procedure : 'หัตถการ'}`}
            fill
            sizes="(max-width: 640px) 45vw, 220px"
            className="object-cover"
            loading="lazy"
          />
          <figcaption className="absolute left-2 top-2 rounded-full bg-ink/60 px-2 py-0.5 text-[0.62rem] text-white">
            ก่อน
          </figcaption>
        </figure>
      )}
      {review.afterImagePublicId && (
        <figure className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sand">
          <Image
            src={review.afterImagePublicId}
            alt={`ผลลัพธ์หลังทำ${review.procedure ? review.procedure : 'หัตถการ'}`}
            fill
            sizes="(max-width: 640px) 45vw, 220px"
            className="object-cover"
            loading="lazy"
          />
          <figcaption className="absolute left-2 top-2 rounded-full bg-forest/80 px-2 py-0.5 text-[0.62rem] text-white">
            หลัง
          </figcaption>
        </figure>
      )}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews();

  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'รีวิว / ผลลัพธ์ก่อน-หลัง', path: '/reviews' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHero
        eyebrow="Reviews / Before & After"
        title="รีวิว / ผลลัพธ์ก่อน-หลัง"
        lead={`ผลลัพธ์จากการทำหัตถการที่ ${site.name} — ดูรีวิวจากลูกค้าจริงและผลลัพธ์ก่อน-หลังทำ`}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {reviews.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review, i) => (
                <Reveal key={review.id} delay={i * 50}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-olive/15 bg-cream">
                    <BeforeAfterFigure review={review} />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-serif text-lg text-olive-deep">{review.name}</p>
                        {review.rating !== null && (
                          <span className="flex items-center gap-0.5 text-forest">
                            {Array.from({ length: review.rating }).map((_, s) => (
                              <Star key={s} className="size-3.5 fill-current" />
                            ))}
                          </span>
                        )}
                      </div>
                      {review.procedure && (
                        <p className="mt-1 text-xs text-ink/50">{review.procedure}</p>
                      )}
                      {review.quote && (
                        <p className="mt-3 text-sm leading-relaxed text-ink/70">“{review.quote}”</p>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 text-xs text-ink/40">
              *ผลลัพธ์ขึ้นอยู่กับสภาพผิวและปัญหาเฉพาะบุคคล · เผยแพร่โดยได้รับความยินยอมจากลูกค้า
            </p>
          </>
        ) : (
          <Reveal className="rounded-2xl border border-dashed border-olive/30 bg-cream p-14 text-center">
            <div className="flex justify-center gap-1 text-olive-light">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5" />
              ))}
            </div>
            <p className="mt-4 font-serif text-xl text-olive-deep">กำลังรวบรวมรีวิวจากลูกค้า</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              รีวิวและภาพผลลัพธ์ก่อน-หลังจากลูกค้าจริงกำลังจะมาเร็ว ๆ นี้ ระหว่างนี้สามารถดูรีวิวได้ที่
              Google และ Instagram ของเรา หรือสอบถามผลลัพธ์เฉพาะบุคคลผ่าน LINE
            </p>
            <p className="mt-4 text-xs text-ink/40">*ผลลัพธ์ขึ้นอยู่กับสภาพผิวและปัญหาเฉพาะบุคคล</p>
          </Reveal>
        )}

        <div className="mt-12 flex flex-wrap gap-3">
          <Button
            render={<a href={site.mapsUrl} target="_blank" rel="noopener" />}
            size="lg"
            variant="outline"
            className="rounded-full border-forest px-8 text-forest hover:bg-forest/10"
          >
            <ExternalLink className="size-4" />
            ดูรีวิวจริงบน Google Maps
          </Button>
          <Button
            render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
            size="lg"
            className="rounded-full bg-line px-8 text-white hover:bg-line/90"
          >
            <LineIcon className="size-4" />
            สอบถามผลลัพธ์ผ่าน LINE
          </Button>
        </div>
      </section>
    </>
  );
}
