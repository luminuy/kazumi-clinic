// Single source of truth for the primary navigation. Home is intentionally omitted —
// the logo links to `/`. Individual service categories live under /services, not the top nav.
export type NavItem = { href: string; label: string };

export const navItems: NavItem[] = [
  { href: '/services', label: 'บริการ' },
  { href: '/about', label: 'เกี่ยวกับเรา' },
  { href: '/reviews', label: 'รีวิว' },
  { href: '/promotions', label: 'โปรโมชั่น' },
  { href: '/contact', label: 'ติดต่อเรา' },
];
