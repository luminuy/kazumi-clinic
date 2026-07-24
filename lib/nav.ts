// Single source of truth for the primary navigation. Home is intentionally omitted —
// the logo links to `/`. Labels and the "บริการ" grouping follow the clinic's
// "Kazumi NavBar Structure Final" spec (2026-07-16).
import { serviceCategories, type ServiceCategory } from './services';

export type NavItem = { href: string; label: string };

// Ordered by the customer decision funnel for aesthetic procedures: what we offer →
// does it work (social proof) → is the deal worth it (commercial intent) → can I trust
// the clinic → learn more → get in touch. The two strongest booking drivers (results/
// reviews + promotions) sit up front rather than buried mid-row; contact stays last.
export const navItems: NavItem[] = [
  { href: '/services', label: 'บริการ' },
  { href: '/reviews', label: 'ผลลัพธ์และรีวิว' },
  { href: '/promotions', label: 'โปรโมชั่น' },
  { href: '/about', label: 'เกี่ยวกับ Kazumi' },
  { href: '/blog', label: 'บทความ' },
  { href: '/contact', label: 'ติดต่อเรา' },
];

/**
 * The "บริการ" mega dropdown — the spec groups the categories into six themed columns
 * rather than listing them flat. Groups name their categories by slug, so a category can
 * never show up in the menu without existing in `serviceCategories`.
 */
export type ServiceNavGroup = {
  /** Leading glyph from the spec — decorative, so it's aria-hidden wherever it renders. */
  glyph: string;
  title: string;
  /** English column heading, shown on the /en locale. Category names come from category.titleEn. */
  titleEn: string;
  slugs: string[];
};

export const serviceNavGroups: ServiceNavGroup[] = [
  {
    glyph: '💉',
    title: 'โบทูลินัมท็อกซิน ฟิลเลอร์ และร้อยไหม',
    titleEn: 'Botulinum Toxin, Filler & Thread Lift',
    slugs: ['filler', 'botox', 'thread-lift'],
  },
  {
    glyph: '✨',
    title: 'สกินบูสเตอร์และโปรแกรมกระตุ้นคอลลาเจน',
    titleEn: 'Skin Boosters & Collagen Stimulation',
    slugs: ['skin-booster', 'collagen-booster'],
  },
  {
    glyph: '💧',
    title: 'เมโสบำรุงผิวและเมโสแฟต',
    titleEn: 'Mesotherapy & Meso Fat',
    slugs: ['mesotherapy'],
  },
  {
    glyph: '🩺',
    title: 'โปรแกรมดูแลสิวและหลุมสิว',
    titleEn: 'Acne & Acne Scar Programs',
    slugs: ['acne-care'],
  },
  {
    glyph: '⚡',
    title: 'เลเซอร์และเครื่องมือแพทย์',
    titleEn: 'Laser & Medical Devices',
    slugs: ['laser-hifu'],
  },
  {
    glyph: '🧴',
    title: 'วิตามินบำรุงสุขภาพและผิว',
    titleEn: 'Wellness & Skin Vitamins',
    slugs: ['iv-drip'],
  },
];

export type ResolvedServiceNavGroup = { group: ServiceNavGroup; categories: ServiceCategory[] };

/** Resolves each group's slugs to real categories, dropping any that no longer exist. */
export function resolvedServiceNavGroups(): ResolvedServiceNavGroup[] {
  return serviceNavGroups
    .map((group) => ({
      group,
      categories: group.slugs
        .map((slug) => serviceCategories.find((c) => c.slug === slug))
        .filter((c): c is ServiceCategory => Boolean(c)),
    }))
    .filter((g) => g.categories.length > 0);
}
