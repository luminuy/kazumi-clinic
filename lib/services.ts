// Single source of truth for service categories — import instead of hardcoding.
// Prices below are pulled from a "May Exclusive Offer" promo (valid until 2026-05-31) — confirm
// standard price list with the clinic before treating these as permanent.
import { site } from './site';

export type ServiceItem = {
  name: string;
  detail?: string;
  priceFrom: number;
  unit: string;
};

export type ServiceCategory = {
  slug: string;
  title: string;
  titleEn: string;
  shortDescription: string;
  description: string;
  ogImage: string;
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
    items: [
      { name: 'Snow IV Drip (Velvet Glow)', priceFrom: 2590, unit: 'ครั้ง' },
      { name: 'Signature Flawless IV Drip', priceFrom: 2590, unit: 'ครั้ง' },
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
    items: [
      { name: 'NCTF 135 HA + Oxelle', priceFrom: 11990, unit: 'ครั้ง' },
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
    items: [{ name: 'Karisma Rh Collagen', detail: '1 กล่อง', priceFrom: 18990, unit: 'ครั้ง' }],
  },
];

export function getServiceBySlug(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}
