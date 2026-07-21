// Single source of truth for service categories — import instead of hardcoding.
// Prices where present came from clinic promo posters — confirm the standard (non-promo) price
// list with the clinic before treating them as permanent (see CLAUDE.md §0.2). Items without a
// price (e.g. IV Drip programs) render as "สอบถามราคา" until the clinic publishes one.
import { cloudAssets } from './cloud';

export type ServiceItem = {
  /**
   * Stable id for hanging per-item things off this row — currently its /admin image slot, via
   * `itemImageKey` in lib/site-images.ts. That makes it a D1 key by proxy: renaming one silently
   * drops the photo the clinic uploaded for it. Add ids freely; don't rename them.
   */
  id?: string;
  name: string;
  detail?: string;
  /** English tagline from the program poster, shown under the name. */
  tagline?: string;
  /** Bullet benefits from the clinic's own program material. */
  benefits?: string[];
  /** Omit when the clinic hasn't published a fixed price — the UI shows "สอบถามราคา" instead. */
  priceFrom?: number;
  unit: string;
  /** Sub-heading this item sits under, e.g. the IV Drip "Essential Glow Collection". */
  collection?: string;
};

export type ServiceCategory = {
  slug: string;
  title: string;
  titleEn: string;
  shortDescription: string;
  description: string;
  /**
   * Cloudinary public ID for the category page's PageHero background, if one exists.
   * Also the fallback source of the page's OG image when no admin override exists.
   */
  heroImage?: string;
  /** Describes what `heroImage` actually shows — required alongside it (CLAUDE.md §8). */
  heroAlt?: string;
  items: ServiceItem[];
};

// Categories are grouped by intent so the home carousel, sitemap, and schema ItemList all
// read as a coherent journey: face-shaping injectables first (highest demand), then skin
// rejuvenation, then targeted treatments. Reordering here reorders every one of those surfaces —
// slugs are the stable SEO identity and must not change with the order.
//
// อย. caveat (carried from the "Kazumi NavBar Structure Final" spec, 2026-07-16): thread-lift,
// mesotherapy, acne-care, and laser-hifu still list generic programme names, not brand SKUs —
// swap in real SKUs only once the clinic confirms each one's อย. registration (see CLAUDE.md §0.2).
export const serviceCategories: ServiceCategory[] = [
  // ── Group 1 · Face shaping & anti-aging injectables ──────────────────────────
  {
    slug: 'filler',
    title: 'ฟิลเลอร์',
    titleEn: 'Filler',
    shortDescription: 'เติมเต็มร่องลึก ปรับรูปหน้าและริมฝีปากให้ดูเป็นธรรมชาติ ประเมินโดยแพทย์',
    description:
      'บริการฉีดฟิลเลอร์กรดไฮยาลูรอนิกจากแบรนด์คุณภาพ ดูแลร่องแก้ม ร่องน้ำหมาก ใต้ตา และริมฝีปาก แพทย์ของ Kazumi Clinic ประเมินโครงหน้าและออกแบบปริมาณให้เหมาะกับแต่ละบุคคลก่อนรับบริการ',
    heroImage: cloudAssets.heroFiller,
    heroAlt: 'ใบหน้าด้านข้างของผู้หญิง เห็นริมฝีปากและกรอบหน้าชัด ในแสงธรรมชาติโทนเขียว',
    items: [
      {
        id: 'filler-neura-deep-1cc',
        name: 'Neura Deep',
        detail: '1 CC',
        priceFrom: 3990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-neura-deep-3cc',
        name: 'Neura Deep',
        detail: '3 CC',
        priceFrom: 9990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-neura-volume-1cc',
        name: 'Neura Volume',
        detail: '1 CC',
        priceFrom: 5990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-neura-volume-3cc',
        name: 'Neura Volume',
        detail: '3 CC',
        priceFrom: 11990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-lip-neura-deep-1cc',
        name: 'Filler Lip (Neura Deep)',
        detail: '1 CC',
        priceFrom: 4990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-resty-1cc',
        name: 'Filler Resty',
        detail: 'Vital Light & Classic, 1 CC',
        priceFrom: 8990,
        unit: 'ครั้ง',
      },
    ],
  },
  {
    slug: 'botox',
    title: 'โบท็อกซ์',
    titleEn: 'Botulinum Toxin',
    shortDescription: 'ลดริ้วรอย ปรับกรอบหน้า กรามเรียว และลดเหงื่อ ฉีดโดยแพทย์',
    description:
      'ฉีดโบทูลินั่มท็อกซินโดยแพทย์ ลดริ้วรอยหน้าผาก หางตา และร่องระหว่างคิ้ว ปรับกรามให้เรียว ยกหางคิ้ว และลดเหงื่อ กำหนดขนาดยาเฉพาะบุคคลตามการประเมินของแพทย์',
    // No clinic-supplied hero yet; image listings intentionally render the category icon instead
    // of borrowing an unrelated treatment photo.
    items: [{ name: 'Botulinum Toxin Neuro', detail: '100 U', priceFrom: 8990, unit: 'ครั้ง' }],
  },
  {
    slug: 'thread-lift',
    title: 'ร้อยไหมกระชับใบหน้า',
    titleEn: 'Thread Lift',
    shortDescription: 'ยกกระชับกรอบหน้าและแก้มด้วยไหมละลาย PDO ประเมินโดยแพทย์',
    description:
      'โปรแกรมร้อยไหมกระชับใบหน้าด้วยไหมละลาย PDO ช่วยยกกระชับแก้ม กรอบหน้า และใต้คาง แพทย์ประเมินจำนวนเส้นและตำแหน่งตามโครงหน้าของแต่ละบุคคลก่อนทำหัตถการ',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      { name: 'ไหมก้างปลา PDO', detail: '4 เส้น', unit: 'ครั้ง' },
      { name: 'ไหมก้างปลา PDO', detail: '6 เส้น', unit: 'ครั้ง' },
      { name: 'ไหมก้างปลา PDO', detail: '8 เส้น', unit: 'ครั้ง' },
    ],
  },
  {
    slug: 'collagen-booster',
    title: 'คอลลาเจนบูสเตอร์',
    titleEn: 'Collagen Booster',
    shortDescription: 'เติมคอลลาเจนสด ลดเลือนริ้วรอย ฟื้นโครงสร้างผิวให้ดูอ่อนเยาว์',
    description:
      'โปรแกรมเติมคอลลาเจนสด Karisma Rh Collagen ช่วยฟื้นโครงสร้างผิว ลดเลือนร่องแก้ม ร่องน้ำหมาก และถุงใต้ตา พร้อมกระตุ้นการสร้างคอลลาเจนใหม่ ดูแลและประเมินโดยแพทย์',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      {
        name: 'Karisma Rh Collagen',
        detail: 'Made in Italy',
        tagline: 'Rh Collagen',
        // "English title — Thai description" so the collagen page's benefit cards can show the
        // reference's feature title above our approved Thai copy (see skin-booster's splitBenefit).
        benefits: [
          'Human Collagen Type 1 — คอลลาเจนโครงสร้างถอดแบบจาก Collagen Type 1 ในผิวมนุษย์ 100%',
          '99.99% Compatibility — เข้ากับร่างกายได้ดีถึง 99.99% ลดความเสี่ยงในการแพ้',
          'Restoration — เติมเต็มคอลลาเจน พร้อมกระตุ้นการสร้างคอลลาเจนใหม่',
          'Targeted Solution — ลดเลือนริ้วรอย ร่องแก้ม ร่องน้ำหมาก และถุงใต้ตา',
        ],
        unit: 'ครั้ง',
      },
    ],
  },
  // ── Group 2 · Skin rejuvenation & glow ───────────────────────────────────────
  {
    slug: 'skin-booster',
    title: 'สกินบูสเตอร์',
    titleEn: 'Skin Booster',
    shortDescription: 'เติมความชุ่มชื้นเชิงลึก ฟื้นผิวโทรมให้เนียนนุ่มดูมีน้ำมีนวล',
    description:
      'สกินบูสเตอร์เกรดพรีเมียม เติมความชุ่มชื้นและฟื้นฟูเซลล์ผิวจากภายใน กระตุ้นการสร้างคอลลาเจนใหม่ เหมาะกับผิวโทรม ผิวขาดน้ำ และรูขุมขนกว้าง ประเมินความเหมาะสมโดยแพทย์',
    heroImage: cloudAssets.heroSkinBooster,
    heroAlt: 'ใบหน้าผู้หญิงท่ามกลางเงาใบไม้และแสงแดดอ่อน',
    items: [
      {
        name: 'Oxelle Skin Booster',
        detail: 'Product from Italy',
        tagline: 'Skin Boosters',
        benefits: [
          'Revitalizing — กระตุ้นการสร้างคอลลาเจนให้ผิวอิ่มฟูและยืดหยุ่น',
          'Bio-Stimulating — เร่งการสร้างเซลล์ผิวใหม่ เบลอรูขุมขน ปรับผิวให้เรียบเนียน',
          'Antioxidant — ปกป้องผิวจากมลภาวะ และชะลอการเกิดริ้วรอย',
          'Whitening — ลดเลือนฝ้า กระ จุดด่างดำ ปรับสีผิวให้สว่างกระจ่างใสสม่ำเสมอ',
        ],
        unit: 'ครั้ง',
      },
    ],
  },
  {
    slug: 'iv-drip',
    title: 'IV Drip วิตามิน',
    titleEn: 'IV Drip / Vitamin',
    shortDescription: 'ดริปวิตามินทางหลอดเลือด ฟื้นฟูผิวจากภายในให้ดูกระจ่างใส',
    description:
      'โปรแกรม IV Drip วิตามินสูตรเฉพาะของ Kazumi Clinic ช่วยปรับโทนผิวให้ดูกระจ่างใส ลดเลือนเม็ดสี กระตุ้นคอลลาเจน และฟื้นฟูผิวที่อ่อนล้าจากแสงแดดและมลภาวะ ดูแลโดยแพทย์',
    heroImage: cloudAssets.heroIvDrip1,
    heroAlt: 'ใบหน้าผู้หญิงถ่ายตรงหน้าในแสงนุ่ม ผิวเรียบเนียนกระจ่างใส',
    // The seven programs and prices below replace the clinic's older IV menu (Signature
    // Flawless / Radiant Bright / Active & Refresh / Velvet Glow). Per the NavBar spec this
    // collection is "verified ครบ 100%" from Kazumi's own poster, and unlike the filler and
    // botox figures these are catalogue prices, not May promo prices — so they're safe to show.
    items: [
      {
        collection: 'Essential Glow Collection',
        name: 'Aura Bright Express',
        detail: 'IV Drip Vitamin',
        priceFrom: 499,
        unit: 'ครั้ง',
      },
      {
        collection: 'Essential Glow Collection',
        name: 'Snow White Intensive',
        detail: 'IV Drip Vitamin',
        priceFrom: 699,
        unit: 'ครั้ง',
      },
      {
        collection: 'Essential Glow Collection',
        name: 'Detox Restore',
        detail: 'IV Drip Vitamin',
        priceFrom: 690,
        unit: 'ครั้ง',
      },
      {
        collection: 'Recovery & Energy Collection',
        name: 'Energy Reset',
        detail: 'IV Drip Vitamin',
        priceFrom: 690,
        unit: 'ครั้ง',
      },
      {
        collection: 'Recovery & Energy Collection',
        name: 'ALA Metabolic Glow',
        detail: 'IV Drip Vitamin',
        priceFrom: 990,
        unit: 'ครั้ง',
      },
      {
        collection: 'Signature Collection',
        name: 'Super Max Signature',
        detail: 'IV Drip Vitamin',
        priceFrom: 1290,
        unit: 'ครั้ง',
      },
      {
        collection: 'Signature Collection',
        name: 'Premium Bespoke',
        detail: 'โปรแกรมเฉพาะบุคคล',
        priceFrom: 1990,
        unit: 'ครั้ง',
      },
    ],
  },
  {
    slug: 'mesotherapy',
    title: 'เมโสบำรุงผิวและเมโสแฟต',
    titleEn: 'Mesotherapy',
    shortDescription: 'เมโสบำรุงผิวและเมโสสลายไขมันเฉพาะจุด เลือกสูตรโดยแพทย์',
    description:
      'โปรแกรมเมโสเธอราปีของ Kazumi Clinic ทั้งเมโสบำรุงผิวให้ดูกระจ่างใสและเมโสสลายไขมันเฉพาะจุด เช่น แก้มและเหนียง แพทย์เลือกสูตรและประเมินความเหมาะสมก่อนรับบริการ',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      { name: 'NCTF 135 HA + Oxelle', detail: 'โปรแกรมคู่', unit: 'ครั้ง' },
      {
        name: 'White Complex',
        detail: 'Nexus Pharma',
        benefits: ['ฟื้นฟูผิว ลดริ้วรอย ฝ้า กระ ด้วยกลูต้าไธโอนบริสุทธิ์'],
        unit: 'ครั้ง',
      },
      { name: 'เมโสบำรุงผิว', detail: 'เลือกสูตรตามสภาพผิว', unit: 'ครั้ง' },
      { name: 'เมโสสลายไขมันเฉพาะจุด', detail: 'แก้ม / เหนียง', unit: 'ครั้ง' },
    ],
  },
  // ── Group 3 · Skin-concern treatments & lifting devices ──────────────────────
  {
    slug: 'acne-care',
    title: 'ดูแลสิวและหลุมสิว',
    titleEn: 'Acne & Acne Scar Care',
    shortDescription: 'รักษาสิวและฟื้นฟูหลุมสิว วางแผนการดูแลเฉพาะบุคคลโดยแพทย์',
    description:
      'โปรแกรมดูแลสิวและหลุมสิวของ Kazumi Clinic แบ่งระดับตามความรุนแรงของปัญหา ตั้งแต่สิวอักเสบไปจนถึงรอยแผลเป็นหลุมสิว แพทย์ประเมินและออกแบบแผนการรักษาเฉพาะบุคคล',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      { name: 'โปรแกรมดูแลสิว', detail: 'แบ่งระดับตามความรุนแรง', unit: 'ครั้ง' },
      { name: 'โปรแกรมฟื้นฟูหลุมสิว', detail: 'ประเมินโดยแพทย์', unit: 'ครั้ง' },
    ],
  },
  {
    slug: 'laser-hifu',
    title: 'เลเซอร์และยกกระชับ',
    titleEn: 'Laser & HIFU Lifting',
    shortDescription: 'ยกกระชับผิวหน้าด้วยเลเซอร์และ HIFU ปรับพลังงานโดยแพทย์',
    description:
      'โปรแกรมยกกระชับผิวหน้าด้วยเครื่องมือแพทย์ HIFU และเลเซอร์ ช่วยกระชับผิวที่หย่อนคล้อยและดูแลผิวให้เรียบเนียน แพทย์ประเมินระดับพลังงานและตำแหน่งที่เหมาะสมกับแต่ละบุคคล',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [{ name: 'HIFU ยกกระชับผิวหน้า', detail: 'ประเมินโดยแพทย์', unit: 'ครั้ง' }],
  },
];

export function getServiceBySlug(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}
