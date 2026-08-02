import { jsonLdHtml } from '@/lib/json-ld';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { site, localizedAlternates } from '@/lib/site';
import { blogPostingSchema, breadcrumbSchema } from '@/lib/schema';
import { socialImage, siteSocialImage } from '@/lib/metadata-images';
import { getPublishedPostBySlug } from '@/lib/blog-store';
import { Prose } from '@/components/prose';

export function generateStaticParams() {
  return [];
}

// Post slugs live in D1 and are genuinely unknown at build time because the CI builder cannot
// reach D1. Returning an empty list still opts this route into ISR, so on-demand renders are cached
// for this window instead of hitting D1 on every request; the blog admin API's revalidatePath
// refreshes the cached post on publish.
export const revalidate = 3600;

type Params = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlogPostPage' });
  const post = await getPublishedPostBySlug(slug, locale);
  if (!post) return { title: t('notFound'), robots: { index: false, follow: false } };

  const description = post.excerpt ?? `${post.title} — ${site.name}`;
  const image = post.cover_image_public_id
    ? socialImage(post.cover_image_public_id, post.title)
    : await siteSocialImage('hero-iv-drip-2', post.title);

  const alternates = localizedAlternates(locale, `/blog/${slug}`);

  return {
    title: post.title,
    description,
    alternates,
    openGraph: {
      title: `${post.title} — ${site.name}`,
      description,
      url: alternates.canonical,
      type: 'article',
      ...(post.published_at && { publishedTime: new Date(post.published_at).toISOString() }),
      ...(image && { images: [image] }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: `${post.title} — ${site.name}`,
      description,
      ...(image && { images: [image.url] }),
    },
  };
}

function formatThaiDate(ms: number | null, locale: string) {
  if (ms === null) return null;
  return new Date(ms).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('BlogPostPage');
  
  const post = await getPublishedPostBySlug(slug, locale);
  if (!post) notFound();

  const published = post.published_at ? new Date(post.published_at).toISOString() : undefined;
  const modified = new Date(post.updated_at).toISOString();

  // A post with no English body falls back to the Thai one (lib/content-locale.ts), so the language
  // we declare follows the prose that actually rendered — not the URL it rendered under.
  const renderedInEnglish = locale === 'en' && Boolean(post.body_en?.trim());

  const article = blogPostingSchema(
    {
      title: post.title,
      excerpt: post.excerpt ?? undefined,
      slug: post.slug,
      author: post.author ?? undefined,
      datePublished: published,
      dateModified: modified,
      imagePublicId: post.cover_image_public_id ?? undefined,
      inLanguage: renderedInEnglish ? 'en' : 'th-TH',
    },
    locale,
  );

  const tNav = await getTranslations('Navigation');
  const breadcrumb = breadcrumbSchema([
    { name: tNav('home'), path: '/' },
    { name: t('breadcrumb'), path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ], locale);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(article) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />

      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-ink/50 transition-colors hover:text-forest"
        >
          <ArrowLeft className="size-4" />
          {t('allArticles')}
        </Link>

        <header className="mt-6 border-b border-olive/15 pb-8">
          <h1 className="font-serif text-3xl leading-tight text-olive-deep sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/45">
            {post.author && <span>{post.author}</span>}
            {post.author && formatThaiDate(post.published_at, locale) && <span aria-hidden="true">·</span>}
            {formatThaiDate(post.published_at, locale) && (
              <time dateTime={published}>{formatThaiDate(post.published_at, locale)}</time>
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
