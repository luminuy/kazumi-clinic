'use client';

import { useState } from 'react';
import { Check, Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

type State = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; message: string };

const fieldClass =
  'w-full rounded-xl border border-olive/20 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-olive/50';

export function BookingForm({ interests }: { interests: string[] }) {
  const t = useTranslations('BookingForm');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [form, setForm] = useState({
    name: '',
    phone: '',
    interest: '',
    preferredTime: '',
    message: '',
    website: '', // honeypot — kept empty by real users
  });
  const sending = state.kind === 'sending';

  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return setState({ kind: 'error', message: t('error.name') });
    if ((form.phone.match(/\d/g)?.length ?? 0) < 8) {
      return setState({ kind: 'error', message: t('error.phone') });
    }

    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          interest: form.interest || null,
          preferredTime: form.preferredTime.trim() || null,
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
      setForm({ name: '', phone: '', interest: '', preferredTime: '', message: '', website: '' });
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
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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

      <Button
        type="submit"
        disabled={sending}
        size="lg"
        className="w-full rounded-full bg-forest text-white hover:bg-forest/90 sm:w-auto"
      >
        {sending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t('form.submit')}
      </Button>
      <p className="text-xs text-ink/45">
        {t('form.disclaimer')}
      </p>
    </form>
  );
}
