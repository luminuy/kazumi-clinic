'use client';

import { useState } from 'react';
import { CircleCheck, Loader2, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function AppointmentCancelForm({ token }: { token: string }) {
  const t = useTranslations('Appointments.cancelPage');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function cancel() {
    setState('sending');
    try {
      const response = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      setState(response.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <p className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-forest/[0.07] px-4 py-3 text-sm text-forest">
        <CircleCheck className="size-4" aria-hidden="true" />
        {t('success')}
      </p>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={cancel}
        disabled={state === 'sending'}
        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
      >
        {state === 'sending' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {t('confirmButton')}
      </button>
      {state === 'error' && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-red-600">
          <TriangleAlert className="size-4" aria-hidden="true" />
          {t('error')}
        </p>
      )}
    </div>
  );
}
