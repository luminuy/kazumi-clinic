import { describe, it, expect } from 'vitest';
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
