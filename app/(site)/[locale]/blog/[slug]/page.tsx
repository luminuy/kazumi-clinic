import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { site } from '@/lib/site';
import { blogPostingSchema, breadcrumbSchema } from '@/lib/schema';
import { socialImage, siteSocialImage } from '@/lib/metadata-images';
import { getPublishedPostBySlug } from '@/lib/blog-store';
import { Prose } from '@/components/prose';

// Posts live in D1 and aren't known at build time, so this route renders on demand and caches via
// ISR (re-rendered on the blog API's revalidatePath). No generateStaticParams.
export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: 'ไม่พบบทความ', robots: { index: false, follow: false } };

  const description = post.excerpt ?? `${post.title} — ${site.name}`;
  const image = post.cover_image_public_id
    ? socialImage(post.cover_image_public_id, post.title)
    : await siteSocialImage('hero-iv-drip-2', post.title);

  return {
    title: post.title,
    description,
    alternates: { canonical: `${site.url}/blog/${slug}` },
    openGraph: {
      title: `${post.title} — ${site.name}`,
      description,
      url: `${site.url}/blog/${slug}`,
      type: 'article',
      ...(post.published_at && { publishedTime: new Date(post.published_at).toISOString() }),
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — ${site.name}`,
      description,
      images: [image.url],
    },
  };
}

function formatThaiDate(ms: number | null) {
  if (ms === null) return null;
  return new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const published = post.published_at ? new Date(post.published_at).toISOString() : undefined;
  const modified = new Date(post.updated_at).toISOString();

  const article = blogPostingSchema({
    title: post.title,
    excerpt: post.excerpt ?? undefined,
    slug: post.slug,
    author: post.author ?? undefined,
    datePublished: published,
    dateModified: modified,
    imagePublicId: post.cover_image_public_id ?? undefined,
  });

  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'บทความ', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-ink/50 transition-colors hover:text-forest"
        >
          <ArrowLeft className="size-4" />
          บทความทั้งหมด
        </Link>

        <header className="mt-6 border-b border-olive/15 pb-8">
          <h1 className="font-serif text-3xl leading-tight text-olive-deep sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/45">
            {post.author && <span>{post.author}</span>}
            {post.author && formatThaiDate(post.published_at) && <span aria-hidden="true">·</span>}
            {formatThaiDate(post.published_at) && (
              <time dateTime={published}>{formatThaiDate(post.published_at)}</time>
            )}
          </p>
        </header>

        {post.cover_image_public_id && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-sand">
            <Image
              src={post.cover_image_public_id}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <Prose content={post.body} className="mt-8 text-[1.02rem]" />
      </article>
    </>
  );
}
