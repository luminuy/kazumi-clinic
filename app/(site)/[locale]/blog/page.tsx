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

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />
      
      {/* Cinematic Header */}
      <section className="px-6 md:px-12 pt-40 pb-8">
        <div className="space-y-2">
          <span className="text-sm font-medium tracking-widest text-clinical-blue uppercase opacity-80">Knowledge Hub</span>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal tracking-tight leading-tight">บทความ /<br />สาระความรู้</h1>
          <p className="text-base text-slate-gray mt-4 max-w-xl leading-relaxed">
            สาระความรู้เรื่องผิวพรรณและการดูแลตัวเองหลังทำหัตถการ จากทีมแพทย์ของ Kazumi Clinic
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

      {/* Category Filters (Static for now) */}
      <section className="px-6 md:px-12 mb-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap pb-2">
          <button className="px-5 py-2.5 rounded-full bg-clinical-blue text-pure-white text-sm font-medium transition-transform active:scale-95">ทั้งหมด</button>
          <button className="px-5 py-2.5 rounded-full bg-pure-white border border-outline-variant text-charcoal text-sm font-medium transition-all hover:bg-surface-container-low active:scale-95">Botox</button>
          <button className="px-5 py-2.5 rounded-full bg-pure-white border border-outline-variant text-charcoal text-sm font-medium transition-all hover:bg-surface-container-low active:scale-95">Filler</button>
          <button className="px-5 py-2.5 rounded-full bg-pure-white border border-outline-variant text-charcoal text-sm font-medium transition-all hover:bg-surface-container-low active:scale-95">Skin Booster</button>
          <button className="px-5 py-2.5 rounded-full bg-pure-white border border-outline-variant text-charcoal text-sm font-medium transition-all hover:bg-surface-container-low active:scale-95">IV Drip</button>
        </div>
      </section>

      {/* Bento Article Grid */}
      <section className="px-6 md:px-12">
        {remainingPosts.length > 0 ? (
          <div className="bento-grid">
            {remainingPosts.map((post, i) => {
              // Create dynamic bento layout classes based on index to recreate the Apple-style varied heights
              const isTall = i % 5 === 1; // e.g., 2nd card is tall
              const isWide = i % 5 === 3; // e.g., 4th card is wide

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={`bg-pure-white rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 flex flex-col group transition-transform hover:-translate-y-1 ${isTall ? 'bento-tall' : ''} ${isWide ? 'col-span-1 sm:col-span-2' : ''}`}
                >
                  <div className={`relative w-full overflow-hidden ${isTall ? 'h-64 sm:h-full sm:min-h-[20rem]' : 'h-48'}`}>
                    {post.cover_image_public_id ? (
                      <Image
                        src={post.cover_image_public_id}
                        alt={post.title}
                        fill
                        sizes={isWide ? "(max-width: 640px) 100vw, 90vw" : "(max-width: 640px) 100vw, 50vw"}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-container-low grid place-items-center">
                        <FileText className="size-8 text-outline-variant" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-center">
                    <span className="text-xs font-medium text-slate-gray mb-1.5 block">
                      {formatThaiDate(post.published_at, locale) || 'Article'}
                    </span>
                    <h3 className={`text-base font-bold text-charcoal line-clamp-2 ${isTall ? 'mb-2 text-lg' : ''}`}>
                      {post.title}
                    </h3>
                    {isTall && post.excerpt && (
                      <p className="text-sm text-slate-gray line-clamp-3 leading-relaxed mt-2">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : !featuredPost ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-pure-white p-14 text-center">
            <FileText className="mx-auto size-8 text-slate-gray opacity-50" />
            <p className="mt-4 font-semibold text-lg text-charcoal">{t('empty.title')}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-gray">
              {t('empty.desc')}
            </p>
          </div>
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
