import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { getPublishedPosts } from '@/lib/blog-store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${base}/services`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${base}/promotions`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${base}/blog`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${base}/reviews`, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${base}/about`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${base}/contact`, priority: 0.6, changeFrequency: 'monthly' },
  ];

  const serviceUrls: MetadataRoute.Sitemap = serviceCategories.map((c) => ({
    url: `${base}/${c.slug}`,
    priority: 0.9,
    changeFrequency: 'weekly',
  }));

  // Published blog posts — pulled from D1 at render time. Empty (and thus omitted) when the store
  // is unavailable, so the sitemap never fails to build over a DB blip.
  const posts = await getPublishedPosts();
  const blogUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    priority: 0.6,
    changeFrequency: 'monthly',
  }));

  return [...staticUrls, ...serviceUrls, ...blogUrls];
}
