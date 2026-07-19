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
  | 'hero-botox'
  | 'hero-iv-drip-1'
  | 'hero-iv-drip-2'
  | 'hero-iv-drip-3'
  | 'hero-skin-booster'
  | 'hero-collagen-booster'
  | 'hero-thread-lift'
  | 'hero-mesotherapy'
  | 'hero-acne-care'
  | 'hero-laser-hifu'
  | 'thread-lift-product'
  | 'mesotherapy-treatment'
  | 'iv-drip-booking'
  | 'laser-hifu-editorial'
  | 'laser-hifu-interior'
  | 'acne-care-interstitial'
  | 'skin-booster-discipline'
  | 'collagen-booster-editorial'
  | 'item-filler-neura-deep-1cc'
  | 'item-filler-neura-deep-3cc'
  | 'item-filler-neura-volume-1cc'
  | 'item-filler-neura-volume-3cc'
  | 'item-filler-lip-neura-deep-1cc'
  | 'item-filler-resty-1cc'
  | 'doctor-pratch'
  | 'about-hero'
  | 'about-interior'
  | 'og-about'
  | 'home-visit'
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
  /**
   * The Cloudinary public ID shipped with the code, when there is one.
   *
   * Optional because six service categories have no photo yet. A slot with no default still
   * belongs here: without one, /admin has no card for that category and the clinic *cannot*
   * upload a photo at all — which is why those pages showed an empty panel with no way to fix
   * it. The page falls back to its tonal icon panel until an upload lands in D1.
   */
  defaultPublicId?: string;
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
    // Cropped landscape on /filler and /services but portrait in the home atlas card, so no one
    // orientation is the right advice — what matters is that the subject survives both crops.
    ratioHint: 'ถูกครอปทั้งแนวนอน (/filler, /services) และแนวตั้ง (หน้าแรก) — ให้คนอยู่กลางเฟรม',
  },
  {
    key: 'hero-botox',
    label: 'รูปหัวหน้าโบท็อกซ์',
    where: '/botox · การ์ดโบท็อกซ์บน /services',
    ratioHint: 'แนวตั้ง 1:1.618 — ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  {
    key: 'hero-iv-drip-1',
    label: 'รูปหัวหน้า IV Drip',
    where: '/iv-drip · การ์ด IV Drip บนหน้าแรกและ /services · OG หน้ารีวิว',
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
    label: 'รูปสำรอง IV Drip',
    where: 'ยังไม่ได้ใช้ที่ไหน',
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
  // ── หมวดที่ยังไม่มีรูปจริง ─────────────────────────────────────────────
  // ไม่มี defaultPublicId: หน้าจะขึ้นกล่องไอคอนไปก่อนจนกว่าคลินิกจะอัปรูป
  // การมี slot คือสิ่งเดียวที่ทำให้ /admin อัปรูปให้หมวดพวกนี้ได้
  {
    key: 'hero-collagen-booster',
    label: 'รูปหัวหน้าคอลลาเจนบูสเตอร์',
    where: '/collagen-booster · การ์ดบน /services',
    ratioHint: 'แนวตั้ง 1:1.618 — ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  {
    key: 'hero-thread-lift',
    label: 'รูปหัวหน้าร้อยไหม',
    where: '/thread-lift · การ์ดบน /services',
    ratioHint: 'แนวตั้ง 1:1.618 — ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  {
    key: 'hero-mesotherapy',
    label: 'รูปหัวหน้าเมโสเธอราปี',
    where: '/mesotherapy · การ์ดบน /services',
    ratioHint: 'แนวตั้ง 1:1.618 — ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  {
    key: 'hero-acne-care',
    label: 'รูปหัวหน้าดูแลสิว',
    where: '/acne-care · การ์ดบน /services',
    ratioHint: 'แนวตั้ง 1:1.618 — ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  {
    key: 'hero-laser-hifu',
    label: 'รูปหัวหน้าเลเซอร์และ HIFU',
    where: '/laser-hifu · การ์ดบน /services',
    ratioHint: 'แนวตั้ง 1:1.618 — ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  // ทั้ง 3 รายการของร้อยไหมเป็นผลิตภัณฑ์เดียวกัน ต่างแค่จำนวนเส้น → ใช้รูปสินค้าใบเดียวร่วมกัน
  // (คนละใบกับ hero-thread-lift ที่เป็นรูปหัวหน้า)
  {
    key: 'thread-lift-product',
    label: 'รูปสินค้าไหม PDO',
    where: '/thread-lift — รูปในส่วน Treatment Menu',
    ratioHint: 'แนวตั้ง 4:5 — รูปกล่อง/ตัวไหม · ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  // รูปที่สองของหน้าเมโส (คนละใบกับ hero-mesotherapy ที่เป็นรูปหัวหน้า)
  {
    key: 'mesotherapy-treatment',
    label: 'รูปบรรยากาศการรักษา (เมโส)',
    where: '/mesotherapy — รูปในส่วน Ready for your transformation',
    ratioHint: 'จัตุรัส · ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  // รูปที่สองของหน้า IV Drip (คนละใบกับ hero-iv-drip-1 ที่เป็นรูปหัวหน้า)
  {
    key: 'iv-drip-booking',
    label: 'รูปบรรยากาศการรักษา (IV Drip)',
    where: '/iv-drip — รูปในส่วน Begin Your Journey',
    ratioHint: 'แนวตั้ง · ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  // รูปบนหน้า /laser-hifu (คนละใบกับ hero-laser-hifu ที่เป็นรูปหัวหน้า)
  {
    key: 'laser-hifu-editorial',
    label: 'รูปประกอบเลเซอร์และยกกระชับ',
    where: '/laser-hifu — รูปในส่วน Recommended Session',
    ratioHint: 'แนวตั้ง · ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  {
    key: 'laser-hifu-interior',
    label: 'รูปบรรยากาศคลินิก (เลเซอร์)',
    where: '/laser-hifu — รูปในส่วน Ready for your transformation',
    ratioHint: 'แนวนอน · ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  // รูปบนหน้า /acne-care (คนละใบกับ hero-acne-care ที่เป็นรูปหัวหน้า)
  {
    key: 'acne-care-interstitial',
    label: 'รูปประกอบดูแลสิว',
    where: '/acne-care — รูปช่วงคั่นก่อนส่วน CTA',
    ratioHint: 'จัตุรัส · ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  // รูปพื้นหลังแถบ The Kazumi Discipline บนหน้า /skin-booster
  // (คนละใบกับ hero-skin-booster ที่เป็นรูปหัวหน้า)
  {
    key: 'skin-booster-discipline',
    label: 'รูปพื้นหลังแถบ Discipline (สกินบูสเตอร์)',
    where: '/skin-booster — พื้นหลังแถบ The Kazumi Discipline',
    ratioHint: 'แนวนอน · ยังไม่มีรูป แถบจะเป็นสีพื้นไปก่อน',
  },
  // รูปประกอบสี่เหลี่ยมจัตุรัสในส่วนคำโปรยบนหน้า /collagen-booster
  // (คนละใบกับ hero-collagen-booster ที่เป็นรูปหัวหน้า)
  {
    key: 'collagen-booster-editorial',
    label: 'รูปประกอบส่วนคำโปรย (คอลลาเจนบูสเตอร์)',
    where: '/collagen-booster — รูปจัตุรัสข้างคำโปรย',
    ratioHint: 'จัตุรัส · ยังไม่มีรูป จะขึ้นกล่องไอคอนไปก่อน',
  },
  // ── รูปผลิตภัณฑ์รายตัวบนหน้า /filler ────────────────────────────────
  // ยังไม่มีรูปสักใบ — การ์ดจะขึ้นกล่องไอคอนไปก่อนจนกว่าคลินิกจะอัป
  {
    key: 'item-filler-neura-deep-1cc',
    label: 'รูปสินค้า Neura Deep 1 CC',
    where: '/filler — การ์ดรายการที่ 1',
    ratioHint: 'จัตุรัส — รูปกล่อง/ขวดผลิตภัณฑ์',
  },
  {
    key: 'item-filler-neura-deep-3cc',
    label: 'รูปสินค้า Neura Deep 3 CC',
    where: '/filler — การ์ดรายการที่ 2',
    ratioHint: 'จัตุรัส — รูปกล่อง/ขวดผลิตภัณฑ์',
  },
  {
    key: 'item-filler-neura-volume-1cc',
    label: 'รูปสินค้า Neura Volume 1 CC',
    where: '/filler — การ์ดรายการที่ 3',
    ratioHint: 'จัตุรัส — รูปกล่อง/ขวดผลิตภัณฑ์',
  },
  {
    key: 'item-filler-neura-volume-3cc',
    label: 'รูปสินค้า Neura Volume 3 CC',
    where: '/filler — การ์ดรายการที่ 4',
    ratioHint: 'จัตุรัส — รูปกล่อง/ขวดผลิตภัณฑ์',
  },
  {
    key: 'item-filler-lip-neura-deep-1cc',
    label: 'รูปสินค้า Filler Lip (Neura Deep) 1 CC',
    where: '/filler — การ์ดรายการที่ 5',
    ratioHint: 'จัตุรัส — รูปกล่อง/ขวดผลิตภัณฑ์',
  },
  {
    key: 'item-filler-resty-1cc',
    label: 'รูปสินค้า Filler Resty 1 CC',
    where: '/filler — การ์ดรายการที่ 6',
    ratioHint: 'จัตุรัส — รูปกล่อง/ขวดผลิตภัณฑ์',
  },
  {
    key: 'doctor-pratch',
    label: 'รูปคุณหมอ',
    where: 'หน้าแรก · /about · /services · รูปใน Person JSON-LD',
    defaultPublicId: cloudAssets.doctorPratch,
    ratioHint: 'แนวตั้ง 4:5 — เห็นหน้าชัด อยู่กลางเฟรม',
  },
  // รูปบนหน้า /about เอง (คนละใบกับ og-about ที่เป็นรูปตอนแชร์ลิงก์)
  {
    key: 'about-hero',
    label: 'รูปหัวหน้าเกี่ยวกับเรา',
    where: '/about — รูปใหญ่ในส่วนหัว',
    ratioHint: 'แนวตั้ง 4:5 · ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  {
    key: 'about-interior',
    label: 'รูปบรรยากาศคลินิก (เกี่ยวกับเรา)',
    where: '/about — รูปเต็มความกว้างช่วงกลางหน้า',
    ratioHint: 'แนวนอน · ยังไม่มีรูป อัปแล้วจะขึ้นแทนกล่องไอคอน',
  },
  {
    key: 'og-about',
    label: 'รูป OG หน้าเกี่ยวกับเรา',
    where: 'ตอนแชร์ลิงก์ /about',
    defaultPublicId: cloudAssets.ogAbout,
    ratioHint: '1200×630 เป๊ะ (สเปก Facebook/LINE)',
  },
  // รูปหน้าคลินิกในส่วน "มาเยี่ยมเรา" บนหน้าแรก (แทนแผนที่ฝัง Google Maps เดิม)
  {
    key: 'home-visit',
    label: 'รูปคลินิกส่วนมาเยี่ยมเรา (หน้าแรก)',
    where: 'หน้าแรก — ส่วน “มาเยี่ยมเรา” รูปด้านขวา',
    ratioHint: 'แนวนอน/จัตุรัส · ยังไม่มีรูป จะขึ้นกล่องไอคอนไปก่อน',
  },
  {
    key: 'promo-active-refresh',
    label: 'โปสเตอร์โปรฯ Active & Refresh',
    where: '/promotions · โปสเตอร์บนหน้าแรกและ /services',
    defaultPublicId: cloudAssets.promoActiveRefresh,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-filler-neura',
    label: 'โปสเตอร์โปรฯ Filler Neura',
    where: '/promotions · โปสเตอร์บนหน้าแรกและ /services',
    defaultPublicId: cloudAssets.promoFillerNeura,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-karisma-collagen',
    label: 'โปสเตอร์โปรฯ Karisma Collagen',
    where: '/promotions · โปสเตอร์บนหน้าแรกและ /services',
    defaultPublicId: cloudAssets.promoKarismaCollagen,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-oxelle-skin-booster',
    label: 'โปสเตอร์โปรฯ Oxelle Skin Booster',
    where: '/promotions · โปสเตอร์บนหน้าแรกและ /services',
    defaultPublicId: cloudAssets.promoOxelleSkinBooster,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-radiant-bright',
    label: 'โปสเตอร์โปรฯ Radiant Bright',
    where: '/promotions · โปสเตอร์บนหน้าแรกและ /services',
    defaultPublicId: cloudAssets.promoRadiantBright,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-signature-flawless',
    label: 'โปสเตอร์โปรฯ Signature Flawless',
    where: '/promotions · โปสเตอร์บนหน้าแรกและ /services',
    defaultPublicId: cloudAssets.promoSignatureFlawless,
    ratioHint: 'แนวตั้ง 4:5 (โปสเตอร์)',
  },
  {
    key: 'promo-velvet-glow',
    label: 'โปสเตอร์โปรฯ Velvet Glow',
    where: '/promotions · โปสเตอร์บนหน้าแรกและ /services',
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
/**
 * Which image slot backs each individual product card, keyed by `ServiceItem.id`. Same reasoning
 * as `categoryImageKey`: the mapping lives here so lib/services.ts stays pure data.
 */
export const itemImageKey: Record<string, SiteImageKey> = {
  'filler-neura-deep-1cc': 'item-filler-neura-deep-1cc',
  'filler-neura-deep-3cc': 'item-filler-neura-deep-3cc',
  'filler-neura-volume-1cc': 'item-filler-neura-volume-1cc',
  'filler-neura-volume-3cc': 'item-filler-neura-volume-3cc',
  'filler-lip-neura-deep-1cc': 'item-filler-lip-neura-deep-1cc',
  'filler-resty-1cc': 'item-filler-resty-1cc',
};

export const categoryImageKey: Record<string, SiteImageKey> = {
  filler: 'hero-filler',
  botox: 'hero-botox',
  'iv-drip': 'hero-iv-drip-1',
  'skin-booster': 'hero-skin-booster',
  'collagen-booster': 'hero-collagen-booster',
  'thread-lift': 'hero-thread-lift',
  mesotherapy: 'hero-mesotherapy',
  'acne-care': 'hero-acne-care',
  'laser-hifu': 'hero-laser-hifu',
};

/** Which slot backs each promotion poster, by its default public ID. */
export const posterKeyByDefaultId = new Map(
  siteImages.filter((i) => i.key.startsWith('promo-')).map((i) => [i.defaultPublicId, i.key]),
);
