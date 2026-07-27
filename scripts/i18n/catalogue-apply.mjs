#!/usr/bin/env node
// Writes a validated translation into lib/services-en.ts.
//
//   node scripts/i18n/catalogue-apply.mjs /tmp/catalogue-en.json
//
// The English lives in its own generated file rather than as `*En` fields inside lib/services.ts on
// purpose: lib/services.ts is the clinic's hand-maintained Thai source of truth (prices, อย. notes,
// stable ids), and regenerating a translation must never rewrite it. Keys are the same stable ids,
// so tests/invariants.test.ts can prove the two files stay 1:1.

import { readFileSync, writeFileSync } from 'node:fs';

const [, , translationPath] = process.argv;
if (!translationPath) {
  console.error('usage: catalogue-apply.mjs <translation.json>');
  process.exit(2);
}

const translation = JSON.parse(readFileSync(translationPath, 'utf8'));
const { categories, items, units } = translation;

const quote = (value) => JSON.stringify(value);
const entries = (record, indent, render) =>
  Object.entries(record)
    .map(([key, value]) => `${indent}${quote(key)}: ${render(value, `${indent}  `)},`)
    .join('\n');

const category = (value, indent) =>
  [
    '{',
    `${indent}shortDescription: ${quote(value.shortDescription)},`,
    `${indent}description: ${quote(value.description)},`,
    `${indent.slice(2)}}`,
  ].join('\n');

const item = (value, indent) => {
  const lines = [`${indent}name: ${quote(value.name)},`];
  if (value.detail !== undefined) lines.push(`${indent}detail: ${quote(value.detail)},`);
  if (value.benefits !== undefined) {
    lines.push(`${indent}benefits: [`);
    for (const benefit of value.benefits) lines.push(`${indent}  ${quote(benefit)},`);
    lines.push(`${indent}],`);
  }
  return ['{', ...lines, `${indent.slice(2)}}`].join('\n');
};

const file = `// GENERATED — do not edit by hand.
//
//   npx tsx scripts/i18n/catalogue-extract.mts > /tmp/catalogue-th.json
//   bash scripts/i18n/translate-catalogue.sh /tmp/catalogue-th.json > /tmp/catalogue-en.json
//   node scripts/i18n/catalogue-validate.mjs /tmp/catalogue-th.json /tmp/catalogue-en.json
//   node scripts/i18n/catalogue-apply.mjs /tmp/catalogue-en.json
//
// English for the service catalogue, keyed by the same stable ids as lib/services.ts. That file
// stays the Thai source of truth — prices, อย. notes and ids are curated by hand there and must not
// be rewritten by a translation run. tests/invariants.test.ts proves the two stay 1:1, so a new
// Thai item cannot ship without its English.
//
// Wording rules (medical advertising is regulated — CLAUDE.md §0.2): docs/i18n-glossary.md.

export type CatalogueCategoryEn = {
  shortDescription: string;
  description: string;
};

export type CatalogueItemEn = {
  name: string;
  detail?: string;
  benefits?: string[];
};

export const catalogueCategoriesEn: Record<string, CatalogueCategoryEn> = {
${entries(categories, '  ', category)}
};

export const catalogueItemsEn: Record<string, CatalogueItemEn> = {
${entries(items, '  ', item)}
};

/** Unit words are a closed set ("ครั้ง"), so they translate through a lookup rather than per item. */
export const catalogueUnitsEn: Record<string, string> = {
${Object.entries(units)
  .map(([thai, english]) => `  ${quote(thai)}: ${quote(english)},`)
  .join('\n')}
};
`;

writeFileSync(new URL('../../lib/services-en.ts', import.meta.url), file);
console.log(
  `wrote lib/services-en.ts — ${Object.keys(categories).length} categories, ${Object.keys(items).length} items, ${Object.keys(units).length} unit(s)`,
);
