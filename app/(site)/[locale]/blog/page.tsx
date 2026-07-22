import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { site } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import { siteSocialImage } from '@/lib/metadata-images';
import { getPublishedPosts } from '@/lib/blog-store';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';

const pageTitle = 'บทความ / สาระความรู้';
const pageDescription = `บทความและสาระความรู้เรื่องผิวพรรณ ฟิลเลอร์ โบท็อกซ์ และการดูแลตัวเองหลังทำหัตถการ โดย ${site.name}`;

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = await siteSocialImage('hero-iv-drip-2', `${site.name} บทความและสาระความรู้`);

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: `${site.url}/blog` },
    openGraph: {
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      url: `${site.url}/blog`,
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

// Posts are managed through /admin/blog (D1). Re-render hourly on top of the on-write
// revalidatePath so a newly published post appears without a redeploy.
export const revalidate = 3600;

function formatThaiDate(ms: number | null) {
  if (ms === null) return null;
  return new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'บทความ / สาระความรู้', path: '/blog' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHero
        eyebrow="Blog / Knowledge Hub"
        title="บทความ / สาระความรู้"
        lead={`สาระความรู้เรื่องผิวพรรณและการดูแลตัวเองหลังทำหัตถการ จากทีมแพทย์ของ ${site.name}`}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 50}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-olive/15 bg-cream transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-sand">
                    {post.cover_image_public_id ? (
                      <Image
                        src={post.cover_image_public_id}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-olive-light">
                        <FileText className="size-8" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {formatThaiDate(post.published_at) && (
                      <time className="text-xs text-ink/45">{formatThaiDate(post.published_at)}</time>
                    )}
                    <h2 className="mt-1.5 font-serif text-xl leading-snug text-olive-deep">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/60">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-auto pt-4 text-sm font-medium text-forest">อ่านต่อ →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="rounded-2xl border border-dashed border-olive/30 bg-cream p-14 text-center">
            <FileText className="mx-auto size-8 text-olive-light" />
            <p className="mt-4 font-serif text-xl text-olive-deep">กำลังเตรียมบทความ</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              บทความและสาระความรู้เรื่องผิวพรรณและหัตถการกำลังจะมาเร็ว ๆ นี้
            </p>
          </Reveal>
        )}
      </section>
    </>
  );
}
