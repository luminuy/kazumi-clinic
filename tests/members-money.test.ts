import { describe, expect, it } from 'vitest';
import { DEPOSIT_PERCENT, depositSatang } from '@/lib/members/config';
import { computeAmounts } from '@/lib/members/orders';

describe('depositSatang', () => {
  it('rounds to the nearest whole baht (100 satang)', () => {
    // 12345 * 20% = 2469 satang -> rounds to 2500 (nearest 100)
    expect(depositSatang(12345)).toBe(2500);
  });

  it('is exact for a subtotal that already divides evenly', () => {
    expect(depositSatang(10000)).toBe((10000 * DEPOSIT_PERCENT) / 100);
  });

  it('returns 0 for a zero subtotal', () => {
    expect(depositSatang(0)).toBe(0);
  });

  it('rounds a near-boundary amount down when closer to the lower baht', () => {
    // 1049 * 20% = 209.8 -> nearest 100 is 200
    expect(depositSatang(1049)).toBe(200);
  });
});

describe('computeAmounts', () => {
  it('booking_request owes nothing now, regardless of subtotal', () => {
    expect(computeAmounts('booking_request', 500000)).toEqual({ deposit: 0, amountDue: 0 });
  });

  it('deposit fulfillment owes exactly the computed deposit', () => {
    const { deposit, amountDue } = computeAmounts('deposit', 10000);
    expect(deposit).toBe(depositSatang(10000));
    expect(amountDue).toBe(deposit);
  });

  it('full_payment owes the whole subtotal with no separate deposit tracked', () => {
    expect(computeAmounts('full_payment', 12345)).toEqual({ deposit: 0, amountDue: 12345 });
  });

  it('a zero subtotal owes nothing under any fulfillment', () => {
    expect(computeAmounts('deposit', 0)).toEqual({ deposit: 0, amountDue: 0 });
    expect(computeAmounts('full_payment', 0)).toEqual({ deposit: 0, amountDue: 0 });
  });
});
