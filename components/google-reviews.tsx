import { Star } from 'lucide-react';
import { GoogleIcon } from '@/components/brand-icons';
import type { GoogleReviewsData } from '@/lib/google-reviews';
import { Reveal } from '@/components/reveal';

/**
 * The "reviews from Google" section on /reviews. Renders up to 5 reviews returned by the Places API
 * with the attribution Google's policy requires: the reviewer's name and photo, the star rating,
 * the relative time, unmodified text, and a link back to the listing on Google. Kept visually
 * separate from the clinic's own consented before/after reviews.
 */
export function GoogleReviews({ data, heading }: { data: GoogleReviewsData; heading: string }) {
  return (
    <section className="mb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-olive/15 pb-5">
        <div className="flex items-center gap-3">
          <GoogleIcon className="size-7 shrink-0" />
          <div>
            <h2 className="font-serif text-2xl text-olive-deep">{heading}</h2>
            {data.rating !== null && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink/60">
                <span className="flex items-center gap-0.5 text-forest">
                  <Star className="size-3.5 fill-current" />
                </span>
                <span className="font-medium text-ink/80">{data.rating.toFixed(1)}</span>
                {data.total > 0 && <span>· จาก {data.total.toLocaleString('th-TH')} รีวิว</span>}
              </p>
            )}
          </div>
        </div>
        {data.mapsUri && (
          <a
            href={data.mapsUri}
            target="_blank"
            rel="noopener"
            className="text-sm font-medium text-forest hover:underline"
          >
            ดูทั้งหมดบน Google
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.reviews.map((review, i) => (
          <Reveal key={review.id} delay={i * 50}>
            <article className="flex h-full flex-col rounded-2xl border border-olive/15 bg-cream p-5">
              <div className="flex items-center gap-3">
                {review.photoUri ? (
                  // Google-hosted avatar (lh3.googleusercontent.com) — a plain <img> on purpose: the
                  // project's next/image loader rewrites every src to Cloudinary, which would break
                  // an external URL. referrerPolicy keeps Google from 403-ing the hotlink.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.photoUri}
                    alt=""
                    aria-hidden="true"
                    width={40}
                    height={40}
                    referrerPolicy="no-referrer"
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-olive/10 font-serif text-olive-deep">
                    {review.author.charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-olive-deep">{review.author}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-0.5 text-forest">
                      {Array.from({ length: review.rating }).map((_, s) => (
                        <Star key={s} className="size-3 fill-current" />
                      ))}
                    </span>
                    {review.relativeTime && (
                      <span className="text-xs text-ink/40">{review.relativeTime}</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-ink/70">{review.text}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <p className="mt-4 text-xs text-ink/40">รีวิวจาก Google · แสดงตามที่ผู้ใช้โพสต์ ไม่มีการแก้ไข</p>
    </section>
  );
}
