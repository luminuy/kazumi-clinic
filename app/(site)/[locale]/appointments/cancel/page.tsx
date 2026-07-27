import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalendarX } from 'lucide-react';
import { findLeadByCancelToken } from '@/lib/leads-store';
import { formatAppointmentDateTime } from '@/lib/appointments/schedule';
import { AppointmentCancelForm } from '@/components/appointment-cancel-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Appointments.cancelPage' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

export const dynamic = 'force-dynamic';

export default async function CancelAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Appointments.cancelPage');
  const query = await searchParams;
  const token = typeof query.token === 'string' ? query.token : null;
  const lead = token ? await findLeadByCancelToken(token) : null;

  const message = !lead
    ? t('notFound')
    : lead.status === 'cancelled'
      ? t('alreadyCancelled')
      : null;

  return (
    <section className="bg-[var(--store-surface)] py-20">
      <div className="mx-auto w-full max-w-xl px-6">
        <div className="rounded-[2rem] border border-black/5 bg-[var(--store-card)] p-8 shadow-lg shadow-black/5 sm:p-10">
          <span className="grid size-14 place-items-center rounded-full bg-red-50 text-red-600">
            <CalendarX strokeWidth={1.5} className="size-7" />
          </span>
          <h1 className="mt-6 font-serif text-3xl text-[var(--store-ink)]">{t('title')}</h1>

          {message ? (
            <p className="mt-4 leading-relaxed text-[var(--store-muted)]">{message}</p>
          ) : lead && token ? (
            <>
              <p className="mt-4 leading-relaxed text-[var(--store-muted)]">{t('desc')}</p>
              <dl className="mt-6 space-y-3 rounded-2xl bg-[var(--store-surface)] p-5 text-sm">
                {lead.interest && (
                  <div>
                    <dt className="text-[var(--store-muted)]">{t('interestLabel')}</dt>
                    <dd className="mt-0.5 text-[var(--store-ink)]">{lead.interest}</dd>
                  </div>
                )}
                {lead.scheduled_at && (
                  <div>
                    <dt className="text-[var(--store-muted)]">{t('scheduledLabel')}</dt>
                    <dd className="mt-0.5 text-[var(--store-ink)]">
                      {formatAppointmentDateTime(
                        lead.scheduled_at,
                        locale === 'en' ? 'en' : 'th',
                      )}
                    </dd>
                  </div>
                )}
              </dl>
              <AppointmentCancelForm token={token} />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
