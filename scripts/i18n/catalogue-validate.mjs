#!/usr/bin/env node
// Checks a machine translation of the catalogue against its Thai source before any of it reaches
// the repo. Nothing here judges whether the English reads well — that is a human's job. What it
// does catch is the class of failure a translator cannot see by reading: a dropped key, a benefits
// array that lost an item, a price that drifted, a brand name that got "translated", and the
// forbidden marketing claims from docs/i18n-glossary.md that LLMs add unprompted.
//
//   node scripts/i18n/catalogue-validate.mjs /tmp/catalogue-th.json /tmp/catalogue-en.json

import { readFileSync } from 'node:fs';

const [, , sourcePath, translationPath] = process.argv;
if (!sourcePath || !translationPath) {
  console.error('usage: catalogue-validate.mjs <source.json> <translation.json>');
  process.exit(2);
}

const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
const translation = JSON.parse(readFileSync(translationPath, 'utf8'));

const THAI = /[฀-๿]/;
const BANNED =
  /\b(guarantee\w*|permanent\w*|forever|cures?|cured|heals?|miracle\w*|risk[-\s]free|world[-\s]class|100%\s*(safe|effective))\b/i;
// Numbers that must survive translation: 1 CC, 500 mg, 3 sessions. Bare years and stray digits in
// prose are covered by the same rule — a translation has no business changing any of them.
const NUMBERS = /\d[\d,.]*/g;

const problems = [];
const warnings = [];

const walk = (src, out, path = '') => {
  for (const [key, value] of Object.entries(src)) {
    const here = path ? `${path}.${key}` : key;
    if (!(key in out)) {
      problems.push(`missing key — ${here}`);
      continue;
    }
    const got = out[key];

    if (Array.isArray(value)) {
      if (!Array.isArray(got)) {
        problems.push(`type changed — ${here}: expected array, got ${typeof got}`);
        continue;
      }
      if (got.length !== value.length) {
        problems.push(`array length changed — ${here}: ${value.length} → ${got.length}`);
        continue;
      }
      value.forEach((item, index) => walk({ [index]: item }, { [index]: got[index] }, here));
      continue;
    }

    if (value && typeof value === 'object') {
      if (!got || typeof got !== 'object') {
        problems.push(`type changed — ${here}`);
        continue;
      }
      walk(value, got, here);
      continue;
    }

    const from = String(value);
    const to = String(got);

    if (THAI.test(to)) {
      // Rule 5 of the prompt tells the model to pass Thai through and flag it rather than guess,
      // so this is a question for a human, not a failure.
      warnings.push(`still Thai (translator was unsure?) — ${here}: ${to.slice(0, 50)}`);
    }
    if (BANNED.test(to)) {
      problems.push(`forbidden claim (docs/i18n-glossary.md) — ${here}: ${to.slice(0, 80)}`);
    }

    // Compared as a multiset, not a sequence: English word order legitimately moves a number
    // ("ถอดแบบจาก … ในผิวมนุษย์ 100%" → "100% replicated from …"). What must not change is which
    // numbers appear and how many times.
    const before = (from.match(NUMBERS) ?? []).sort().join(',');
    const after = (to.match(NUMBERS) ?? []).sort().join(',');
    if (before !== after) {
      problems.push(`numbers changed — ${here}: [${before}] → [${after}]`);
    }

    // Latin runs in the Thai source are brand names, product SKUs and units the glossary forbids
    // translating ("Neura Deep", "Karisma Rh Collagen", "PDO", "IV Drip").
    for (const term of from.match(/[A-Z][A-Za-z0-9]*(?:\s+[A-Z][A-Za-z0-9]*)*/g) ?? []) {
      if (term.length > 2 && !to.includes(term)) {
        warnings.push(`brand/latin term dropped — ${here}: "${term}" not present in the English`);
      }
    }
  }
};

for (const section of ['categories', 'items', 'units']) {
  if (!translation[section]) {
    problems.push(`missing whole section — ${section}`);
    continue;
  }
  walk(source[section], translation[section], section);
}

const extra = Object.keys(translation).filter(
  (key) => !['categories', 'items', 'units', '_unsure'].includes(key),
);
if (extra.length > 0) problems.push(`unexpected top-level keys — ${extra.join(', ')}`);

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
  `validation passed — ${Object.keys(translation.categories).length} categories, ${Object.keys(translation.items).length} items, ${warnings.length} warning(s)`,
);
