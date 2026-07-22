'use client';

import { useState } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

type Mode = 'login' | 'register';
type State = { kind: 'idle' | 'sending' } | { kind: 'error'; message: string };

const fieldClass =
  'w-full rounded-xl border border-olive/20 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-olive/50';

/**
 * Email/password sign-in + sign-up in one form. On success it does a full-page navigation (not a
 * client push) so every Server Component re-reads the new session cookie — the header account state
 * and any protected page reflect the login immediately.
 *
 * `redirectTo` is where to land after auth; defaults to /account. OAuth buttons arrive in Phase 4.
 */
export function AuthForm({ mode, redirectTo = '/account' }: { mode: Mode; redirectTo?: string }) {
  const t = useTranslations('Account');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const sending = state.kind === 'sending';

  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.email.trim()) return setState({ kind: 'error', message: t('error.email') });
    if (form.password.length < (mode === 'register' ? 8 : 1)) {
      return setState({ kind: 'error', message: t('error.password') });
    }

    setState({ kind: 'sending' });
    const endpoint = mode === 'register' ? '/api/account/register' : '/api/account/login';
    const payload =
      mode === 'register'
        ? { name: form.name.trim() || null, email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = t('error.generic', { status: res.status });
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          /* non-JSON body */
        }
        throw new Error(message);
      }
      // Full reload so Server Components pick up the session cookie.
      window.location.assign(redirectTo);
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : t('error.submit') });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {mode === 'register' && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-ink/70">
            {t('field.name')}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={fieldClass}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={t('field.namePlaceholder')}
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-ink/70">
          {t('field.email')}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
          value={form.email}
          onChange={(e) => set({ email: e.target.value })}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-ink/70">
          {t('field.password')}
        </label>
        <input
          id="password"
          type="password"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          required
          className={fieldClass}
          value={form.password}
          onChange={(e) => set({ password: e.target.value })}
          placeholder={mode === 'register' ? t('field.passwordHint') : '••••••••'}
        />
      </div>

      {state.kind === 'error' && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <TriangleAlert className="size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={sending}
        className="w-full bg-forest text-white hover:bg-mint"
      >
        {sending && <Loader2 className="size-4 animate-spin" />}
        {mode === 'register' ? t('submit.register') : t('submit.login')}
      </Button>

      <p className="pt-2 text-center text-sm text-ink/60">
        {mode === 'register' ? t('switch.haveAccount') : t('switch.noAccount')}{' '}
        <Link
          href={mode === 'register' ? '/account/login' : '/account/register'}
          className="font-medium text-forest hover:underline"
        >
          {mode === 'register' ? t('submit.login') : t('submit.register')}
        </Link>
      </p>
    </form>
  );
}
