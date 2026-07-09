import Link from 'next/link';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { faqSchema } from '@/lib/schema';

const faqs = [
  {
    question: 'Kazumi Clinic ให้บริการอะไรบ้าง?',
    answer:
      'Kazumi Clinic ให้บริการฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ คอลลาเจนบูสเตอร์ และ IV Drip วิตามิน โดยแพทย์ผู้เชี่ยวชาญ',
  },
  {
    question: 'คลินิกเปิดกี่โมงถึงกี่โมง?',
    answer: 'เปิดทุกวัน 9:00–22:00 ยกเว้นวันอาทิตย์เปิด 9:00–17:00',
  },
  {
    question: 'จองคิวได้ที่ไหน?',
    answer: `จองคิวผ่าน LINE Official Account ได้ที่ ${site.lineUrl} หรือโทร ${site.phone}`,
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      <section className="bg-olive-deep px-6 py-24 text-center text-sand">
        <p className="font-serif text-sm uppercase tracking-[0.3em] text-sand/70">
          {site.taglineTh}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
          &ldquo;{site.tagline}&rdquo;
        </h1>
        <p className="mt-3 text-sand/60">{site.taglineJa}</p>
        <a
          href={site.lineUrl}
          target="_blank"
          rel="noopener"
          className="mt-10 inline-block rounded-full bg-line px-8 py-3 text-sm font-medium text-white"
        >
          จองคิวผ่าน LINE
        </a>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-serif text-2xl text-olive-deep">บริการของเรา</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="rounded-2xl border border-olive/15 bg-white p-6 transition hover:border-olive hover:shadow-md"
            >
              <p className="font-serif text-lg text-olive-deep">{c.title}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-olive-light">
                {c.titleEn}
              </p>
              <p className="mt-3 text-sm text-ink/70">{c.shortDescription}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-olive-deep">เวลาทำการ &amp; ที่อยู่</h2>
            <p className="mt-4 text-sm text-ink/70">{site.addressFull}</p>
            <ul className="mt-4 space-y-1 text-sm text-ink/70">
              <li>จันทร์–เสาร์: 9:00–22:00</li>
              <li>อาทิตย์: 9:00–17:00</li>
            </ul>
            <p className="mt-4 text-sm text-ink/70">โทร {site.phone}</p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-olive-deep">คำถามที่พบบ่อย</h2>
            <dl className="mt-4 space-y-4">
              {faqs.map((f) => (
                <div key={f.question}>
                  <dt className="text-sm font-medium text-ink">{f.question}</dt>
                  <dd className="mt-1 text-sm text-ink/70">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
