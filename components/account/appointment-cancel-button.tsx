'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function AppointmentCancelButton({ leadId }: { leadId: string }) {
  const t = useTranslations('Appointments.myAppointments');
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function cancel() {
    if (!window.confirm(t('cancelConfirm'))) return;
    setBusy(true);
    setError(false);
    try {
      const response = await fetch(`/api/account/appointments/${leadId}/cancel`, {
        method: 'POST',
      });
      if (!response.ok) {
        setError(true);
        return;
      }
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shrink-0 text-right">
      <button
        type="button"
        onClick={cancel}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <X className="size-3.5" aria-hidden="true" />
        )}
        {t('cancelButton')}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{t('cancelError')}</p>}
    </div>
  );
}
