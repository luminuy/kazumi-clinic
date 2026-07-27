'use client';

import { useMemo, useState } from 'react';
import { Check, Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import {
  APPOINTMENT_MAX_ADVANCE_DAYS,
  generateTimeSlots,
} from '@/lib/appointments/schedule';

type State = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; message: string };

const fieldClass =
  'w-full rounded-2xl border-none bg-background px-5 py-4 text-[0.95rem] text-foreground ring-1 ring-border/50 outline-none transition-all placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-foreground';

function bookingDateRange() {
  const bangkokNow = new Date();
  bangkokNow.setTime(bangkokNow.getTime() + 7 * 60 * 60 * 1000);
  const minDate = bangkokNow.toISOString().slice(0, 10);
  bangkokNow.setUTCDate(bangkokNow.getUTCDate() + APPOINTMENT_MAX_ADVANCE_DAYS);
  return { minDate, maxDate: bangkokNow.toISOString().slice(0, 10) };
}

export function BookingForm({ interests }: { interests: string[] }) {
  const t = useTranslations('BookingForm');
  const locale = useLocale() as 'th' | 'en';
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    interest: '',
    preferredTime: '',
    requestedDate: '',
    requestedTime: '',
    message: '',
    website: '', // honeypot — kept empty by real users
  });
  const sending = state.kind === 'sending';
  const [{ minDate, maxDate }] = useState(bookingDateRange);
  const timeSlots = useMemo(
    () => (form.requestedDate ? generateTimeSlots({ dateIso: form.requestedDate }) : []),
    [form.requestedDate],
  );

  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return setState({ kind: 'error', message: t('error.name') });
    if ((form.phone.match(/\d/g)?.length ?? 0) < 8) {
      return setState({ kind: 'error', message: t('error.phone') });
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return setState({ kind: 'error', message: t('error.email') });
    }
    if (form.requestedDate && !form.requestedTime) {
      return setState({ kind: 'error', message: t('form.timeSlotPlaceholder') });
    }

    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          interest: form.interest || null,
          preferredTime: form.preferredTime.trim() || null,
          requestedDate: form.requestedDate || undefined,
          requestedTime: form.requestedTime || undefined,
          locale,
          message: form.message.trim() || null,
          website: form.website,
        }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        if (msg) {
          try {
            const data = JSON.parse(msg) as { error?: string };
            if (data.error) throw new Error(data.error);
          } catch {
            /* non-JSON body */
          }
        }
        throw new Error(t('error.submitStatus', { status: res.status }));
      }
      setState({ kind: 'sent' });
      setForm({
        name: '',
        phone: '',
        email: '',
        interest: '',
        preferredTime: '',
        requestedDate: '',
        requestedTime: '',
        message: '',
        website: '',
      });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : t('error.submit') });
    }
  }

  if (state.kind === 'sent') {
    return (
      <div className="rounded-2xl border border-olive/20 bg-cream p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-forest/10 text-forest">
          <Check className="size-6" />
        </span>
        <p className="mt-4 font-serif text-xl text-olive-deep">{t('success.title')}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
          {t('success.desc')}
        </p>
        <button
          type="button"
          onClick={() => setState({ kind: 'idle' })}
          className="mt-5 text-sm font-medium text-forest hover:underline"
        >
          {t('success.resubmit')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="text-xs font-medium text-ink/65">{t('form.nameLabel')}</span>
          <input
            className={`mt-1.5 ${fieldClass}`}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={t('form.namePlaceholder')}
            autoComplete="name"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink/65">{t('form.phoneLabel')}</span>
          <input
            className={`mt-1.5 ${fieldClass}`}
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            placeholder={t('form.phonePlaceholder')}
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>
        <label className="block sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-medium text-ink/65">{t('form.emailLabel')}</span>
          <input
            type="email"
            className={`mt-1.5 ${fieldClass}`}
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder={t('form.emailPlaceholder')}
            autoComplete="email"
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-ink/65">{t('form.interestLabel')}</span>
          <select
            className={`mt-1.5 ${fieldClass}`}
            value={form.interest}
            onChange={(e) => set({ interest: e.target.value })}
          >
            <option value="">{t('form.interestPlaceholder')}</option>
            {interests.map((interest) => (
              <option key={interest} value={interest}>
                {interest}
              </option>
            ))}
            <option value="อื่น ๆ / ปรึกษาแพทย์">{t('form.interestOther')}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink/65">{t('form.dateLabel')}</span>
          <input
            type="date"
            className={`mt-1.5 ${fieldClass}`}
            value={form.requestedDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => set({ requestedDate: e.target.value, requestedTime: '' })}
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <span className="text-xs font-medium text-ink/65">{t('form.timeSlotLabel')}</span>
          {form.requestedDate && timeSlots.length === 0 ? (
            <p className="mt-1.5 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-700">
              {t('form.timeSlotEmpty')}
            </p>
          ) : (
            <select
              className={`mt-1.5 ${fieldClass}`}
              value={form.requestedTime}
              disabled={!form.requestedDate}
              onChange={(e) => set({ requestedTime: e.target.value })}
            >
              <option value="">
                {form.requestedDate
                  ? t('form.timeSlotPlaceholder')
                  : t('form.timeSlotChooseDateFirst')}
              </option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          )}
        </div>
        <label className="block">
          <span className="text-xs font-medium text-ink/65">{t('form.timeLabel')}</span>
          <input
            className={`mt-1.5 ${fieldClass}`}
            value={form.preferredTime}
            onChange={(e) => set({ preferredTime: e.target.value })}
            placeholder={t('form.timePlaceholder')}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-ink/65">{t('form.messageLabel')}</span>
        <textarea
          className={`mt-1.5 min-h-24 resize-y ${fieldClass}`}
          value={form.message}
          onChange={(e) => set({ message: e.target.value })}
          placeholder={t('form.messagePlaceholder')}
        />
      </label>

      {/* Honeypot: visually hidden, off the tab order, no autofill. Bots fill it; people don't. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => set({ website: e.target.value })}
          />
        </label>
      </div>

      {state.kind === 'error' && (
        <p className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          <TriangleAlert className="size-3.5" /> {state.message}
        </p>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={sending}
          size="lg"
          className="w-full rounded-full bg-foreground px-8 py-6 text-base font-medium text-background hover:scale-[0.98] hover:bg-foreground/90 transition-all sm:w-auto"
        >
          {sending ? <Loader2 className="size-5 animate-spin mr-2" /> : null}
          {t('form.submit')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground/80">
        {t('form.disclaimer')}
      </p>
    </form>
  );
}
