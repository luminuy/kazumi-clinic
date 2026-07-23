import { serviceCategories } from '@/lib/services';

/**
 * The subset of the service catalog that can go in a cart: a product is "purchasable" only when it
 * has both a stable `id` and a published `priceFrom`. Everything else (programs priced
 * "สอบถามราคา") stays a LINE booking, never a cart line — a medical procedure without a fixed
 * published price must not read as a checkout item (CLAUDE.md §0.2).
 *
 * Price is exposed in satang (THB * 100) to match how money is stored everywhere in the DB.
 */
export type PurchasableProduct = {
  id: string;
  name: string;
  detail?: string;
  /** Display title snapshotted into cart/order rows: name, plus detail when present. */
  title: string;
  priceSatang: number;
  unit: string;
  categorySlug: string;
  categoryTitle: string;
};

function displayTitle(name: string, detail?: string): string {
  return detail ? `${name} · ${detail}` : name;
}

/** All purchasable products across every category, in catalog order. */
export function purchasableProducts(): PurchasableProduct[] {
  const out: PurchasableProduct[] = [];
  for (const category of serviceCategories) {
    for (const item of category.items) {
      if (!item.id || item.priceFrom === undefined) continue;
      out.push({
        id: item.id,
        name: item.name,
        detail: item.detail,
        title: displayTitle(item.name, item.detail),
        priceSatang: Math.round(item.priceFrom * 100),
        unit: item.unit,
        categorySlug: category.slug,
        categoryTitle: category.title,
      });
    }
  }
  return out;
}

/** Look up one purchasable product by id, or null if it doesn't exist / isn't purchasable. */
export function findPurchasableProduct(id: string): PurchasableProduct | null {
  return purchasableProducts().find((p) => p.id === id) ?? null;
}

/** True when the given product id can be added to a cart. */
export function isPurchasable(id: string | undefined): boolean {
  return !!id && findPurchasableProduct(id) !== null;
}
