import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { cache } from 'react';
import { localizeProduct } from '@/lib/content-locale';
import type { Locale } from '@/lib/site';
import { catalogueUnitsEn } from '@/lib/services-en';
import { localizeServiceCategory, localizeServiceItem } from '@/lib/services-locale';
import { getServiceBySlug, serviceCategories, type ServiceItem } from './services';

/**
 * The product override layer. Same shape and safety net as lib/site-images-store.ts, one level
 * up: instead of a single public ID per slot, each row is a whole product the clinic edited,
 * added, or removed through /admin. An empty table means the site renders the hardcoded
 * catalogue in lib/services.ts unchanged, and any D1 failure degrades to that same catalogue —
 * a clinic's menu should never 500 because the database blinked.
 *
 * See migrations/0002_service_products.sql for the three row kinds (edit / new / delete-tombstone).
 */

export type ProductRow = {
  id: string;
  category: string;
  name: string;
  name_en: string | null;
  detail: string | null;
  detail_en: string | null;
  tagline: string | null;
  tagline_en: string | null;
  benefits: string | null;
  benefits_en: string | null;
  collection: string | null;
  price_from: number | null;
  unit: string;
  image_public_id: string | null;
  sort_order: number;
  deleted: number;
  updated_at: number;
  updated_by: string;
};

/** Everything the admin form can set on a product. `id`/`category` identify the row. */
export type ProductInput = {
  id: string;
  category: string;
  name: string;
  nameEn?: string | null;
  detail?: string | null;
  detailEn?: string | null;
  tagline?: string | null;
  taglineEn?: string | null;
  benefits?: string[] | null;
  benefitsEn?: string[] | null;
  collection?: string | null;
  priceFrom?: number | null;
  unit?: string | null;
  imagePublicId?: string | null;
  sortOrder: number;
};

async function db() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { NEXT_TAG_CACHE_D1?: D1Database }).NEXT_TAG_CACHE_D1 ?? null;
  } catch {
    return null;
  }
}

/**
 * Every product row grouped by category. Empty map when D1 is unavailable. React cache
 * deduplicates the read across a single render (the category page and its JSON-LD both need it).
 */
export const getProductRowsByCategory = cache(async (): Promise<Map<string, ProductRow[]>> => {
  const binding = await db();
  if (!binding) return new Map();
  try {
    const { results } = await binding
      .prepare('SELECT * FROM service_products ORDER BY sort_order')
      .all<ProductRow>();
    const byCategory = new Map<string, ProductRow[]>();
    for (const row of results) {
      const list = byCategory.get(row.category);
      if (list) list.push(row);
      else byCategory.set(row.category, [row]);
    }
    return byCategory;
  } catch {
    return new Map();
  }
});

export type MergedServiceItem = ServiceItem & {
  nameEn?: string | null;
  detailEn?: string | null;
  taglineEn?: string | null;
  benefitsEn?: string[] | null;
};

function parseBenefits(value: string | null): string[] | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const benefits = parsed.map(String).filter((item) => item.trim().length > 0);
      if (benefits.length > 0) return benefits;
    }
  } catch {
    // Malformed JSON in a column the admin writes as JSON — drop the benefits rather than throw.
  }
  return undefined;
}

function rowToItem(
  source: ProductRow,
  locale: Locale | string = 'th',
): MergedServiceItem {
  const row = localizeProduct(source, locale);
  const benefits = parseBenefits(row.benefits);
  return {
    id: row.id,
    name: row.name,
    nameEn: source.name_en,
    detail: row.detail ?? undefined,
    detailEn: source.detail_en,
    tagline: row.tagline ?? undefined,
    taglineEn: source.tagline_en,
    benefits,
    benefitsEn: parseBenefits(source.benefits_en),
    collection: row.collection ?? undefined,
    priceFrom: row.price_from ?? undefined,
    unit: locale === 'en' ? (catalogueUnitsEn[row.unit] ?? row.unit) : row.unit,
    imagePublicId: row.image_public_id ?? undefined,
  };
}

/**
 * Merge one category's hardcoded items with its D1 overrides into the list the site renders.
 *
 * Ordering: a hardcoded item with no row keeps its position in the code (its index); a row
 * carries its own `sort_order`, which the admin sets to that same index when it only edits
 * fields, and changes only on an explicit reorder — so editing a product never makes it jump.
 */
export async function getCategoryItems(
  slug: string,
  locale: Locale | string = 'th',
): Promise<MergedServiceItem[]> {
  const base = getServiceBySlug(slug)?.items ?? [];
  const rows = (await getProductRowsByCategory()).get(slug) ?? [];
  const rowById = new Map(rows.map((r) => [r.id, r]));

  const merged: { item: MergedServiceItem; order: number }[] = [];
  base.forEach((item, index) => {
    const row = item.id ? rowById.get(item.id) : undefined;
    if (row?.deleted) return; // the clinic removed this shipped product
    merged.push({
      item: row ? rowToItem(row, locale) : localizeServiceItem(item, locale),
      order: row ? row.sort_order : index,
    });
  });
  for (const row of rows) {
    if (row.deleted) continue;
    if (base.some((item) => item.id === row.id)) continue; // handled above as an edit
    merged.push({ item: rowToItem(row, locale), order: row.sort_order });
  }

  merged.sort((a, b) => a.order - b.order);
  return merged.map((m) => m.item);
}

/**
 * Every hidden product in a category — shipped ones the clinic tombstoned and clinic-added ones
 * it soft-deleted, kept separately so the admin can restore either kind.
 */
export async function getHiddenProducts(slug: string): Promise<MergedServiceItem[]> {
  const rows = (await getProductRowsByCategory()).get(slug) ?? [];
  return rows.filter((row) => row.deleted).map((row) => rowToItem(row));
}

/** A category with its items resolved through the override layer — what pages/schema render. */
export async function getMergedCategory(
  slug: string,
  locale: Locale | string = 'th',
) {
  const base = getServiceBySlug(slug);
  if (!base) return undefined;
  const category = localizeServiceCategory(base, locale);
  return { ...category, items: await getCategoryItems(slug, locale) };
}

// ── Writes (used by the /admin products API) ────────────────────────────────────────────────

function requireDb(binding: D1Database | null): asserts binding is D1Database {
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');
}

/**
 * Insert a product, or edit its text fields. Deliberately does NOT touch `image_public_id` or
 * `sort_order` on an existing row: the photo is owned by setProductImage and the order by
 * reorderProducts, so editing a name never wipes the photo or moves the product. On a fresh
 * INSERT both take the seed values passed in.
 */
export async function upsertProduct(input: ProductInput, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare(
      `INSERT INTO service_products
         (id, category, name, name_en, detail, detail_en, tagline, tagline_en, benefits,
          benefits_en, collection, price_from, unit, image_public_id, sort_order, deleted,
          updated_at, updated_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, 0, ?16, ?17)
       ON CONFLICT(id) DO UPDATE SET
         category = ?2, name = ?3, name_en = ?4, detail = ?5, detail_en = ?6,
         tagline = ?7, tagline_en = ?8, benefits = ?9, benefits_en = ?10, collection = ?11,
         price_from = ?12, unit = ?13, deleted = 0, updated_at = ?16, updated_by = ?17`,
    )
    .bind(
      input.id,
      input.category,
      input.name,
      input.nameEn ?? null,
      input.detail ?? null,
      input.detailEn ?? null,
      input.tagline ?? null,
      input.taglineEn ?? null,
      input.benefits && input.benefits.length > 0 ? JSON.stringify(input.benefits) : null,
      input.benefitsEn && input.benefitsEn.length > 0 ? JSON.stringify(input.benefitsEn) : null,
      input.collection ?? null,
      input.priceFrom ?? null,
      input.unit ?? 'ครั้ง',
      input.imagePublicId ?? null,
      input.sortOrder,
      Date.now(),
      updatedBy,
    )
    .run();
}

/** Just the image, for the per-product upload button — leaves every other field untouched. */
export async function setProductImage(
  id: string,
  category: string,
  imagePublicId: string,
  updatedBy: string,
) {
  const binding = await db();
  requireDb(binding);
  const result = await binding
    .prepare(
      'UPDATE service_products SET image_public_id = ?1, updated_at = ?2, updated_by = ?3 WHERE id = ?4',
    )
    .bind(imagePublicId, Date.now(), updatedBy, id)
    .run();
  // No row yet (a hardcoded product's first upload) — seed one from its code defaults, carrying
  // the new image. upsertProduct's INSERT path takes both the image and the seed sort order.
  if (result.meta.changes === 0) {
    const base = getServiceBySlug(category)?.items.find((item) => item.id === id);
    await upsertProduct(
      {
        id,
        category,
        name: base?.name ?? id,
        detail: base?.detail ?? null,
        tagline: base?.tagline ?? null,
        benefits: base?.benefits ?? null,
        collection: base?.collection ?? null,
        priceFrom: base?.priceFrom ?? null,
        unit: base?.unit ?? 'ครั้ง',
        imagePublicId,
        sortOrder: baseSortOrder(category, id),
      },
      updatedBy,
    );
  }
}

/**
 * Hide a product — always a tombstone (deleted = 1), never a hard delete, so every product is
 * restorable the same way. A hardcoded one has no row yet the first time it's hidden, so it's
 * seeded from its code defaults; a clinic-added one already has a row and just gets flagged.
 */
export async function deleteProduct(id: string, category: string, updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  const base = getServiceBySlug(category)?.items.find((item) => item.id === id);
  if (base) {
    await binding
      .prepare(
        `INSERT INTO service_products
           (id, category, name, detail, tagline, benefits, collection, price_from, unit,
            image_public_id, sort_order, deleted, updated_at, updated_by)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 1, ?12, ?13)
         ON CONFLICT(id) DO UPDATE SET deleted = 1, updated_at = ?12, updated_by = ?13`,
      )
      .bind(
        id,
        category,
        base.name,
        base.detail ?? null,
        base.tagline ?? null,
        base.benefits && base.benefits.length > 0 ? JSON.stringify(base.benefits) : null,
        base.collection ?? null,
        base.priceFrom ?? null,
        base.unit,
        base.imagePublicId ?? null,
        baseSortOrder(category, id),
        Date.now(),
        updatedBy,
      )
      .run();
  } else {
    await binding
      .prepare('UPDATE service_products SET deleted = 1, updated_at = ?1, updated_by = ?2 WHERE id = ?3')
      .bind(Date.now(), updatedBy, id)
      .run();
  }
}

/** Restore a shipped product that was previously hidden with a tombstone. */
export async function restoreProduct(id: string, category: string, updatedBy: string): Promise<void> {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare(
      'UPDATE service_products SET deleted = 0, updated_at = ?1, updated_by = ?2 WHERE id = ?3 AND category = ?4',
    )
    .bind(Date.now(), updatedBy, id, category)
    .run();
}

/**
 * Persist a new product order for one category. A product that already has a row just gets its
 * `sort_order` updated; a hardcoded product with no row yet is written out in full (from its code
 * defaults) so the new position sticks — without a row the merge would fall back to code order.
 */
export async function reorderProducts(category: string, orderedIds: string[], updatedBy: string) {
  const binding = await db();
  requireDb(binding);
  const { results } = await binding
    .prepare('SELECT id FROM service_products WHERE category = ?1')
    .bind(category)
    .all<{ id: string }>();
  const existing = new Set(results.map((r) => r.id));
  const base = new Map((getServiceBySlug(category)?.items ?? []).map((item) => [item.id, item]));
  const now = Date.now();

  const statements = orderedIds.flatMap((id, index) => {
    if (existing.has(id)) {
      return [
        binding
          .prepare(
            'UPDATE service_products SET sort_order = ?1, updated_at = ?2, updated_by = ?3 WHERE id = ?4',
          )
          .bind(index, now, updatedBy, id),
      ];
    }
    const item = base.get(id);
    if (!item) return []; // unknown id — ignore rather than write a ghost row
    return [
      binding
        .prepare(
          `INSERT INTO service_products
             (id, category, name, detail, tagline, benefits, collection, price_from, unit,
              image_public_id, sort_order, deleted, updated_at, updated_by)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, NULL, ?10, 0, ?11, ?12)`,
        )
        .bind(
          id,
          category,
          item.name,
          item.detail ?? null,
          item.tagline ?? null,
          item.benefits && item.benefits.length > 0 ? JSON.stringify(item.benefits) : null,
          item.collection ?? null,
          item.priceFrom ?? null,
          item.unit,
          index,
          now,
          updatedBy,
        ),
    ];
  });

  if (statements.length > 0) await binding.batch(statements);
}

/** The order a hardcoded product sits at in the code, used as the default sort for a new row. */
function baseSortOrder(category: string, id: string): number {
  const index = getServiceBySlug(category)?.items.findIndex((item) => item.id === id) ?? -1;
  return index >= 0 ? index : nextSortOrder(category);
}

/** One past the last hardcoded product — where a brand-new product goes by default. */
function nextSortOrder(category: string): number {
  return getServiceBySlug(category)?.items.length ?? 0;
}

/** Every category with its merged items — the admin products page reads this. */
export async function getAllMergedCategories(locale: Locale | string = 'th') {
  return Promise.all(
    serviceCategories.map(async (category) => {
      const localized = localizeServiceCategory(category, locale);
      return {
        ...localized,
        items: await getCategoryItems(category.slug, locale),
      };
    }),
  );
}
