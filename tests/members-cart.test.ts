import { describe, expect, it } from 'vitest';
import { clampQty } from '@/lib/members/cart';

// Covers the JS-side quantity bound used for a fresh cart-item insert and for a direct
// setItemQty call. Does NOT cover the SQL-level `MIN(99, quantity + excluded.quantity)` clamp
// applied on the merge-on-conflict path in addItem — that runs inside D1 itself and would need a
// SQLite-compatible test double this repo doesn't have yet.
describe('clampQty', () => {
  it('keeps an in-range integer unchanged', () => {
    expect(clampQty(5)).toBe(5);
  });

  it('floors a positive non-integer', () => {
    expect(clampQty(3.9)).toBe(3);
  });

  it('clamps anything below 1 up to 1', () => {
    expect(clampQty(0)).toBe(1);
    expect(clampQty(-5)).toBe(1);
  });

  it('clamps anything above the 99 cap down to 99', () => {
    expect(clampQty(100)).toBe(99);
    expect(clampQty(1_000_000)).toBe(99);
  });

  it('falls back to 1 for non-finite input (NaN, Infinity)', () => {
    expect(clampQty(NaN)).toBe(1);
    expect(clampQty(Infinity)).toBe(1);
    expect(clampQty(-Infinity)).toBe(1);
  });
});
