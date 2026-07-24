import { jsonLdHtml } from '@/lib/json-ld';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, ArrowRight } from 'lucide-react';
import { LineIcon, InstagramIcon } from '@/components/brand-icons';
import { site } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import { siteSocialImage } from '@/lib/metadata-images';
import { getPublishedPosts } from '@/lib/blog-store';
import { serviceCategories } from '@/lib/services';
import { BlogFilterGrid, type BlogGridPost, type BlogTab } from '@/components/blog-filter-grid';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  const pageTitle = t('metaTitle');
  const pageDescription = t('metaDescription', { siteName: site.name });

  const socialImage = await siteSocialImage('hero-iv-drip-2', `${site.name} ${pageTitle}`);

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: `${site.url}/blog` },
    openGraph: {
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      url: `${site.url}/blog`,
      type: 'website',
      ...(socialImage && { images: [socialImage] }),
    },
    twitter: {
      card: socialImage ? 'summary_large_image' : 'summary',
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      ...(socialImage && { images: [socialImage.url] }),
    },
  };
}

// Posts are managed through /admin/blog (D1). Re-render hourly on top of the on-write
// revalidatePath so a newly published post appears without a redeploy.
export const revalidate = 3600;

function formatThaiDate(ms: number | null, locale: string) {
  if (ms === null) return null;
  return new Date(ms).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('BlogPage');
  const tHome = await getTranslations('HomePage');
  const posts = await getPublishedPosts();

  const breadcrumb = breadcrumbSchema([
    { name: tHome('Navigation.home'), path: '/' },
    { name: t('breadcrumb'), path: '/blog' },
  ]);

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  // The filterable grid below the hero. Tabs are the service categories actually present among
  // these posts, in catalogue order — so every tab yields at least one card.
  const gridPosts: BlogGridPost[] = remainingPosts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImagePublicId: post.cover_image_public_id,
    publishedAt: post.published_at,
    category: post.category,
  }));
  const present = new Set(gridPosts.map((post) => post.category).filter(Boolean));
  const tabs: BlogTab[] = serviceCategories
    .filter((category) => present.has(category.slug))
    .map((category) => ({ slug: category.slug, title: category.title }));

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />
      
      {/* Cinematic Header */}
      <section className="px-6 md:px-12 pt-16 md:pt-24 pb-8">
        <div className="space-y-2">
          <span className="text-sm font-medium tracking-widest text-clinical-blue uppercase opacity-80">Knowledge Hub</span>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal tracking-tight leading-tight">บทความ / สาระความรู้</h1>
          <p className="text-base text-slate-gray mt-4 max-w-xl leading-relaxed">
            สาระความรู้เรื่องผิวพรรณและการดูแลตัวเองหลังทำหัตถการ จากทีมแพทย์ของ&nbsp;<span className="whitespace-nowrap">Kazumi Clinic</span>
          </p>
        </div>
      </section>

      {/* Featured Article */}
      {featuredPost && (
        <section className="px-6 md:px-12 mb-10">
          <Link href={`/blog/${featuredPost.slug}`} className="block relative w-full rounded-2xl overflow-hidden shadow-sm group">
            <div className="aspect-[4/5] md:aspect-[21/9] w-full relative">
              {featuredPost.cover_image_public_id ? (
                <Image
                  src={featuredPost.cover_image_public_id}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-surface-container-low grid place-items-center">
                  <FileText className="size-12 text-outline-variant" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full text-pure-white">
              <span className="text-xs font-medium mb-3 block text-secondary-fixed">
                Featured {featuredPost.published_at ? `• ${formatThaiDate(featuredPost.published_at, locale)}` : ''}
              </span>
              <h2 className="text-2xl md:text-4xl font-semibold mb-3 max-w-2xl">{featuredPost.title}</h2>
              {featuredPost.excerpt && (
                <p className="text-base opacity-90 line-clamp-2 mb-6 max-w-2xl text-pure-white/80">
                  {featuredPost.excerpt}
                </p>
              )}
              <span className="inline-flex items-center text-sm font-medium text-pure-white border-b border-pure-white pb-1 group-hover:gap-2 transition-all">
                อ่านต่อ <ArrowRight className="ml-1 size-4" />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Category filter + bento article grid */}
      <section className="px-6 md:px-12">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-pure-white p-14 text-center">
            <FileText className="mx-auto size-8 text-slate-gray opacity-50" />
            <p className="mt-4 font-semibold text-lg text-charcoal">{t('empty.title')}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-gray">{t('empty.desc')}</p>
          </div>
        ) : gridPosts.length > 0 ? (
          <BlogFilterGrid
            posts={gridPosts}
            tabs={tabs}
            locale={locale}
            emptyText="ไม่มีบทความในหมวดนี้ — ลองเลือกหมวดอื่น"
          />
        ) : null}
      </section>

      {/* Newsletter Support */}
      <section className="px-6 md:px-12 mt-24 mb-16">
        <div className="bg-surface-container-low rounded-[2rem] p-8 md:p-14 text-center border border-outline-variant/10 max-w-4xl mx-auto shadow-sm">
          <h3 className="text-2xl md:text-3xl font-bold text-charcoal mb-4">ติดตามสาระความรู้ใหม่ๆ</h3>
          <p className="text-base text-slate-gray mb-10 max-w-md mx-auto leading-relaxed">
            ลงทะเบียนเพื่อรับข่าวสาร โปรโมชั่น และเทคนิคการดูแลตัวเองจากแพทย์ผู้เชี่ยวชาญ
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              className="flex-1 px-6 py-4 rounded-xl border border-outline-variant/20 bg-pure-white text-charcoal focus:ring-2 focus:ring-clinical-blue focus:outline-none transition-all placeholder:text-slate-gray/60" 
              placeholder="อีเมลของคุณ" 
              type="email" 
            />
            <button className="px-8 py-4 rounded-xl bg-clinical-blue text-pure-white text-sm font-medium hover:bg-clinical-blue/90 active:scale-95 transition-all">
              ติดตามข่าวสาร
            </button>
          </div>
          <div className="mt-12 pt-8 border-t border-outline-variant/20 flex justify-center gap-8">
            <a href={site.lineUrl} target="_blank" rel="noopener noreferrer" className="text-charcoal hover:text-clinical-blue transition-colors flex flex-col items-center gap-2">
              <LineIcon className="size-6" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Line</span>
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="text-charcoal hover:text-clinical-blue transition-colors flex flex-col items-center gap-2">
              <InstagramIcon className="size-6" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Instagram</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
