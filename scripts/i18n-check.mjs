#!/usr/bin/env node
// Guardrail for the bilingual site (CLAUDE.md §13 · docs/i18n-glossary.md).
//
// Why this exists: on 2026-07-27 every key in en.json was present and Thai-free, yet /en/blog still
// rendered 343 Thai words — because the Thai lives *hardcoded in the JSX*, where no key-parity test
// can see it. Key parity is covered by tests/invariants.test.ts; this script covers what it cannot:
//
//   1. Thai characters surviving in en.json values
//   2. next-intl placeholders ({siteName}…) that a translation dropped, renamed, or invented
//   3. Marketing claims the glossary forbids (guarantee / permanent / 100% safe …)
//   4. Thai string literals hardcoded in shipped source, measured against a baseline so the
//      remaining debt can only shrink
//
// Usage:
//   pnpm i18n:check              static checks (CI runs this)
//   pnpm i18n:check --update     rewrite the baseline after burning debt down
//   pnpm i18n:check --live [url] also fetch the live /en pages and count Thai (network; not in CI)

import { readFileSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BASELINE = join(ROOT, 'scripts/i18n-baseline.json');
const THAI = /[฀-๿]/;

// Source that ships to the browser. lib/services.ts is deliberately absent: the catalogue gets its
// English through `*En` fields in phase 2, not through messages, and is tracked there instead.
const SCAN_DIRS = ['app/(site)', 'components'];
const SCAN_EXT = ['.tsx', '.ts'];

// /admin has no locale by design (CLAUDE.md §13) — it is a Thai-only staff tool, so Thai in its
// components is correct, not debt. Excluded rather than baselined so the number below means one
// thing only: text a visitor on /en can still see in Thai.
const SCAN_IGNORE = ['components/admin/'];

const argv = process.argv.slice(2);
const UPDATE = argv.includes('--update');
const LIVE = argv.includes('--live');
const LIVE_BASE = argv[argv.indexOf('--live') + 1]?.startsWith('http')
  ? argv[argv.indexOf('--live') + 1]
  : 'https://kazumiclinic.skin';

const problems = [];
const fail = (msg) => problems.push(msg);

// ── 1 + 2 + 3: the message catalogues ────────────────────────────────────────────────────────────
const th = JSON.parse(readFileSync(join(ROOT, 'messages/th.json'), 'utf8'));
const en = JSON.parse(readFileSync(join(ROOT, 'messages/en.json'), 'utf8'));

const flatten = (node, prefix = '', out = {}) => {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') flatten(value, path, out);
    else out[path] = value;
  }
  return out;
};

const flatTh = flatten(th);
const flatEn = flatten(en);

// Claims that are illegal for a Thai clinic to advertise (CLAUDE.md §0.2). Matched as whole words so
// "cured" trips it but "accurate" does not, and "permanent" is caught inside "permanently".
const BANNED = [
  /\bguarantee\w*\b/i,
  /\b100%\s*(safe|effective|guaranteed)\b/i,
  /\bpermanent\w*\b/i,
  /\bforever\b/i,
  /\bcures?\b/i,
  /\bcured\b/i,
  /\bmiracle\w*\b/i,
  /\bno\s+side\s+effects?\b/i,
  /\brisk[-\s]free\b/i,
];

const placeholders = (value) => (String(value).match(/\{[a-zA-Z0-9_]+\}/g) ?? []).sort();

for (const [path, value] of Object.entries(flatEn)) {
  const text = String(value);

  if (THAI.test(text)) {
    fail(`en.json still Thai — ${path}: ${text.slice(0, 60)}`);
  }

  const want = placeholders(flatTh[path] ?? '').join(',');
  const got = placeholders(text).join(',');
  if (want !== got) {
    fail(`placeholder mismatch — ${path}: th has [${want || 'none'}], en has [${got || 'none'}]`);
  }

  for (const rule of BANNED) {
    if (rule.test(text)) {
      fail(`forbidden claim (docs/i18n-glossary.md) — ${path}: matches ${rule}`);
    }
  }
}

// ── 4: Thai hardcoded in shipped source ──────────────────────────────────────────────────────────
async function walk(dir) {
  const files = [];
  for (const entry of await readdir(join(ROOT, dir), { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (SCAN_EXT.some((ext) => entry.name.endsWith(ext))) files.push(path);
  }
  return files;
}

// A Thai comment never reaches the browser, so only non-comment lines count as debt. This is a
// line-level heuristic, not a parser: it over-reports a Thai string that trails `*/` on one line,
// which is fine — the baseline records whatever it reports and only requires the count to fall.
const isComment = (line) => /^\s*(\/\/|\/\*|\*)/.test(line);

const found = {};
for (const dir of SCAN_DIRS) {
  for (const file of await walk(dir)) {
    if (SCAN_IGNORE.some((prefix) => file.startsWith(prefix))) continue;
    const hits = readFileSync(join(ROOT, file), 'utf8')
      .split('\n')
      .filter((line) => THAI.test(line) && !isComment(line)).length;
    if (hits > 0) found[relative('.', file)] = hits;
  }
}

if (UPDATE) {
  const total = Object.values(found).reduce((a, b) => a + b, 0);
  writeFileSync(
    BASELINE,
    `${JSON.stringify({ note: 'Thai lines still hardcoded in shipped source. Only allowed to go down — pnpm i18n:check --update after burning some off.', total, files: found }, null, 2)}\n`,
  );
  console.log(`baseline updated: ${total} Thai lines across ${Object.keys(found).length} files`);
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
for (const [file, hits] of Object.entries(found)) {
  const allowed = baseline.files[file] ?? 0;
  if (hits > allowed) {
    fail(
      `hardcoded Thai grew — ${file}: ${hits} lines (baseline ${allowed}). Move the text into messages/{th,en}.json (CLAUDE.md §13).`,
    );
  }
}
const total = Object.values(found).reduce((a, b) => a + b, 0);

// ── optional: what the live site actually renders ────────────────────────────────────────────────
if (LIVE) {
  const paths = ['', 'services', 'filler', 'about', 'blog', 'reviews', 'promotions', 'contact'];
  console.log(`\nlive check — ${LIVE_BASE}/en`);
  for (const path of paths) {
    const url = `${LIVE_BASE}/en/${path}`;
    try {
      const html = await fetch(url).then((r) => r.text());
      const words = (html.replace(/<[^>]*>/g, ' ').match(/[฀-๿]+/g) ?? []).length;
      console.log(`  ${words === 0 ? '✓' : '·'} /en/${path || ''} — ${words} Thai words`);
    } catch (error) {
      console.log(`  ? /en/${path || ''} — fetch failed: ${error.message}`);
    }
  }
}

// ── report ───────────────────────────────────────────────────────────────────────────────────────
console.log(
  `\nmessages: ${Object.keys(flatEn).length} keys · hardcoded Thai: ${total} lines (baseline ${baseline.total})`,
);

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}

console.log('i18n check passed');
