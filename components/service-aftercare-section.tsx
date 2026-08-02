import { getTranslations } from 'next-intl/server';
import { Clock, ShieldAlert, Sparkles } from 'lucide-react';
import type { ServiceCategory } from '@/lib/services';
import { Reveal } from '@/components/reveal';

/**
 * Aftercare / contraindications / downtime band, shared across every service page so the
 * content added for the 2026-08-02 thin-content audit reads the same everywhere instead of each
 * page inventing its own layout. Renders nothing if a category has none of the three fields yet
 * (see the DRAFT note on ServiceCategory in lib/services.ts — content is medical copy pending
 * doctor/owner review, CLAUDE.md §0.2).
 */
export async function ServiceAftercareSection({ service }: { service: ServiceCategory }) {
  const hasContent =
    (service.aftercare && service.aftercare.length > 0) ||
    (service.contraindications && service.contraindications.length > 0) ||
    service.downtime;
  if (!hasContent) return null;

  const t = await getTranslations('ServiceCategoryPage');

  return (
    <section className="border-t border-black/[0.08] bg-[var(--store-surface)] px-4 py-20 md:px-6 md:py-24">
      <Reveal className="mx-auto mb-10 max-w-6xl md:mb-12">
        <p lang="en" className="text-[0.66rem] uppercase tracking-[0.24em] text-[var(--store-muted)]">
          Care &amp; Considerations
        </p>
        <h2 className="mt-5 font-serif text-3xl text-[var(--store-ink)] md:text-4xl">
          {t('aftercareHeading')}
        </h2>
      </Reveal>

      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {service.aftercare && service.aftercare.length > 0 && (
          <Reveal className="rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] p-7">
            <div className="flex items-center gap-2.5 text-[var(--store-ink)]">
              <Sparkles aria-hidden="true" className="size-4 shrink-0 text-[var(--mint)]" />
              <h3 className="text-sm font-medium">{t('aftercareLabel')}</h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {service.aftercare.map((note) => (
                <li key={note} className="flex gap-3 text-xs leading-[1.75] text-[var(--store-muted)]">
                  <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-[var(--store-control)]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {service.contraindications && service.contraindications.length > 0 && (
          <Reveal
            delay={60}
            className="rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] p-7"
          >
            <div className="flex items-center gap-2.5 text-[var(--store-ink)]">
              <ShieldAlert aria-hidden="true" className="size-4 shrink-0 text-[var(--mint)]" />
              <h3 className="text-sm font-medium">{t('contraindicationsLabel')}</h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {service.contraindications.map((note) => (
                <li key={note} className="flex gap-3 text-xs leading-[1.75] text-[var(--store-muted)]">
                  <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-[var(--store-control)]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {service.downtime && (
          <Reveal
            delay={120}
            className="rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] p-7"
          >
            <div className="flex items-center gap-2.5 text-[var(--store-ink)]">
              <Clock aria-hidden="true" className="size-4 shrink-0 text-[var(--mint)]" />
              <h3 className="text-sm font-medium">{t('downtimeLabel')}</h3>
            </div>
            <p className="mt-4 text-xs leading-[1.75] text-[var(--store-muted)]">{service.downtime}</p>
          </Reveal>
        )}
      </div>

      <p className="mx-auto mt-10 max-w-6xl text-center text-[0.66rem] leading-[1.8] text-[var(--store-muted)]">
        {t('aftercareDisclaimer')}
      </p>
    </section>
  );
}
