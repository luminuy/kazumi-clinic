import type { Locale } from "@/lib/site";
import {
  catalogueCategoriesEn,
  catalogueItemsEn,
  catalogueUnitsEn,
} from "@/lib/services-en";
import type { ServiceCategory, ServiceItem } from "@/lib/services";

/**
 * Overlays the generated English catalogue (lib/services-en.ts) onto the Thai source of truth
 * (lib/services.ts) for a given locale.
 *
 * Thai is returned untouched — it is the original, not a translation of anything. English falls back
 * to Thai field by field rather than all-or-nothing: a product the clinic just added through /admin
 * has no translation yet, and showing its Thai name next to English copy is far better than showing
 * a blank, an id, or nothing at all.
 *
 * The functions take a category/item rather than a slug so they work on the *merged* catalogue
 * (lib/services.ts + the clinic's D1 product overrides), not only on the hardcoded defaults.
 */

const isEnglish = (locale: string): boolean => locale === "en";

export function localizeServiceItem(
  item: ServiceItem,
  locale: Locale | string,
): ServiceItem {
  if (!isEnglish(locale)) return item;
  const en = item.id ? catalogueItemsEn[item.id] : undefined;
  return {
    ...item,
    name: en?.name ?? item.name,
    detail: en?.detail ?? item.detail,
    benefits: en?.benefits ?? item.benefits,
    unit: catalogueUnitsEn[item.unit] ?? item.unit,
  };
}

export function localizeServiceCategory(
  category: ServiceCategory,
  locale: Locale | string,
): ServiceCategory {
  if (!isEnglish(locale)) return category;
  const en = catalogueCategoriesEn[category.slug];
  return {
    ...category,
    // `titleEn` has always been part of the Thai file (it is the clinic's own English name for the
    // category, e.g. "Dermal Filler"), so English pages use it as the title rather than a
    // translation of `title`.
    title: category.titleEn,
    shortDescription: en?.shortDescription ?? category.shortDescription,
    description: en?.description ?? category.description,
    items: category.items.map((item) => localizeServiceItem(item, locale)),
  };
}

export function localizeServiceCategories(
  categories: ServiceCategory[],
  locale: Locale | string,
): ServiceCategory[] {
  if (!isEnglish(locale)) return categories;
  return categories.map((category) =>
    localizeServiceCategory(category, locale),
  );
}
