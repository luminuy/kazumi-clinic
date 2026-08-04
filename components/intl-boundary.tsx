import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import {
  pickClientMessages,
  type ClientMessageNamespace,
} from '@/i18n/client-namespaces';

/**
 * Ships client messages per page/subtree instead of attaching the complete client catalogue to
 * every route. On production the old provider props were 21,157 bytes — 19% of the home page's
 * RSC flight payload — even when most namespaces were unreachable from that page.
 *
 * next-intl's BaseLink is a `'use client'` component that calls `useLocale()` unconditionally, so
 * anything rendering `Link` from `@/i18n/routing` needs a boundary — including server components
 * such as Footer and pages whose `namespaces` list is empty. Without one, prerender fails.
 *
 * Nested NextIntlClientProviders replace `messages`; they do not merge an inner namespace set with
 * the outer one. Every page must therefore declare its complete client namespace set and cannot
 * rely on the layout boundary's messages.
 */
export async function IntlBoundary({
  namespaces,
  children,
}: {
  namespaces: readonly ClientMessageNamespace[];
  children: React.ReactNode;
}) {
  const messages = pickClientMessages(await getMessages(), namespaces);

  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
