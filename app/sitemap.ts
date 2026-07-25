import type { MetadataRoute } from 'next';
import { LOCALES, localizedAlternates } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { getPublishedPosts } from '@/lib/blog-store';

/**
 * A page as the sitemap thinks of it: one locale-independent path (`''` for home, `'/about'`
 * otherwise) plus its ranking hints. `expand()` turns each into one entry PER LOCALE.
 */
type SitemapPage = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  lastModified?: Date;
};

/**
 * Emits every page once per locale, each carrying the full hreflang set.
 *
 * The site is bilingual with `localePrefix: 'as-needed'` (i18n/routing.ts): Thai lives at the bare
 * path, English under `/en`. Listing only the Thai URLs — which is what this file did until
 * 2026-07-25 — tells Google the English half of the site does not exist, even though every page's
 * `alternates.languages` points at it. URLs and hreflang both come from `localizedAlternates()`,
 * so the sitemap can never disagree with the canonical tags the pages themselves render.
 */
function expand(pages: SitemapPage[]): MetadataRoute.Sitemap {
  return pages.flatMap((page) =>
    LOCALES.map((locale) => {
      const { canonical, languages } = localizedAlternates(locale, page.path);
      return {
        url: canonical,
        priority: page.priority,
        changeFrequency: page.changeFrequency,
        ...(page.lastModified ? { lastModified: page.lastModified } : {}),
        alternates: { languages },
      };
    }),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: SitemapPage[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/promotions', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/reviews', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  ];

  const servicePages: SitemapPage[] = serviceCategories.map((c) => ({
    path: `/${c.slug}`,
    priority: 0.9,
    changeFrequency: 'weekly',
  }));

  // Published blog posts — pulled from D1 at render time. Empty (and thus omitted) when the store
  // is unavailable, so the sitemap never fails to build over a DB blip.
  const posts = await getPublishedPosts();
  const blogPages: SitemapPage[] = posts.map((post) => ({
    path: `/blog/${post.slug}`,
    priority: 0.6,
    changeFrequency: 'monthly',
    lastModified: new Date(post.updated_at),
  }));

  return expand([...staticPages, ...servicePages, ...blogPages]);
}
