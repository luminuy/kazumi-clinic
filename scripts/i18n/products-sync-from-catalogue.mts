// One-off: the D1 `service_products` table has override rows (created by /admin edits, e.g.
// attaching a product photo) that shadow perfectly good English already committed in
// lib/services-en.ts — see lib/service-products-store.ts `rowToItem`: once a row exists for an
// id, its (possibly null) *_en columns are used instead of the hardcoded catalogueItemsEn
// fallback. This copies the existing, already-reviewed English from lib/services-en.ts into
// those rows' *_en columns wherever the row's *_en is still null, so /en pages stop silently
// falling back to Thai for products that were only ever "edited" for a photo, not a translation.
//
// Reads the product ids to fix from stdin (one per line, produced by a D1 query), emits SQL to
// stdout — pipe into a file, then:
//   npx wrangler d1 execute kazumi-clinic-tag-cache --remote --file=<file>.sql
//
//   npx wrangler d1 execute kazumi-clinic-tag-cache --remote --command "SELECT id FROM service_products WHERE deleted = 0" --json | node -e '...' \
//     | npx tsx scripts/i18n/products-sync-from-catalogue.mts > /tmp/products-en.sql

import { readFileSync } from 'node:fs';
import { catalogueItemsEn, catalogueUnitsEn } from '../../lib/services-en';
import { serviceCategories } from '../../lib/services';

const ids = JSON.parse(readFileSync(0, 'utf8')) as string[];

const sqlString = (value: string) => `'${value.replaceAll("'", "''")}'`;

const statements: string[] = [];
const missing: string[] = [];

for (const id of ids) {
  const en = catalogueItemsEn[id];
  if (!en) {
    missing.push(id);
    continue;
  }
  const item = serviceCategories.flatMap((c) => c.items).find((i) => i.id === id);
  const unitEn = item ? (catalogueUnitsEn[item.unit] ?? null) : null;
  const sets: string[] = [`name_en = ${sqlString(en.name)}`];
  if (en.detail !== undefined) sets.push(`detail_en = ${sqlString(en.detail)}`);
  if (en.benefits !== undefined) {
    sets.push(`benefits_en = ${sqlString(JSON.stringify(en.benefits))}`);
  }
  statements.push(`UPDATE service_products SET ${sets.join(', ')} WHERE id = ${sqlString(id)};`);
  void unitEn; // unit isn't stored per-row (service_products.unit is Thai only; localizeProduct doesn't localize it) — nothing to write for it.
}

process.stdout.write(`${statements.join('\n')}\n`);
process.stderr.write(`wrote ${statements.length} statement(s); no catalogue entry for: ${missing.join(', ') || '(none)'}\n`);
