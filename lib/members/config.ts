/**
 * Tunable settings for the member/checkout flow. One place to change money rules so no percentage
 * or currency string is hardcoded across the order logic.
 */

/** Deposit as a percent of the cart subtotal, for the "มัดจำ" fulfillment option. Adjust freely. */
export const DEPOSIT_PERCENT = 20;

/** ISO currency for all orders. The catalog is THB-only today. */
export const CURRENCY = 'THB';

/** Rounds a satang subtotal to the deposit amount (whole satang, rounded to the nearest baht). */
export function depositSatang(subtotalSatang: number): number {
  const raw = (subtotalSatang * DEPOSIT_PERCENT) / 100;
  // Round to the nearest whole baht so the customer sees a clean deposit figure.
  return Math.round(raw / 100) * 100;
}
