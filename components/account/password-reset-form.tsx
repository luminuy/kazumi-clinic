'use client';

import { useState } from 'react';
import { CircleCheck, Loader2, TriangleAlert } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/routing';
import { fieldClass } from './auth-form';

type RequestState =
  | { kind: 'idle' | 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; status: number | null };

type ResetState =
  | { kind: 'idle' | 'sending' }
  | { kind: 'invalid' }
  | { kind: 'error'; status: number | null };

export function PasswordResetRequestForm() {
  const t = useTranslations('Account');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<RequestState>({ kind: 'idle' });
  const sending = state.kind === 'sending';

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setState({ kind: 'error', status: null });
      return;
    }

    setState({ kind: 'sending' });
    try {
      const response = await fetch('/api/account/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale }),
      });
      if (!response.ok) {
        setState({ kind: 'error', status: response.status });
        return;
      }
      setState({ kind: 'sent' });
    } catch {
      setState({ kind: 'error', status: null });
    }
  }

  if (state.kind === 'sent') {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-forest/[0.07] p-5 text-ink">
          <CircleCheck className="mb-3 size-5 text-forest" aria-hidden="true" />
          <h2 className="font-medium">{t('forgot.confirmationTitle')}</h2>
          <p className="mt-1.5 text-sm leading-[1.6] text-ink/65">{t('forgot.confirmation')}</p>
        </div>
        <p className="text-center text-sm">
          <Link href="/account/login" className="font-medium text-forest hover:underline">
            {t('forgot.backToLogin')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="reset-email" className="mb-1.5 block text-sm text-ink/70">
          {t('field.email')}
        </label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('field.emailPlaceholder')}
        />
      </div>

      {state.kind === 'error' && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          {state.status
            ? t('error.generic', { status: state.status })
            : t('error.email')}
        </p>
      )}

      <Button
        type="submit"
        disabled={sending}
        className="h-auto w-full rounded-full bg-forest py-3 text-white transition-all hover:scale-[1.02] hover:bg-mint hover:shadow-sm active:scale-[0.98]"
      >
        {sending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {t('submit.sendResetLink')}
      </Button>

      <p className="pt-2 text-center text-sm">
        <Link href="/account/login" className="font-medium text-forest hover:underline">
          {t('forgot.backToLogin')}
        </Link>
      </p>
    </form>
  );
}

export function PasswordResetForm({ token }: { token: string | null }) {
  const t = useTranslations('Account');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [state, setState] = useState<ResetState>(
    token ? { kind: 'idle' } : { kind: 'invalid' },
  );
  const sending = state.kind === 'sending';

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      setState({ kind: 'invalid' });
      return;
    }
    if (password.length < 8) {
      setState({ kind: 'error', status: null });
      return;
    }

    setState({ kind: 'sending' });
    try {
      const response = await fetch('/api/account/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!response.ok) {
        let code: string | undefined;
        try {
          const data = (await response.json()) as { code?: string };
          code = data.code;
        } catch {
          // A non-JSON error still maps to the localized generic message below.
        }
        setState(
          code === 'invalid_token'
            ? { kind: 'invalid' }
            : { kind: 'error', status: response.status },
        );
        return;
      }
      router.replace('/account/login');
    } catch {
      setState({ kind: 'error', status: null });
    }
  }

  if (state.kind === 'invalid') {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-red-50 p-5 text-ink">
          <TriangleAlert className="mb-3 size-5 text-red-600" aria-hidden="true" />
          <h2 className="font-medium">{t('reset.invalidTitle')}</h2>
          <p className="mt-1.5 text-sm leading-[1.6] text-ink/65">{t('reset.invalid')}</p>
        </div>
        <Button
          render={<Link href="/account/forgot-password" />}
          className="h-auto w-full rounded-full bg-forest py-3 text-white transition-all hover:scale-[1.02] hover:bg-mint hover:shadow-sm active:scale-[0.98]"
        >
          {t('reset.requestNew')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm text-ink/70">
          {t('field.newPassword')}
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={fieldClass}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t('field.passwordHint')}
        />
      </div>

      {state.kind === 'error' && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          {state.status
            ? t('error.generic', { status: state.status })
            : t('error.passwordMin')}
        </p>
      )}

      <Button
        type="submit"
        disabled={sending}
        className="h-auto w-full rounded-full bg-forest py-3 text-white transition-all hover:scale-[1.02] hover:bg-mint hover:shadow-sm active:scale-[0.98]"
      >
        {sending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {t('submit.resetPassword')}
      </Button>
    </form>
  );
}
