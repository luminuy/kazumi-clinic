#!/usr/bin/env node
// Checks a machine translation of blog posts against its Thai source before any of it reaches D1.
// Same checks as catalogue-validate.mjs (see that file for rationale), generalized to the
// {posts: {id: {title, excerpt, body}}} shape blog-extract.mjs produces.
//
//   node scripts/i18n/blog-validate.mjs <source.json> <translation.json>

import { readFileSync } from 'node:fs';

const [, , sourcePath, translationPath] = process.argv;
if (!sourcePath || !translationPath) {
  console.error('usage: blog-validate.mjs <source.json> <translation.json>');
  process.exit(2);
}

const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
const translation = JSON.parse(readFileSync(translationPath, 'utf8'));

const THAI = /[฀-๿]/;
const BANNED =
  /\b(guarantee\w*|permanent\w*|forever|cures?|cured|heals?|miracle\w*|risk[-\s]free|world[-\s]class|100%\s*(safe|effective))\b/i;
const NUMBERS = /\d[\d,.]*/g;
const MD_LINKS = /\[[^\]]*\]\(([^)]+)\)/g;
const MD_HEADINGS = /^#{2,4}\s/gm;

const problems = [];
const warnings = [];

for (const [id, post] of Object.entries(source.posts)) {
  const got = translation.posts?.[id];
  if (!got) {
    problems.push(`missing post — ${id}`);
    continue;
  }

  for (const field of ['title', 'excerpt', 'body']) {
    const from = String(post[field] ?? '');
    const to = String(got[field] ?? '');
    if (!from) continue;
    if (!to) {
      problems.push(`missing field — ${id}.${field}`);
      continue;
    }

    if (THAI.test(to)) warnings.push(`still Thai (translator unsure?) — ${id}.${field}`);
    if (BANNED.test(to)) problems.push(`forbidden claim — ${id}.${field}: ${to.slice(0, 80)}`);

    const before = (from.match(NUMBERS) ?? []).sort().join(',');
    const after = (to.match(NUMBERS) ?? []).sort().join(',');
    if (before !== after) problems.push(`numbers changed — ${id}.${field}: [${before}] → [${after}]`);

    if (field === 'body') {
      const urlsBefore = [...from.matchAll(MD_LINKS)].map((m) => m[1]).sort();
      const urlsAfter = [...to.matchAll(MD_LINKS)].map((m) => m[1]).sort();
      if (JSON.stringify(urlsBefore) !== JSON.stringify(urlsAfter)) {
        problems.push(`link URLs changed — ${id}.body: [${urlsBefore}] → [${urlsAfter}]`);
      }

      const headingsBefore = (from.match(MD_HEADINGS) ?? []).length;
      const headingsAfter = (to.match(MD_HEADINGS) ?? []).length;
      if (headingsBefore !== headingsAfter) {
        problems.push(`heading count changed — ${id}.body: ${headingsBefore} → ${headingsAfter}`);
      }
    }
  }
}

if (Array.isArray(translation._unsure) && translation._unsure.length > 0) {
  warnings.push(`translator flagged as unsure: ${translation._unsure.join(', ')}`);
}

for (const warning of warnings) console.warn(`  ! ${warning}`);

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}

console.log(
  `validation passed — ${Object.keys(source.posts).length} posts, ${warnings.length} warning(s)`,
);
