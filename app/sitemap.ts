import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${base}/services`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${base}/promotions`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${base}/reviews`, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${base}/about`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${base}/contact`, priority: 0.6, changeFrequency: 'monthly' },
  ];

  const serviceUrls: MetadataRoute.Sitemap = serviceCategories.map((c) => ({
    url: `${base}/${c.slug}`,
    priority: 0.9,
    changeFrequency: 'weekly',
  }));

  return [...staticUrls, ...serviceUrls];
}
