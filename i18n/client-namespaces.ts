import type { AbstractIntlMessages } from 'next-intl';

/**
 * Every message namespace that may have to cross a server/client boundary.
 *
 * `getMessages()` returns every namespace in `messages/<locale>.json`, and handing that whole
 * object to `NextIntlClientProvider` serialises all of it into the RSC flight payload embedded in
 * the HTML. Boundaries now select from this complete list per page/subtree so unrelated copy is
 * not shipped everywhere.
 *
 * Server components don't need any of this. `useTranslations()` inside an RSC resolves against the
 * server-side store, so a namespace belongs here only when a **client** component reads it —
 * which is why `Footer`, `HomePage`, `PhysicianPanel` and friends are absent even though they're
 * very much in use.
 *
 * Adding a namespace here is cheap; forgetting one is a runtime `MISSING_MESSAGE` throw inside a
 * client component. `tests/client-namespaces.test.ts` walks the client module graph and fails the
 * build if the two ever disagree, so trust the test rather than this comment.
 */
export const CLIENT_MESSAGE_NAMESPACES = [
  'A11y',
  'Account',
  'Appointments',
  'BlogPage',
  'BookingForm',
  'Cart',
  'Checkout',
  'LanguageSwitcher',
  'Navigation',
  'Promotions',
  'Search',
  'ServiceCarousel',
] as const;

export type ClientMessageNamespace = (typeof CLIENT_MESSAGE_NAMESPACES)[number];

/** Client namespaces read by the layout subtree. The graph test proves this list stays complete. */
export const LAYOUT_CLIENT_NAMESPACES = [
  'Account',
  'LanguageSwitcher',
  'Navigation',
  'Search',
] as const;

/** Narrows `getMessages()` output to the requested client namespaces, dropping the rest. */
export function pickClientMessages(
  messages: AbstractIntlMessages,
  namespaces: readonly ClientMessageNamespace[],
): AbstractIntlMessages {
  const picked: Record<string, AbstractIntlMessages[string]> = {};

  for (const namespace of namespaces) {
    const value = messages[namespace];
    if (value !== undefined) picked[namespace] = value;
  }

  return picked;
}
