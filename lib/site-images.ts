import { cloudAssets } from './cloud';

/**
 * Every image the site renders, in one keyed list — the thing /admin edits.
 *
 * `defaultPublicId` is the Cloudinary public ID shipped in the code. Once an override exists in
 * D1 for a key, that wins; until then the site renders exactly what it renders today, which is
 * why introducing this layer changes nothing visually.
 *
 * Keys are a stable contract: they're the primary key in D1, so renaming one silently drops the
 * clinic's uploaded image back to the default. Add keys freely; don't rename them.
 */
export type SiteImageKey =
  | 'brand-mark'
  | 'brand-logo'
  | 'hero-home'
  | 'hero-filler'
  | 'hero-iv-drip-1'
  | 'hero-iv-drip-2'
  | 'hero-iv-drip-3'
  | 'hero-skin-booster'
  | 'doctor-pratch'
  | 'og-about'
  | 'promo-active-refresh'
  | 'promo-filler-neura'
  | 'promo-karisma-collagen'
  | 'promo-oxelle-skin-booster'
  | 'promo-radiant-bright'
  | 'promo-signature-flawless'
  | 'promo-velvet-glow';

export type SiteImageSpec = {
  key: SiteImageKey;
  /** Shown in /admin so the clinic knows which picture they're replacing. */
  label: string;
  where: string;
  defaultPublicId: string;
  /** Guidance for the uploader — these are the shapes each slot is actually cropped to. */
  ratioHint: string;
};

export const siteImages: SiteImageSpec[] = [
  {
    key: 'brand-mark',
    label: 'โลโก้ (ดอกไม้)',
    where: 'หัวเว็บและท้ายเว็บทุกหน้า',
    defaultPublicId: cloudAssets.brandMark,
    ratioHint: 'จัตุรัส — เฉพาะดอกไม้ ไม่มีตัวหนังสือ',
  },
  {
    key: 'brand-logo',
    label: 'โลโก้เต็ม (ดอกไม้ + ชื่อ)',
    where: 'โลโก้ใน JSON-LD ที่ Google ใช้',
    defaultPublicId: cloudAssets.brandLogo,
    ratioHint: 'จัตุรัส — ดอกไม้อยู่บน ตัวหนังสือ KAZUMI CLINIC อยู่ล่าง',
  },
  {
    key: 'hero-home',
    label: 'รูปใหญ่หน้าแรก',
    where: 'หน้าแรก · รูป OG ตอนแชร์ลิงก์',
    defaultPublicId: cloudAssets.heroHome,
    ratioHint: 'แนวนอน 16:9 — หน้าแรกครอปเอาเฉพาะฝั่งซ้าย ให้คนอยู่ค่อนไปทางซ้าย',
  },
  {
    key: 'hero-filler',
    label: 'รูปหัวหน้าฟิลเลอร์',
    where: '/filler · การ์ดฟิลเลอร์บนหน้าแรกและ /services',
    defaultPublicId: cloudAssets.heroFiller,
    ratioHint: 'แนวตั้ง',
  },
  {
    key: 'hero-iv-drip-1',
    label: 'รูปหัวหน้า IV Drip',
    where: '/iv-drip · การ์ด IV Drip บนหน้าแรก · OG หน้ารีวิว',
    defaultPublicId: cloudAssets.heroIvDrip1,
    ratioHint: 'แนวตั้ง',
  },
  {
    key: 'hero-iv-drip-2',
    label: 'รูปหัวข้อปรัชญา',
    where: 'หน้าแรกส่วนปรัชญา · รูปใหญ่ /services · OG หน้า services/contact',
    defaultPublicId: cloudAssets.heroIvDrip2,
    ratioHint: 'แนวตั้ง 3:4',
  },
  {
    key: 'hero-iv-drip-3',
    label: 'รูปบริการโบท็อกซ์',
    where: '/botox · การ์ดโบท็อกซ์บน /services และหน้าแรก',
    defaultPublicId: cloudAssets.heroIvDrip3,
    ratioHint: 'แนวตั้ง',
  },
  {
    key: 'hero-skin-booster',
    label: 'รูปหัวหน้าสกินบูสเตอร์',
    where: '/skin-booster · การ์ดบนหน้าแรกและ /services · OG หน้าโปรโมชั่น',
    defaultPublicId: cloudAssets.heroSkinBooster,
    ratioHint: 'แนวนอน',
  },
  {
    key: 'doctor-pratch',
    label: 'รูปคุณหมอ',
    where: 'หน้าแรก · /about · รูปใน Person JSON-LD',
    defaultPublicId: cloudAssets.doctorPratch,
    ratioHint: 'แนวตั้ง 4:5 — เห็นหน้าชัด อยู่กลางเฟรม',
  },
  {
    key: 'og-about',
    label: 'รูป OG หน้าเกี่ยวกับเรา',
    where: 'ตอนแชร์ลิงก์ /about',
    defaultPublicId: cloudAssets.ogAbout,
    ratioHint: '1200×630 เป๊ะ (สเปก Facebook/LINE)',
  },
  {
    key: 'promo-active-refresh',
    label: 'โปสเตอร์โปรฯ Active & Refresh',
    where: '/promotions · โปสเตอร์บนหน้าแรก',
    defaultPublicId: cloudAssets.promoActiveRefresh,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-filler-neura',
    label: 'โปสเตอร์โปรฯ Filler Neura',
    where: '/promotions · โปสเตอร์แนะนำบนหน้าแรกและ /services',
    defaultPublicId: cloudAssets.promoFillerNeura,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-karisma-collagen',
    label: 'โปสเตอร์โปรฯ Karisma Collagen',
    where: '/promotions · โปสเตอร์บนหน้าแรก',
    defaultPublicId: cloudAssets.promoKarismaCollagen,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-oxelle-skin-booster',
    label: 'โปสเตอร์โปรฯ Oxelle Skin Booster',
    where: '/promotions · โปสเตอร์บนหน้าแรก',
    defaultPublicId: cloudAssets.promoOxelleSkinBooster,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-radiant-bright',
    label: 'โปสเตอร์โปรฯ Radiant Bright',
    where: '/promotions · โปสเตอร์บนหน้าแรก',
    defaultPublicId: cloudAssets.promoRadiantBright,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-signature-flawless',
    label: 'โปสเตอร์โปรฯ Signature Flawless',
    where: '/promotions · โปสเตอร์บนหน้าแรก',
    defaultPublicId: cloudAssets.promoSignatureFlawless,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-velvet-glow',
    label: 'โปสเตอร์โปรฯ Velvet Glow',
    where: '/promotions · โปสเตอร์บนหน้าแรก',
    defaultPublicId: cloudAssets.promoVelvetGlow,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
];

/**
 * Nothing lives under public/ any more — every image the site renders is a Cloudinary asset,
 * so /admin can replace all of them. Kept as an explicit empty list rather than deleted: if a
 * future change reintroduces a baked-in image, put it here so /admin keeps telling the truth
 * about what it cannot edit.
 */
export const bakedInImages: { path: string; label: string; where: string }[] = [];

/** Every valid slot key — the allowlist the admin API validates uploads against. */
export const siteImageKeys = siteImages.map((image) => image.key);

/**
 * Which image slot backs each service category's hero. Kept here rather than as a field on
 * ServiceCategory so lib/services.ts stays pure data with no dependency on the override layer.
 */
export const categoryImageKey: Record<string, SiteImageKey> = {
  filler: 'hero-filler',
  botox: 'hero-iv-drip-3',
  'iv-drip': 'hero-iv-drip-1',
  'skin-booster': 'hero-skin-booster',
};

/** Which slot backs each promotion poster, by its default public ID. */
export const posterKeyByDefaultId = new Map(
  siteImages.filter((i) => i.key.startsWith('promo-')).map((i) => [i.defaultPublicId, i.key]),
);
