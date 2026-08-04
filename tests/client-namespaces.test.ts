import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  CLIENT_MESSAGE_NAMESPACES,
  LAYOUT_CLIENT_NAMESPACES,
} from '@/i18n/client-namespaces';

/**
 * Each public page now ships only the client namespaces reachable from that page, because the old
 * all-site provider contributed 21,157 bytes to every RSC flight payload. The saving is real but
 * the failure mode is nasty and invisible in review: forget a namespace and the client component
 * throws MISSING_MESSAGE while rendering in production.
 *
 * These tests rebuild the answer from each page/layout entry instead of trusting hand-maintained
 * comments. The walker follows server imports until it crosses `'use client'`, then treats that
 * file and everything below it as client code and collects the root translation namespaces. Every
 * page must still declare a boundary when that set is empty because next-intl's client BaseLink
 * calls `useLocale()` unconditionally; package internals are deliberately outside this walker.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXTENSIONS = ['.tsx', '.ts'];
const PUBLIC_PAGE_ROOT = join(root, 'app', '(site)', '[locale]');

function walk(dir: string): string[] {
  const out: string[] = [];

  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) out.push(full);
  }

  return out;
}

/** Resolves an import specifier to a file on disk, mirroring the `@/` alias from tsconfig. */
function resolveImport(specifier: string, fromFile: string): string | null {
  let base: string;

  if (specifier.startsWith('@/')) base = join(root, specifier.slice(2));
  else if (specifier.startsWith('.')) base = resolve(dirname(fromFile), specifier);
  else return null; // a package — its own code can't call our useTranslations

  const candidates = [
    ...EXTENSIONS.map((ext) => base + ext),
    ...EXTENSIONS.map((ext) => join(base, `index${ext}`)),
  ];

  return candidates.find((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) ?? null;
}

const IMPORT_RE = /(?:import|export)[\s\S]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
const NAMESPACE_RE = /use(?:Translations|Messages|Format)\(\s*['"]([^'"]+)['"]/g;

function importsOf(source: string, file: string): string[] {
  const out: string[] = [];

  for (const match of source.matchAll(IMPORT_RE)) {
    const resolved = resolveImport(match[1] ?? match[2], file);
    if (resolved) out.push(resolved);
  }

  return out;
}

/** Root namespaces read by client code reachable from one server page/layout entry. */
function namespacesRequiredBy(entryFile: string): Set<string> {
  const queue: Array<{ file: string; client: boolean }> = [
    { file: resolve(root, entryFile), client: false },
  ];
  const seen = new Set<string>();
  const namespaces = new Set<string>();

  while (queue.length) {
    const { file, client: parentIsClient } = queue.pop()!;
    const seenKey = `${parentIsClient ? 'client' : 'server'}:${file}`;
    if (seen.has(seenKey)) continue;
    seen.add(seenKey);

    const source = readFileSync(file, 'utf8');
    const isClient = parentIsClient || /^\s*(['"])use client\1/m.test(source);

    if (isClient) {
      for (const match of source.matchAll(NAMESPACE_RE)) {
        // `useTranslations('Appointments.cancelPage')` needs the root namespace only.
        namespaces.add(match[1].split('.')[0]);
      }
    }

    for (const dep of importsOf(source, file)) {
      queue.push({ file: dep, client: isClient });
    }
  }

  return namespaces;
}

function declaredPageNamespaces(source: string): Set<string> {
  const list = source.match(/namespaces=\{\[([\s\S]*?)\]\}/)?.[1] ?? '';
  return new Set(
    [...list.matchAll(/'([A-Za-z][A-Za-z0-9]*)'/g)].map((match) => match[1]),
  );
}

describe('client message namespaces', () => {
  const layoutEntry = 'app/(site)/[locale]/layout.tsx';

  it('finds the client boundary at all (guards against the walker silently matching nothing)', () => {
    expect(namespacesRequiredBy(layoutEntry).size).toBeGreaterThan(0);
  });

  it('gives every page a boundary that covers its client graph', () => {
    const pageFiles = walk(PUBLIC_PAGE_ROOT)
      .filter((file) => file.endsWith('page.tsx'))
      .sort();
    const knownNamespaces = new Set<string>(CLIENT_MESSAGE_NAMESPACES);

    for (const pageFile of pageFiles) {
      const entry = pageFile.slice(root.length + 1);
      const source = readFileSync(pageFile, 'utf8');
      const required = namespacesRequiredBy(entry);
      const declared = declaredPageNamespaces(source);
      const label = pageFile.slice(PUBLIC_PAGE_ROOT.length + 1);
      const unknown = [...declared].filter((namespace) => !knownNamespaces.has(namespace));

      expect(unknown, `${label} declares an unknown client namespace`).toEqual([]);
      expect(source, `${label} needs an IntlBoundary`).toContain('<IntlBoundary');
      const missing = [...required].filter((namespace) => !declared.has(namespace));

      expect(missing, `${label} does not ship every required namespace`).toEqual([]);
    }
  });

  it('the layout boundary covers every client namespace reachable from the layout', () => {
    const required = namespacesRequiredBy(layoutEntry);
    const shipped = new Set<string>(LAYOUT_CLIENT_NAMESPACES);
    const missing = [...required].filter((namespace) => !shipped.has(namespace));

    expect(missing).toEqual([]);
  });

  it('every shipped namespace exists in both locales', () => {
    for (const locale of ['th', 'en']) {
      const messages = JSON.parse(readFileSync(join(root, 'messages', `${locale}.json`), 'utf8'));
      const absent = CLIENT_MESSAGE_NAMESPACES.filter((namespace) => !(namespace in messages));

      expect(absent, `missing from messages/${locale}.json`).toEqual([]);
    }
  });
});
