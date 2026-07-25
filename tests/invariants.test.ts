import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import thMessages from '@/messages/th.json';
import enMessages from '@/messages/en.json';
import { navItems } from '@/lib/nav';
import { serviceCategories } from '@/lib/services';
import { site } from '@/lib/site';
import {
  clinicSchema,
  serviceItemListSchema,
  serviceCategoryListSchema,
  breadcrumbSchema,
} from '@/lib/schema';

// The rule is about OUR URLs — external links (facebook.com/…/) keep whatever slash they ship with.
const isInternal = (u: string) => u.startsWith('/') || u.startsWith(site.url);
// The home page ("/") is the only allowed trailing slash — everything else must not have one.
const cleanPath = (u: string) => u === '/' || u === `${site.url}/` || !u.endsWith('/');

// Walk any JSON-LD object and pull out every string that looks like a URL or path.
function collectUrls(node: unknown, out: string[] = []): string[] {
  if (typeof node === 'string') {
    if (node.startsWith('http') || node.startsWith('/')) out.push(node);
  } else if (Array.isArray(node)) {
    for (const n of node) collectUrls(n, out);
  } else if (node && typeof node === 'object') {
    for (const n of Object.values(node)) collectUrls(n, out);
  }
  return out;
}

describe('URL conventions — no trailing slash (CLAUDE.md §1)', () => {
  it('site.url has no trailing slash', () => {
    expect(site.url.endsWith('/')).toBe(false);
  });

  it('every nav href is an absolute path with no trailing slash', () => {
    for (const item of navItems) {
      expect(item.href.startsWith('/'), `${item.label} href must start with /`).toBe(true);
      expect(cleanPath(item.href), `${item.href} must not end with /`).toBe(true);
    }
  });

  it('generated JSON-LD contains no URL with a stray trailing slash', () => {
    const schemas: unknown[] = [
      clinicSchema(),
      serviceCategoryListSchema(serviceCategories),
      breadcrumbSchema([
        { name: 'หน้าหลัก', path: '/' },
        { name: 'บริการ', path: '/services' },
      ]),
      ...serviceCategories.map((c) => serviceItemListSchema(c)),
    ];
    const bad = schemas
      .flatMap((s) => collectUrls(s))
      .filter(isInternal)
      .filter((u) => !cleanPath(u));
    expect(bad, `URLs with a trailing slash: ${bad.join(', ')}`).toEqual([]);
  });
});

describe('service catalog integrity (single source of truth — lib/services.ts)', () => {
  it('slugs are unique and URL-safe', () => {
    const slugs = serviceCategories.map((c) => c.slug);
    expect(new Set(slugs).size, 'duplicate service slug').toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug, `"${slug}" must be lowercase kebab-case`).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('every category has a non-empty Thai title', () => {
    for (const c of serviceCategories) {
      expect(c.title.trim().length, `${c.slug} missing title`).toBeGreaterThan(0);
    }
  });
});

// next-intl answers a missing key with the key itself, so a typo doesn't crash — it ships. That is
// how `HomePage.Navigation.home` ended up as the breadcrumb name in the JSON-LD on seven live pages
// (fixed 2026-07-25): the pages asked the HomePage translator for a top-level namespace.
describe('messages (CLAUDE.md §13)', () => {
  function paths(node: unknown, prefix = ''): string[] {
    if (typeof node !== 'object' || node === null) return [prefix];
    return Object.entries(node).flatMap(([key, value]) =>
      paths(value, prefix ? `${prefix}.${key}` : key),
    );
  }

  it('th and en carry exactly the same keys', () => {
    const th = paths(thMessages).sort();
    const en = paths(enMessages).sort();
    expect(th.filter((k) => !en.includes(k)), 'missing from en.json').toEqual([]);
    expect(en.filter((k) => !th.includes(k)), 'missing from th.json').toEqual([]);
  });

  it('every message resolves to a non-empty string', () => {
    for (const [label, messages] of [
      ['th', thMessages],
      ['en', enMessages],
    ] as const) {
      for (const path of paths(messages)) {
        const value = path
          .split('.')
          .reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], messages);
        expect(typeof value, `${label}: ${path} is not a string`).toBe('string');
        expect((value as string).trim().length, `${label}: ${path} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('breadcrumb pages can reach the home label they ask for', () => {
    // The seven breadcrumbs call getTranslations('Navigation') then t('home').
    expect(thMessages.Navigation.home).toBeTruthy();
    expect(enMessages.Navigation.home).toBeTruthy();
  });
});

// The sitemap listed Thai URLs only until 2026-07-25, so Google was told the /en half of the site
// did not exist while every page's hreflang pointed at it. These lock the bilingual shape in.
// Blog posts are absent here: getPublishedPosts() returns [] without a D1 binding (see
// lib/blog-store.ts), which is exactly the "DB blip" path the sitemap is built to survive.
describe('sitemap covers every locale (CLAUDE.md §13)', () => {
  it('emits each page once per locale, with hreflang on every entry', async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    const pagePaths = ['', '/services', '/promotions', '/blog', '/reviews', '/about', '/contact'];
    for (const path of [...pagePaths, ...serviceCategories.map((c) => `/${c.slug}`)]) {
      expect(urls, `Thai URL missing for "${path || '/'}"`).toContain(`${site.url}${path || '/'}`);
      expect(urls, `English URL missing for "${path || '/'}"`).toContain(`${site.url}/en${path}`);
    }

    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string> | undefined;
      expect(languages, `${entry.url} has no hreflang set`).toBeDefined();
      for (const key of ['th', 'en', 'x-default']) {
        expect(languages?.[key], `${entry.url} missing hreflang "${key}"`).toBeTruthy();
      }
    }
  });

  it('no sitemap URL has a trailing slash except the Thai home page', async () => {
    const bad = (await sitemap()).map((e) => e.url).filter((u) => !cleanPath(u));
    expect(bad, `URLs with a trailing slash: ${bad.join(', ')}`).toEqual([]);
  });

  it('has no duplicate URLs', async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(new Set(urls).size, 'duplicate sitemap URL').toBe(urls.length);
  });
});
