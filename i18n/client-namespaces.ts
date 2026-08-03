import type { AbstractIntlMessages } from 'next-intl';

/**
 * The message namespaces that have to cross the server/client boundary.
 *
 * `getMessages()` returns every namespace in `messages/<locale>.json`, and handing that whole
 * object to `NextIntlClientProvider` serialises all of it into the RSC flight payload embedded in
 * the HTML — on *every* page. Measured on production 2026-08-03: the home page shipped the
 * checkout copy, the order-history screens, the blog index and all nine service-page namespaces,
 * ~15KB of JSON that nothing on that page can ever read.
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

/** Narrows `getMessages()` output to {@link CLIENT_MESSAGE_NAMESPACES}, dropping the rest. */
export function pickClientMessages(messages: AbstractIntlMessages): AbstractIntlMessages {
  const picked: Record<string, AbstractIntlMessages[string]> = {};

  for (const namespace of CLIENT_MESSAGE_NAMESPACES) {
    const value = messages[namespace];
    if (value !== undefined) picked[namespace] = value;
  }

  return picked;
}
