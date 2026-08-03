import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CLIENT_MESSAGE_NAMESPACES } from '@/i18n/client-namespaces';

/**
 * `app/(site)/[locale]/layout.tsx` hands NextIntlClientProvider only the namespaces in
 * CLIENT_MESSAGE_NAMESPACES, because the full message object is ~15KB of JSON serialised into
 * every page's HTML (see that file for the measurement). The saving is real but the failure mode
 * is nasty and invisible in review: add a client component that calls `useTranslations('Orders')`
 * and it throws MISSING_MESSAGE at runtime, in production, on a page nobody re-tested.
 *
 * So this test rebuilds the same answer from the source instead of trusting the list: it finds
 * every module reachable from a `'use client'` entry point — the directive marks a boundary, and
 * *everything imported past it is client code too*, which is the part that's easy to forget — and
 * asserts that every namespace those modules read is actually shipped.
 *
 * It deliberately does NOT assert the reverse (that every listed namespace is still used). A stale
 * extra entry costs a few hundred bytes; churn on this list costs correctness.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIRS = ['app', 'components', 'lib', 'i18n'];
const EXTENSIONS = ['.tsx', '.ts'];

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

function importsOf(source: string, file: string): string[] {
  const out: string[] = [];

  for (const match of source.matchAll(IMPORT_RE)) {
    const resolved = resolveImport(match[1] ?? match[2], file);
    if (resolved) out.push(resolved);
  }

  return out;
}

/** Every module the bundler will treat as client code, starting from the `'use client'` files. */
function clientModuleGraph(): Set<string> {
  const allFiles = SOURCE_DIRS.flatMap((dir) => walk(join(root, dir)));
  const queue = allFiles.filter((file) => /^\s*(['"])use client\1/m.test(readFileSync(file, 'utf8')));
  const seen = new Set<string>(queue);

  while (queue.length) {
    const file = queue.pop()!;

    for (const dep of importsOf(readFileSync(file, 'utf8'), file)) {
      if (seen.has(dep)) continue;
      seen.add(dep);
      queue.push(dep);
    }
  }

  return seen;
}

const NAMESPACE_RE = /use(?:Translations|Messages|Format)\(\s*['"]([^'"]+)['"]/g;

describe('client message namespaces', () => {
  const clientFiles = clientModuleGraph();

  it('finds the client boundary at all (guards against the walker silently matching nothing)', () => {
    expect(clientFiles.size).toBeGreaterThan(10);
  });

  it('ships every namespace that client components read', () => {
    const shipped = new Set<string>(CLIENT_MESSAGE_NAMESPACES);
    const missing: string[] = [];

    for (const file of clientFiles) {
      for (const match of readFileSync(file, 'utf8').matchAll(NAMESPACE_RE)) {
        // `useTranslations('Appointments.cancelPage')` still only needs the root namespace.
        const namespace = match[1].split('.')[0];
        if (!shipped.has(namespace)) missing.push(`${file.slice(root.length + 1)} → ${match[1]}`);
      }
    }

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
