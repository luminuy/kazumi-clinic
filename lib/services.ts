// Single source of truth for service categories — import instead of hardcoding.
// Prices where present came from clinic promo posters — confirm the standard (non-promo) price
// list with the clinic before treating them as permanent (see CLAUDE.md §0.2). Items without a
// price (e.g. IV Drip programs) render as "สอบถามราคา" until the clinic publishes one.
import { site } from './site';
import { cloudAssets } from './cloud';

export type ServiceItem = {
  name: string;
  detail?: string;
  /** English tagline from the program poster, shown under the name. */
  tagline?: string;
  /** Bullet benefits from the clinic's own program material. */
  benefits?: string[];
  /** Omit when the clinic hasn't published a fixed price — the UI shows "สอบถามราคา" instead. */
  priceFrom?: number;
  unit: string;
};

export type ServiceCategory = {
  slug: string;
  title: string;
  titleEn: string;
  shortDescription: string;
  description: string;
  ogImage: string;
  /** Cloudinary public ID for the category page's PageHero background, if one exists. */
  heroImage?: string;
  items: ServiceItem[];
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: 'filler',
    title: 'ฟิลเลอร์',
    titleEn: 'Filler',
    shortDescription: 'เติมเต็มร่องลึก ปรับรูปหน้าให้เรียวคมอย่างเป็นธรรมชาติ',
    description:
      'บริการฟิลเลอร์กรดไฮยาลูรอนิกจากแบรนด์คุณภาพ ปรับโครงหน้า ร่องแก้ม ร่องน้ำหมาก และริมฝีปาก โดยแพทย์ผู้เชี่ยวชาญของ Kazumi Clinic',
    ogImage: `${site.url}/images/og/filler.jpg`,
    heroImage: cloudAssets.heroFiller,
    items: [
      { name: 'Neura Deep', detail: '1 CC', priceFrom: 3990, unit: 'ครั้ง' },
      { name: 'Neura Deep', detail: '3 CC', priceFrom: 9990, unit: 'ครั้ง' },
      { name: 'Neura Volume', detail: '1 CC', priceFrom: 5990, unit: 'ครั้ง' },
      { name: 'Neura Volume', detail: '3 CC', priceFrom: 11990, unit: 'ครั้ง' },
      { name: 'Filler Lip (Neura Deep)', detail: '1 CC', priceFrom: 4990, unit: 'ครั้ง' },
      {
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
    ogImage: `${site.url}/images/og/botox.jpg`,
    items: [
      { name: 'Botulinum Toxin Neuro', detail: '100 U', priceFrom: 8990, unit: 'ครั้ง' },
    ],
  },
  {
    slug: 'iv-drip',
    title: 'IV Drip วิตามิน',
    titleEn: 'IV Drip / Vitamin',
    shortDescription: 'ให้วิตามินทางหลอดเลือด ฟื้นฟูผิวจากภายในให้กระจ่างใส',
    description:
      'โปรแกรม IV Drip วิตามินสูตรเฉพาะของ Kazumi Clinic ช่วยปรับโทนสีผิว ลดเม็ดสี กระตุ้นคอลลาเจน และชะลอความเสื่อมของผิวจากแสงแดด',
    ogImage: `${site.url}/images/og/iv-drip.jpg`,
    heroImage: cloudAssets.heroIvDrip1,
    items: [
      {
        name: 'Signature Flawless',
        detail: 'IV Drip Vitamin',
        tagline: 'The Masterpiece of Skin Perfection',
        benefits: [
          'ช่วยปรับโทนสีผิวสว่าง',
          'ลดปัญหาเม็ดสี ฝ้า กระ',
          'กระตุ้นคอลลาเจน',
          'ชะลอการเสื่อมของผิวจากแสง UV',
        ],
        unit: 'ครั้ง',
      },
      {
        name: 'Radiant Bright',
        detail: 'IV Drip Vitamin',
        tagline: 'The Shield for Radiant Skin',
        benefits: [
          'ผิวกระจ่างใส ลดรอยดำ-แดง',
          'กระตุ้นคอลลาเจน',
          'ฟื้นฟูผิวเสียจากแสงแดด',
          'ขจัดสารพิษในชั้นผิว',
        ],
        unit: 'ครั้ง',
      },
      {
        name: 'Active & Refresh',
        detail: 'IV Drip Vitamin',
        tagline: 'Refresh and Rebalance Your Body',
        benefits: [
          'มีสารต้านอนุมูลอิสระ',
          'ช่วยให้ร่างกายฟื้นตัว',
          'คืนความสดชื่น ลดอาการอ่อนเพลีย',
          'ช่วยให้ผิวพรรณสดใส',
        ],
        unit: 'ครั้ง',
      },
      {
        name: 'Velvet Glow',
        detail: 'IV Drip Vitamin',
        tagline: 'การดูแลตัวเองจากภายใน',
        benefits: [
          'ฟื้นฟูความสดชื่นเปล่งปลั่ง ไม่โทรม',
          'เติมความชุ่มชื้น ผิวเนียนละเอียด',
          'เสริมเกราะป้องกันผิวจากมลภาวะ',
        ],
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
    ogImage: `${site.url}/images/og/skin-booster.jpg`,
    heroImage: cloudAssets.heroSkinBooster,
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
      { name: 'NCTF 135 HA + Oxelle', detail: 'โปรแกรมคู่', unit: 'ครั้ง' },
    ],
  },
  {
    slug: 'collagen-booster',
    title: 'คอลลาเจนบูสเตอร์',
    titleEn: 'Collagen Booster',
    shortDescription: 'เติมคอลลาเจนสด ลดเลือนริ้วรอย ปรับรูปหน้าให้ดูอ่อนเยาว์',
    description:
      'โปรแกรมเติมคอลลาเจนสด Karisma Rh Collagen ฟื้นฟูโครงสร้างผิว ลดเลือนร่องแก้ม ร่องน้ำหมาก และถุงใต้ตา',
    ogImage: `${site.url}/images/og/collagen-booster.jpg`,
    items: [
      {
        name: 'Karisma Rh Collagen',
        detail: 'Made in Italy',
        tagline: 'Rh Collagen',
        benefits: [
          'คอลลาเจนโครงสร้างถอดแบบจาก Collagen Type 1 ในผิวมนุษย์ 100%',
          'เข้ากับร่างกายได้ดีถึง 99.99% ลดความเสี่ยงในการแพ้',
          'เติมเต็มคอลลาเจน พร้อมกระตุ้นการสร้างคอลลาเจนใหม่',
          'ลดเลือนริ้วรอย ร่องแก้ม ร่องน้ำหมาก และถุงใต้ตา',
        ],
        unit: 'ครั้ง',
      },
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}
