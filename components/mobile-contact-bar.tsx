import { site } from '@/lib/site';
import { LineIcon } from '@/components/brand-icons';

/**
 * Floating LINE button on mobile. Replaces the old full-width three-up bottom bar
 * (โทร / แผนที่ / จอง LINE), which sat heavy across the whole screen — this is a single, clear
 * booking action tucked into the corner, out of the content's way. Mobile only; desktop keeps
 * the in-page CTAs.
 */
import { useTranslations } from 'next-intl';

export function MobileContactBar() {
  const t = useTranslations('Navigation');
  return (
    <a
      href={site.lineUrl}
      target="_blank"
      rel="noopener"
      aria-label={t('bookLine')}
      className="fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] right-4 z-50 flex size-14 items-center justify-center rounded-full bg-[#06c755] text-white shadow-[0_8px_24px_rgb(6_199_85/0.45)] transition-transform duration-200 hover:scale-105 active:scale-95 md:hidden"
    >
      <LineIcon className="size-7" />
      <span className="sr-only">{t('bookLine')}</span>
    </a>
  );
}
