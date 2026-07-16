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
  | 'logo'
  | 'hero-home'
  | 'hero-filler'
  | 'hero-iv-drip-1'
  | 'hero-iv-drip-2'
  | 'hero-iv-drip-3'
  | 'hero-skin-booster';

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
    key: 'logo',
    label: 'โลโก้คลินิก',
    where: 'หัวเว็บทุกหน้า · favicon · โลโก้ใน JSON-LD',
    defaultPublicId: cloudAssets.logo,
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
    where: '/filler · การ์ดฟิลเลอร์บนหน้าแรก',
    defaultPublicId: cloudAssets.heroFiller,
    ratioHint: 'แนวตั้ง',
  },
  {
    key: 'hero-iv-drip-1',
    label: 'รูปหัวหน้า IV Drip',
    where: '/iv-drip · การ์ด IV Drip บนหน้าแรก',
    defaultPublicId: cloudAssets.heroIvDrip1,
    ratioHint: 'แนวตั้ง',
  },
  {
    key: 'hero-iv-drip-2',
    label: 'รูปหัวข้อปรัชญา',
    where: 'หน้าแรก ส่วนปรัชญา',
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
    where: '/skin-booster · การ์ดสกินบูสเตอร์บนหน้าแรก',
    defaultPublicId: cloudAssets.heroSkinBooster,
    ratioHint: 'แนวนอน',
  },
];

/**
 * Images that live in `public/` and are therefore baked into the build — the clinic CANNOT swap
 * these from /admin, because changing them requires a rebuild. Listed so /admin can say so out
 * loud instead of pretending every image is editable. Moving them to Cloudinary is what makes
 * them editable; until then this is an honest gap, not a hidden one.
 */
export const bakedInImages = [
  {
    path: '/images/doctor/dr-pratch-achawanitkun.jpg',
    label: 'รูปคุณหมอ',
    where: 'หน้าแรก · /about',
  },
  { path: '/images/og/about.jpg', label: 'รูป OG หน้าเกี่ยวกับเรา', where: 'ตอนแชร์ลิงก์ /about' },
  { path: '/images/promotions/filler-neura.jpg', label: 'โปรฯ Filler Neura', where: '/promotions' },
  {
    path: '/images/promotions/karisma-collagen.jpg',
    label: 'โปรฯ Karisma Collagen',
    where: '/promotions',
  },
  {
    path: '/images/promotions/oxelle-skin-booster.jpg',
    label: 'โปรฯ Oxelle',
    where: '/promotions',
  },
  {
    path: '/images/promotions/radiant-bright.jpg',
    label: 'โปรฯ Radiant Bright',
    where: '/promotions',
  },
  {
    path: '/images/promotions/signature-flawless.jpg',
    label: 'โปรฯ Signature Flawless',
    where: '/promotions',
  },
  {
    path: '/images/promotions/active-refresh.jpg',
    label: 'โปรฯ Active & Refresh',
    where: '/promotions',
  },
  { path: '/images/promotions/velvet-glow.jpg', label: 'โปรฯ Velvet Glow', where: '/promotions' },
];
