// Promotion data. IMPORTANT (see CLAUDE.md §0.2): promo prices must state their validity
// period, and medical marketing must be reviewed by the clinic before publishing.
//
// The entries below are transcribed from the clinic's "May Exclusive Offer" posters, which
// expired 2026-05-31. They are kept here as a template — `isActive()` filters out expired
// promos automatically, so the live page shows an empty state until the clinic supplies
// current, in-date promotions. Do NOT present expired promos as active.

import { cloudAssets } from './cloud';
import type { SiteImageKey } from './site-images';

export type Promotion = {
  name: string;
  detail?: string;
  price?: number;
  originalPrice?: number;
  note?: string;
  /** ISO date (inclusive). Promo is hidden once today is past this. */
  validUntil: string;
  categorySlug?: string;
  imagePublicId?: string;
};

export type PromotionPoster = {
  src: string;
  alt: string;
  label: string;
  categorySlug: string;
  /** Display category name for the card layout (uppercase). */
  categoryLabel: string;
  /** Card title shown below the poster image. */
  title: string;
  /** Card subtitle / tagline shown below the title. */
  subtitle: string;
  /** Optional badge shown on the poster image (e.g. "LIMITED", "HOT"). */
  badge?: string;
  /** Badge colour variant: 'red' | 'blue' (default: 'blue'). */
  badgeVariant?: 'red' | 'blue';
};

/** A poster may wait for its admin-managed image slot to be populated. */
type PromotionPosterSource = Omit<PromotionPoster, 'src'> & {
  src?: string;
  imageKey: SiteImageKey;
};

/**
 * Visual campaign artwork supplied by the clinic. These are shown as a gallery,
 * not as date-gated offers; visitors should confirm current price and validity
 * with the clinic before booking.
 */
export const promotionPosters: PromotionPosterSource[] = [
  {
    src: cloudAssets.promoSignatureFlawless,
    imageKey: 'promo-signature-flawless',
    alt: 'โปสเตอร์ Signature Flawless IV Drip พร้อมภาพผู้หญิงและถุงสารน้ำ',
    label: 'IV Drip · Signature Flawless',
    categorySlug: 'iv-drip',
    categoryLabel: 'VITAMIN THERAPY',
    title: 'Signature Flawless',
    subtitle: 'The Masterpiece of Skin Perfection.',
    badge: 'LIMITED',
    badgeVariant: 'red',
  },
  {
    src: cloudAssets.promoRadiantBright,
    imageKey: 'promo-radiant-bright',
    alt: 'โปสเตอร์ Radiant Bright IV Drip พร้อมภาพผู้หญิงผมสีน้ำตาล',
    label: 'IV Drip · Radiant Bright',
    categorySlug: 'iv-drip',
    categoryLabel: 'GLOW PROGRAM',
    title: 'Radiant Bright IV',
    subtitle: 'The Shield for Radiant Skin.',
  },
  {
    src: cloudAssets.promoFillerNeura,
    imageKey: 'promo-filler-neura',
    alt: 'โปสเตอร์ Filler Neura Deep และ Neura Volume พร้อมภาพใบหน้าด้านข้าง',
    label: 'Filler · Neura',
    categorySlug: 'filler',
    categoryLabel: 'FACIAL SCULPTING',
    title: 'Filler Exclusive Offer',
    subtitle: 'Starting from ฿3,990',
    badge: 'HOT',
    badgeVariant: 'blue',
  },
  {
    src: cloudAssets.promoOxelleSkinBooster,
    imageKey: 'promo-oxelle-skin-booster',
    alt: 'โปสเตอร์ Oxelle Skin Boosters พร้อมภาพผิวก่อนและหลัง',
    label: 'Skin Booster · Oxelle',
    categorySlug: 'skin-booster',
    categoryLabel: 'SKIN BOOSTER',
    title: 'Oxelle Skin Boosters',
    subtitle: 'Revive & Restore Your Skin.',
  },
  {
    imageKey: 'promo-karisma-collagen',
    alt: 'โปสเตอร์ Velvet Glow IV Drip พร้อมภาพผู้หญิงและถุงสารน้ำ',
    label: 'IV Drip · Velvet Glow',
    categorySlug: 'iv-drip',
    categoryLabel: 'IV DRIP',
    title: 'Velvet Glow IV',
    subtitle: 'Luxurious Glow from Within.',
  },
  {
    src: cloudAssets.promoActiveRefresh,
    imageKey: 'promo-active-refresh',
    alt: 'โปสเตอร์ Active & Refresh IV Drip พร้อมภาพผู้หญิงกลางแจ้ง',
    label: 'IV Drip · Active & Refresh',
    categorySlug: 'iv-drip',
    categoryLabel: 'IV DRIP',
    title: 'Active & Refresh',
    subtitle: 'Energize Your Body & Mind.',
  },
  {
    // ...and promo-velvet-glow holds the KARISMA poster. See the note above. Its Cloudinary
    // asset is gone (404), so the slot ships with no default and waits for an /admin upload.
    imageKey: 'promo-velvet-glow',
    alt: 'โปสเตอร์ Karisma Rh Collagen พร้อมภาพแพ็กเกจผลิตภัณฑ์',
    label: 'Collagen · Karisma',
    categorySlug: 'collagen-booster',
    categoryLabel: 'COLLAGEN BOOSTER',
    title: 'Karisma Rh Collagen',
    subtitle: 'Premium Collagen Treatment.',
  },
];

/**
 * Keep an unpopulated admin slot out of image components. This avoids emitting an empty or
 * stale Cloudinary URL while letting the same card appear as soon as the clinic uploads artwork.
 */
export function resolvePromotionPosters(
  getOverride: (key: SiteImageKey) => string | undefined,
): PromotionPoster[] {
  return promotionPosters.flatMap(({ imageKey, src, ...poster }) => {
    const resolvedSrc = getOverride(imageKey) ?? src;
    return resolvedSrc ? [{ ...poster, src: resolvedSrc }] : [];
  });
}

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
