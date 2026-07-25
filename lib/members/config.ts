/**
 * Tunable settings for the member/checkout flow. One place to change money rules so no percentage
 * or currency string is hardcoded across the order logic.
 */

/** Deposit as a percent of the cart subtotal, for the "มัดจำ" fulfillment option. Adjust freely. */
export const DEPOSIT_PERCENT = 20;

/** ISO currency for all orders. The catalog is THB-only today. */
export const CURRENCY = 'THB';

/**
 * How long a guest checkout's order confirmation link (/account/orders/[id]) stays viewable by
 * anyone holding it — it carries the customer's name/phone/email/note with no re-authentication.
 * After this window the page 404s; the customer still has the order (contact the clinic via LINE
 * with the order id), it just isn't link-bearer-accessible forever.
 */
export const GUEST_ORDER_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** A plain (non-component) helper so the impure Date.now() read doesn't happen inside a Server
 *  Component's render body — react-hooks/purity flags that even though this page is already
 *  force-dynamic and genuinely needs a fresh clock read on every request. */
export function isGuestOrderLinkExpired(createdAt: number): boolean {
  return Date.now() - createdAt > GUEST_ORDER_LINK_TTL_MS;
}

/** Rounds a satang subtotal to the deposit amount (whole satang, rounded to the nearest baht). */
export function depositSatang(subtotalSatang: number): number {
  const raw = (subtotalSatang * DEPOSIT_PERCENT) / 100;
  // Round to the nearest whole baht so the customer sees a clean deposit figure.
  return Math.round(raw / 100) * 100;
}
