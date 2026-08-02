// Dumps every Thai string in the hardcoded catalogue as a flat JSON payload for translation.
//
// The catalogue (lib/services.ts) stays Thai-only and hand-maintained; its English lives in the
// generated lib/services-en.ts, keyed by the same stable ids. Keeping the two apart means a
// regenerated translation never rewrites the curated Thai source, and the diff a human reviews is
// one file of prose rather than a scatter of inserted fields.
//
//   pnpm tsx scripts/i18n/catalogue-extract.mts > /tmp/catalogue-th.json

import { serviceCategories } from '../../lib/services';

const THAI = /[฀-๿]/;

const payload = {
  categories: Object.fromEntries(
    serviceCategories.map((category) => [
      category.slug,
      {
        shortDescription: category.shortDescription,
        description: category.description,
        ...(category.aftercare ? { aftercare: category.aftercare } : {}),
        ...(category.contraindications ? { contraindications: category.contraindications } : {}),
        ...(category.downtime ? { downtime: category.downtime } : {}),
      },
    ]),
  ),
  items: Object.fromEntries(
    serviceCategories.flatMap((category) =>
      category.items.map((item) => [
        item.id!,
        {
          // Names are mostly brand SKUs already in Latin script ("Neura Deep"). They ride along so
          // the translator sees them in context and can leave them untouched, which the glossary
          // requires — inventing an English name for a product is a compliance problem, not a
          // style one.
          name: item.name,
          ...(item.detail ? { detail: item.detail } : {}),
          ...(item.benefits ? { benefits: item.benefits } : {}),
        },
      ]),
    ),
  ),
  units: Object.fromEntries(
    [...new Set(serviceCategories.flatMap((c) => c.items.map((i) => i.unit)))].map((unit) => [
      unit,
      unit,
    ]),
  ),
};

const thaiFields = JSON.stringify(payload).match(/[฀-๿]+/g)?.length ?? 0;
process.stderr.write(
  `categories: ${Object.keys(payload.categories).length} · items: ${Object.keys(payload.items).length} · Thai runs to translate: ${thaiFields}\n`,
);
if (!THAI.test(JSON.stringify(payload))) {
  process.stderr.write('nothing Thai left in the catalogue — is this already translated?\n');
}

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
