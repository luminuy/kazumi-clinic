// Promotion data. IMPORTANT (see CLAUDE.md §0.2): promo prices must state their validity
// period, and medical marketing must be reviewed by the clinic before publishing.
//
// The entries below are transcribed from the clinic's "May Exclusive Offer" posters, which
// expired 2026-05-31. They are kept here as a template — `isActive()` filters out expired
// promos automatically, so the live page shows an empty state until the clinic supplies
// current, in-date promotions. Do NOT present expired promos as active.

export type Promotion = {
  name: string;
  detail?: string;
  price: number;
  originalPrice?: number;
  note?: string;
  /** ISO date (inclusive). Promo is hidden once today is past this. */
  validUntil: string;
  categorySlug?: string;
};

export const promotions: Promotion[] = [
  {
    name: 'Filler Neura Deep',
    detail: '1 CC',
    price: 3990,
    note: 'ราคาโปรโมชั่น',
    validUntil: '2026-05-31',
    categorySlug: 'filler',
  },
  {
    name: 'Filler Neura Deep',
    detail: '3 CC',
    price: 9990,
    note: 'ราคาโปรโมชั่น',
    validUntil: '2026-05-31',
    categorySlug: 'filler',
  },
  {
    name: 'Filler Neura Volume',
    detail: '1 CC',
    price: 5990,
    note: 'ราคาโปรโมชั่น',
    validUntil: '2026-05-31',
    categorySlug: 'filler',
  },
  {
    name: 'Filler Lip (Neura Deep)',
    detail: '1 CC',
    price: 4990,
    note: 'ราคาโปรโมชั่น',
    validUntil: '2026-05-31',
    categorySlug: 'filler',
  },
  {
    name: 'Snow IV Drip (Velvet Glow)',
    price: 2590,
    note: 'ซื้อ 1 แถม 1 · ราคาโปรโมชั่น',
    validUntil: '2026-05-31',
    categorySlug: 'iv-drip',
  },
  {
    name: 'NCTF 135 HA + Oxelle',
    price: 11990,
    note: 'ราคาโปรโมชั่น',
    validUntil: '2026-05-31',
    categorySlug: 'skin-booster',
  },
  {
    name: 'Botulinum Toxin Neuro',
    detail: '100 U',
    price: 8990,
    note: 'ราคาโปรโมชั่น',
    validUntil: '2026-05-31',
    categorySlug: 'botox',
  },
  {
    name: 'Karisma Rh Collagen',
    detail: '1 กล่อง',
    price: 18990,
    note: 'ราคาโปรโมชั่น',
    validUntil: '2026-05-31',
    categorySlug: 'collagen-booster',
  },
];

/** Promos still valid as of `now` (defaults to today). Compares date-only, inclusive of validUntil. */
export function activePromotions(now: Date = new Date()): Promotion[] {
  const today = now.toISOString().slice(0, 10);
  return promotions.filter((p) => p.validUntil >= today);
}
