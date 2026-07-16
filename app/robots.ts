import type { MetadataRoute } from 'next';
import { site, isPreviewDeploy } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // The workers.dev deploy is a temporary home until the real domain is sorted, and it must not
  // be crawled at all: it serves the clinic's entire site while every canonical, sitemap URL and
  // JSON-LD @id still points at kazumiclinic.com. Left crawlable, Google would index a throwaway
  // hostname whose content claims to belong to a domain nobody has confirmed we control.
  // Driven by SITE_ENV in wrangler.jsonc — drop that var once a real domain points here.
  if (isPreviewDeploy()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/'],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
