import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalendarDays } from 'lucide-react';
import { redirect, Link } from '@/i18n/routing';
import { getCurrentMember } from '@/lib/members/session';
import { getLeadsForMember } from '@/lib/leads-store';
import { formatAppointmentDateTime } from '@/lib/appointments/schedule';
import { site } from '@/lib/site';
import { AppointmentCancelButton } from '@/components/account/appointment-cancel-button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Appointments' });
  return { title: t('myAppointments.title'), robots: { index: false, follow: false } };
}

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Appointments.myAppointments');

  const member = await getCurrentMember();
  if (!member) redirect({ href: '/account/login', locale });
  const me = member!;
  const leads = await getLeadsForMember(me.id);

  return (
    <section className="bg-[var(--store-surface)] py-16">
      <div className="mx-auto w-full max-w-2xl px-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-forest">
          {t('eyebrow')}
        </p>
        <h1 className="mb-8 mt-1 font-serif text-3xl text-[var(--store-ink)]">{t('title')}</h1>

        {leads.length === 0 ? (
          <div className="rounded-[1.5rem] border border-black/5 bg-[var(--store-card)] p-12 text-center shadow-lg shadow-black/5">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--store-control)] text-[var(--store-ink)]">
              <CalendarDays strokeWidth={1.5} className="size-7" />
            </span>
            <p className="mt-5 font-serif text-xl text-[var(--store-ink)]">{t('emptyTitle')}</p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-xs font-medium text-white transition-colors hover:bg-mint"
            >
              {t('emptyCta')}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {leads.map((lead) => {
              const active =
                lead.status === 'new' || lead.status === 'contacted' || lead.status === 'booked';
              const requested = [lead.requested_date, lead.requested_time]
                .filter(Boolean)
                .join(' · ');
              return (
                <li
                  key={lead.id}
                  className="flex items-start gap-4 rounded-[1.25rem] border border-black/5 bg-[var(--store-card)] p-5 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-serif text-lg text-[var(--store-ink)]">
                        {lead.interest || site.name}
                      </p>
                      <span className="rounded-full bg-[var(--store-control)] px-2.5 py-1 text-[0.65rem] font-medium text-[var(--store-ink)]">
                        {t(`status.${lead.status}`)}
                      </span>
                    </div>
                    {lead.scheduled_at ? (
                      <p className="mt-2 text-sm text-[var(--store-muted)]">
                        {t('scheduledLabel')}:{' '}
                        <span className="text-[var(--store-ink)]">
                          {formatAppointmentDateTime(
                            lead.scheduled_at,
                            locale === 'en' ? 'en' : 'th',
                          )}
                        </span>
                      </p>
                    ) : requested || lead.preferred_time ? (
                      <p className="mt-2 text-sm text-[var(--store-muted)]">
                        {t('requestedLabel')}:{' '}
                        <span className="text-[var(--store-ink)]">
                          {requested || lead.preferred_time}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  {active && <AppointmentCancelButton leadId={lead.id} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
