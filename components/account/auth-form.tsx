'use client';

import { useState } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LineIcon } from '@/components/brand-icons';

type Mode = 'login' | 'register';
type State = { kind: 'idle' | 'sending' } | { kind: 'error'; message: string };

/** The multi-colour Google "G" — inline so the button needs no external asset. */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

const fieldClass =
  'w-full rounded-xl border border-black/5 bg-black/[0.04] px-4 py-3 text-sm text-[var(--store-ink)] outline-none transition-all placeholder:text-[var(--store-ink)]/40 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-forest/50 focus:shadow-[0_4px_12px_rgb(0,0,0,0.05)]';

/**
 * Email/password sign-in + sign-up in one form. On success it does a full-page navigation (not a
 * client push) so every Server Component re-reads the new session cookie — the header account state
 * and any protected page reflect the login immediately.
 *
 * `redirectTo` is where to land after auth; defaults to /account. OAuth buttons arrive in Phase 4.
 */
export function AuthForm({
  mode,
  redirectTo = '/account',
  oauthError,
}: {
  mode: Mode;
  redirectTo?: string;
  oauthError?: string;
}) {
  const t = useTranslations('Account');
  const oauthErrorMessage = oauthError
    ? t.has(`oauth.errors.${oauthError}`)
      ? t(`oauth.errors.${oauthError}`)
      : t('oauth.errors.oauth_failed')
    : null;
  const [state, setState] = useState<State>(
    oauthErrorMessage ? { kind: 'error', message: oauthErrorMessage } : { kind: 'idle' },
  );
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

  const oauthHref = (provider: 'google' | 'line') =>
    `/api/account/oauth/${provider}?next=${encodeURIComponent(redirectTo)}`;

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {/* Social sign-in. The buttons always render so the clinic can see them; if a provider's
          keys aren't set yet, the start route bounces back here with an explanatory message. */}
      <div className="grid gap-3">
        <a
          href={oauthHref('line')}
          className="flex items-center justify-center gap-2.5 rounded-full bg-[#06C755] px-5 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98]"
        >
          <LineIcon className="size-4" />
          {t('oauth.line')}
        </a>
        <a
          href={oauthHref('google')}
          className="flex items-center justify-center gap-2.5 rounded-full border border-black/5 bg-white px-5 py-3 text-sm font-medium text-[var(--store-ink)] transition-all hover:scale-[1.02] hover:bg-black/[0.02] hover:shadow-sm active:scale-[0.98]"
        >
          <GoogleIcon className="size-4" />
          {t('oauth.google')}
        </a>
      </div>

      <div className="flex items-center gap-3 py-2">
        <span className="h-px flex-1 bg-black/5" />
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-[var(--store-ink)]/40">{t('oauth.or')}</span>
        <span className="h-px flex-1 bg-black/5" />
      </div>

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
        className="h-auto w-full rounded-full bg-forest py-3 text-white transition-all hover:scale-[1.02] hover:bg-mint hover:shadow-sm active:scale-[0.98]"
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
