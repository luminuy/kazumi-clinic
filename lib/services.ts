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

export const serviceCategories: ServiceCategory[] = [
  {
    slug: 'filler',
    title: 'ฟิลเลอร์',
    titleEn: 'Filler',
    shortDescription: 'เติมเต็มร่องลึก ปรับรูปหน้าให้เรียวคมอย่างเป็นธรรมชาติ',
    description:
      'บริการฟิลเลอร์กรดไฮยาลูรอนิกจากแบรนด์คุณภาพ สำหรับโครงหน้า ร่องแก้ม ร่องน้ำหมาก และริมฝีปาก โดยแพทย์ของ Kazumi Clinic เป็นผู้ประเมินก่อนรับบริการ',
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
    shortDescription: 'ลดริ้วรอย ปรับรูปหน้า กรามเรียว ด้วยโบท็อกซ์คุณภาพสูง',
    description:
      'ฉีดโบทูลินั่มท็อกซินโดยแพทย์ ลดริ้วรอยบนใบหน้า ปรับกราม ลดเหงื่อ และกำหนดขนาดยาเฉพาะบุคคล',
    // No clinic-supplied hero yet; image listings intentionally render the category icon instead
    // of borrowing an unrelated treatment photo.
    items: [{ name: 'Botulinum Toxin Neuro', detail: '100 U', priceFrom: 8990, unit: 'ครั้ง' }],
  },
  {
    slug: 'iv-drip',
    title: 'IV Drip วิตามิน',
    titleEn: 'IV Drip / Vitamin',
    shortDescription: 'ให้วิตามินทางหลอดเลือด ฟื้นฟูผิวจากภายในให้กระจ่างใส',
    description:
      'โปรแกรม IV Drip วิตามินสูตรเฉพาะของ Kazumi Clinic ช่วยปรับโทนสีผิว ลดเม็ดสี กระตุ้นคอลลาเจน และชะลอความเสื่อมของผิวจากแสงแดด',
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
    slug: 'skin-booster',
    title: 'สกินบูสเตอร์',
    titleEn: 'Skin Booster',
    shortDescription: 'ฟื้นฟูผิวเชิงลึก เพิ่มความชุ่มชื้นและความยืดหยุ่น',
    description:
      'สกินบูสเตอร์เกรดพรีเมียม ฟื้นฟูเซลล์ผิวจากภายใน กระตุ้นการสร้างคอลลาเจนใหม่ เหมาะกับผิวโทรม ผิวขาดน้ำ',
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
    slug: 'collagen-booster',
    title: 'คอลลาเจนบูสเตอร์',
    titleEn: 'Collagen Booster',
    shortDescription: 'เติมคอลลาเจนสด ลดเลือนริ้วรอย ปรับรูปหน้าให้ดูอ่อนเยาว์',
    description:
      'โปรแกรมเติมคอลลาเจนสด Karisma Rh Collagen ฟื้นฟูโครงสร้างผิว ลดเลือนร่องแก้ม ร่องน้ำหมาก และถุงใต้ตา',
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
  // ── Categories below come from the "Kazumi NavBar Structure Final" spec (2026-07-16). ──
  // That spec's own dev checklist says: "เช็คทะเบียน อย. ของแบรนด์ยา/ฟิลเลอร์ทุกตัวก่อนขึ้นชื่อ
  // เฉพาะเจาะจงบนเว็บสาธารณะ — ถ้ายังไม่ชัวร์ ใช้ชื่อหมวดบริการแทนชั่วคราว". Every SKU it marks
  // 🔄 ("ref. เดิม — รอ confirm") is therefore listed here under a generic programme name, not a
  // brand name. Swap in the real SKUs once the clinic confirms each one's อย. registration.
  {
    slug: 'thread-lift',
    title: 'ร้อยไหมกระชับใบหน้า',
    titleEn: 'Thread Lift',
    shortDescription: 'ยกกระชับผิวหน้าด้วยไหมละลาย PDO โดยแพทย์',
    description:
      'โปรแกรมร้อยไหมกระชับใบหน้าด้วยไหมละลาย PDO ประเมินจำนวนเส้นและตำแหน่งโดยแพทย์ตามโครงหน้าของแต่ละบุคคล',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      { name: 'ไหมก้างปลา PDO', detail: '4 เส้น', unit: 'ครั้ง' },
      { name: 'ไหมก้างปลา PDO', detail: '6 เส้น', unit: 'ครั้ง' },
      { name: 'ไหมก้างปลา PDO', detail: '8 เส้น', unit: 'ครั้ง' },
    ],
  },
  {
    slug: 'mesotherapy',
    title: 'เมโสบำรุงผิวและเมโสแฟต',
    titleEn: 'Mesotherapy',
    shortDescription: 'เมโสบำรุงผิวและเมโสสลายไขมันเฉพาะจุด โดยแพทย์',
    description:
      'โปรแกรมเมโสเธอราปีของ Kazumi Clinic ทั้งเมโสบำรุงผิวและเมโสสลายไขมันเฉพาะจุด เลือกสูตรและประเมินความเหมาะสมโดยแพทย์',
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
  {
    slug: 'acne-care',
    title: 'ดูแลสิวและหลุมสิว',
    titleEn: 'Acne & Acne Scar Care',
    shortDescription: 'โปรแกรมรักษาสิวและฟื้นฟูหลุมสิว ประเมินโดยแพทย์',
    description:
      'โปรแกรมดูแลสิวและหลุมสิวของ Kazumi Clinic แบ่งระดับตามความรุนแรงของปัญหา ประเมินและออกแบบแผนการรักษาโดยแพทย์',
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
    shortDescription: 'ยกกระชับผิวด้วยเครื่องมือแพทย์ HIFU',
    description:
      'โปรแกรมยกกระชับผิวหน้าด้วยเครื่องมือแพทย์ HIFU และเลเซอร์ ประเมินระดับพลังงานและตำแหน่งที่เหมาะสมโดยแพทย์',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [{ name: 'HIFU ยกกระชับผิวหน้า', detail: 'ประเมินโดยแพทย์', unit: 'ครั้ง' }],
  },
];

export function getServiceBySlug(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}
