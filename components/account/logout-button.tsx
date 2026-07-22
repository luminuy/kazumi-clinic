'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Posts to /api/account/logout, then reloads so Server Components drop the signed-in state. */
export function LogoutButton() {
  const t = useTranslations('Account');
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch('/api/account/logout', { method: 'POST' });
    } finally {
      window.location.assign('/');
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="inline-flex items-center gap-2 text-sm text-ink/60 transition-colors hover:text-forest disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      {t('logout')}
    </button>
  );
}
