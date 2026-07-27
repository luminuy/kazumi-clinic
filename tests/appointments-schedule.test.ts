import { describe, expect, it } from 'vitest';
import {
  generateTimeSlots,
  isValidRequestedSlot,
  rangesOverlap,
  toEpochMs,
} from '@/lib/appointments/schedule';

describe('appointment schedule', () => {
  it('generates weekday slots across 09:00–22:00', () => {
    const slots = generateTimeSlots({
      dateIso: '2026-08-03',
      now: new Date('2026-08-01T00:00:00Z'),
    });
    expect(slots[0]).toBe('09:00');
    expect(slots.at(-1)).toBe('21:00');
    expect(slots).toHaveLength(25);
  });

  it('generates Sunday slots across 09:00–17:00', () => {
    const slots = generateTimeSlots({
      dateIso: '2026-08-02',
      now: new Date('2026-08-01T00:00:00Z'),
    });
    expect(slots[0]).toBe('09:00');
    expect(slots.at(-1)).toBe('16:00');
    expect(slots).toHaveLength(15);
  });

  it('removes starts that have already passed today in Bangkok', () => {
    const slots = generateTimeSlots({
      dateIso: '2026-08-03',
      now: new Date('2026-08-03T05:10:00Z'), // 12:10 in Bangkok
    });
    expect(slots[0]).toBe('12:30');
    expect(slots).not.toContain('12:00');
  });

  it('does not let an appointment finish after closing', () => {
    const slots = generateTimeSlots({
      dateIso: '2026-08-02',
      durationMinutes: 60,
      now: new Date('2026-08-01T00:00:00Z'),
    });
    expect(slots.at(-1)).toBe('16:00');
    expect(slots).not.toContain('16:30');
  });

  it.each([
    ['past date', '2026-08-02', '15:00'],
    ['more than 60 days ahead', '2026-10-03', '15:00'],
    ['less than two hours ahead', '2026-08-03', '13:30'],
    ['outside opening hours', '2026-08-03', '22:00'],
  ])('rejects %s', (_label, dateIso, time) => {
    expect(
      isValidRequestedSlot({
        dateIso,
        time,
        now: new Date('2026-08-03T05:00:00Z'), // 12:00 in Bangkok
      }).ok,
    ).toBe(false);
  });

  it('accepts a normal slot', () => {
    expect(
      isValidRequestedSlot({
        dateIso: '2026-08-03',
        time: '15:00',
        now: new Date('2026-08-03T05:00:00Z'),
      }),
    ).toEqual({ ok: true });
  });
});

describe('rangesOverlap', () => {
  const start = toEpochMs('2026-08-03', '10:00');

  it('detects overlapping ranges', () => {
    expect(rangesOverlap(start, 60, start + 30 * 60_000, 60)).toBe(true);
  });

  it('does not treat touching edges as overlap', () => {
    expect(rangesOverlap(start, 60, start + 60 * 60_000, 30)).toBe(false);
  });

  it('detects a range contained inside another', () => {
    expect(rangesOverlap(start, 120, start + 30 * 60_000, 15)).toBe(true);
  });
});
