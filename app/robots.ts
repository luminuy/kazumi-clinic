import type { MetadataRoute } from 'next';
import { site, isPreviewDeploy } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Historically this blocked crawling of the workers.dev preview while canonical/sitemap/JSON-LD
  // still pointed at kazumiclinic.skin before it was live. The real domain now serves the site
  // directly (SITE_ENV removed from wrangler.jsonc, 2026-07-27) so this branch is effectively dead
  // unless SITE_ENV=preview is deliberately reintroduced for a future preview deploy.
  if (isPreviewDeploy()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/api/',
        '/account',
        '/account/',
        '/cart',
        '/cart/',
        '/appointments/cancel',
        '/en/appointments/cancel',
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
