'use client';

import { useState } from 'react';
import { Loader2, TriangleAlert, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { formatSatang } from '@/lib/members/money';

type Fulfillment = 'booking_request' | 'deposit' | 'full_payment';
type PaymentMethod = 'pay_at_clinic' | 'gateway';
type State = { kind: 'idle' | 'sending' } | { kind: 'error'; message: string };

const fieldClass =
  'w-full rounded-xl border border-olive/20 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-olive/50';

/**
 * Checkout: contact details + how the customer wants to settle. The cart itself is read server-side
 * at submit — this form never sends line items or prices. On success it navigates (full reload, so
 * the header badge clears) to the order page, or to the gateway when a redirect URL comes back.
 */
export function CheckoutForm({
  subtotalSatang,
  depositSatang,
  depositPercent,
  prefill,
}: {
  subtotalSatang: number;
  depositSatang: number;
  depositPercent: number;
  prefill: { name: string; phone: string; email: string };
}) {
  const t = useTranslations('Checkout');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [fulfillment, setFulfillment] = useState<Fulfillment>('booking_request');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_at_clinic');
  const [form, setForm] = useState({
    name: prefill.name,
    phone: prefill.phone,
    email: prefill.email,
    preferredTime: '',
    note: '',
  });
  const sending = state.kind === 'sending';
  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  const amountDue =
    fulfillment === 'booking_request' ? 0 : fulfillment === 'deposit' ? depositSatang : subtotalSatang;

  const fulfillments: { key: Fulfillment; label: string; hint: string; amount: number }[] = [
    { key: 'booking_request', label: t('fulfillment.booking'), hint: t('fulfillment.bookingHint'), amount: 0 },
    { key: 'deposit', label: t('fulfillment.deposit', { percent: depositPercent }), hint: t('fulfillment.depositHint'), amount: depositSatang },
    { key: 'full_payment', label: t('fulfillment.full'), hint: t('fulfillment.fullHint'), amount: subtotalSatang },
  ];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return setState({ kind: 'error', message: t('error.name') });
    if ((form.phone.match(/\d/g)?.length ?? 0) < 8) {
      return setState({ kind: 'error', message: t('error.phone') });
    }

    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contactName: form.name.trim(),
          contactPhone: form.phone.trim(),
          contactEmail: form.email.trim() || null,
          preferredTime: form.preferredTime.trim() || null,
          note: form.note.trim() || null,
          fulfillment,
          paymentMethod: fulfillment === 'booking_request' ? null : paymentMethod,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        orderId?: string;
        payment?: { status: string; url?: string };
      };
      if (!res.ok) throw new Error(data.error || t('error.submit'));

      if (data.payment?.status === 'redirect' && data.payment.url) {
        window.location.assign(data.payment.url);
        return;
      }
      window.location.assign(`/account/orders/${data.orderId}`);
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : t('error.submit') });
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start" noValidate>
      <div className="space-y-8">
        {/* Contact */}
        <fieldset className="rounded-[1.5rem] border border-black/5 bg-[var(--store-card)] p-6 shadow-lg shadow-black/5 md:p-8">
          <legend className="px-2 font-serif text-lg text-[var(--store-ink)]">{t('contact.title')}</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="name" className="mb-1.5 block text-sm text-ink/70">{t('contact.name')}</label>
              <input id="name" className={fieldClass} value={form.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="phone" className="mb-1.5 block text-sm text-ink/70">{t('contact.phone')}</label>
              <input id="phone" className={fieldClass} value={form.phone} onChange={(e) => set({ phone: e.target.value })} inputMode="tel" autoComplete="tel" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="mb-1.5 block text-sm text-ink/70">{t('contact.email')}</label>
              <input id="email" type="email" className={fieldClass} value={form.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" placeholder={t('contact.emailOptional')} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="time" className="mb-1.5 block text-sm text-ink/70">{t('contact.time')}</label>
              <input id="time" className={fieldClass} value={form.preferredTime} onChange={(e) => set({ preferredTime: e.target.value })} placeholder={t('contact.timePlaceholder')} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="note" className="mb-1.5 block text-sm text-ink/70">{t('contact.note')}</label>
              <textarea id="note" rows={3} className={fieldClass} value={form.note} onChange={(e) => set({ note: e.target.value })} />
            </div>
          </div>
        </fieldset>

        {/* Fulfillment */}
        <fieldset className="rounded-[1.5rem] border border-black/5 bg-[var(--store-card)] p-6 shadow-lg shadow-black/5 md:p-8">
          <legend className="px-2 font-serif text-lg text-[var(--store-ink)]">{t('fulfillment.title')}</legend>
          <div className="mt-4 space-y-3">
            {fulfillments.map((opt) => (
              <label
                key={opt.key}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  fulfillment === opt.key ? 'border-forest bg-forest/5' : 'border-black/10 hover:border-black/20'
                }`}
              >
                <input type="radio" name="fulfillment" checked={fulfillment === opt.key} onChange={() => setFulfillment(opt.key)} className="mt-1 accent-forest" />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--store-ink)]">{opt.label}</span>
                    <span className="font-serif text-[var(--store-ink)]">{formatSatang(opt.amount)}</span>
                  </span>
                  <span className="mt-1 block text-xs leading-[1.6] text-[var(--store-muted)]">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>

          {fulfillment !== 'booking_request' && (
            <div className="mt-5 border-t border-black/[0.08] pt-5">
              <p className="mb-3 text-sm text-ink/70">{t('payment.title')}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['pay_at_clinic', 'gateway'] as PaymentMethod[]).map((m) => (
                  <label
                    key={m}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3.5 text-sm transition-colors ${
                      paymentMethod === m ? 'border-forest bg-forest/5' : 'border-black/10 hover:border-black/20'
                    }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} className="accent-forest" />
                    <span className="text-[var(--store-ink)]">{t(`payment.${m}`)}</span>
                  </label>
                ))}
              </div>
              {paymentMethod === 'gateway' && (
                <p className="mt-3 text-[0.7rem] leading-[1.6] text-[var(--store-muted)]">{t('payment.gatewayNote')}</p>
              )}
            </div>
          )}
        </fieldset>
      </div>

      {/* Summary / submit */}
      <aside className="rounded-[1.5rem] border border-black/5 bg-[var(--store-card)] p-6 shadow-lg shadow-black/5 lg:sticky lg:top-24">
        <h2 className="font-serif text-xl text-[var(--store-ink)]">{t('summary.title')}</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--store-muted)]">{t('summary.subtotal')}</span>
            <span className="text-[var(--store-ink)]">{formatSatang(subtotalSatang)}</span>
          </div>
          <div className="flex justify-between border-t border-black/[0.08] pt-2">
            <span className="font-medium text-[var(--store-ink)]">{t('summary.dueNow')}</span>
            <span className="font-serif text-lg text-[var(--store-ink)]">{formatSatang(amountDue)}</span>
          </div>
        </div>

        {state.kind === 'error' && (
          <p className="mt-4 flex items-center gap-2 text-sm text-red-600">
            <TriangleAlert className="size-4 shrink-0" />
            {state.message}
          </p>
        )}

        <Button type="submit" disabled={sending} className="mt-6 w-full bg-forest text-white hover:bg-mint">
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {t('submit')}
        </Button>
        <p className="mt-3 text-center text-[0.66rem] leading-[1.7] text-[var(--store-muted)]">{t('summary.note')}</p>
      </aside>
    </form>
  );
}
