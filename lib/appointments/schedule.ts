import { site } from '@/lib/site';

export const APPOINTMENT_SLOT_MINUTES = 30;
export const APPOINTMENT_DEFAULT_DURATION_MINUTES = 60;
export const APPOINTMENT_MAX_ADVANCE_DAYS = 60;
export const APPOINTMENT_MIN_LEAD_HOURS = 2;

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

type DateParts = { year: number; month: number; day: number };
type TimeParts = { hour: number; minute: number };

function parseDateIso(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function parseTime(value: string): TimeParts | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

function minutesOfDay(value: string): number | null {
  const parts = parseTime(value);
  return parts ? parts.hour * 60 + parts.minute : null;
}

function formatMinutes(value: number): string {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function bangkokDateIso(now: Date): string {
  return new Date(now.getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}

function calendarDay(dateIso: string): number | null {
  const parts = parseDateIso(dateIso);
  return parts ? Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_MS : null;
}

/** Resolves a calendar date against the clinic's single source of truth for opening hours. */
export function hoursForDate(dateIso: string): { open: string; close: string } | null {
  const parts = parseDateIso(dateIso);
  if (!parts) return null;
  const dayName = DAY_NAMES[new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()];
  const hours = site.hours.find((entry) => entry.day === dayName);
  return hours ? { open: hours.open, close: hours.close } : null;
}

/** Builds only starts that fit fully inside the clinic's opening window. */
export function generateTimeSlots({
  dateIso,
  durationMinutes = APPOINTMENT_DEFAULT_DURATION_MINUTES,
  now = new Date(),
}: {
  dateIso: string;
  durationMinutes?: number;
  now?: Date;
}): string[] {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return [];
  const hours = hoursForDate(dateIso);
  if (!hours) return [];
  const open = minutesOfDay(hours.open);
  const close = minutesOfDay(hours.close);
  if (open === null || close === null || close <= open) return [];

  const slots: string[] = [];
  for (
    let start = open;
    start + durationMinutes <= close;
    start += APPOINTMENT_SLOT_MINUTES
  ) {
    const time = formatMinutes(start);
    const epochMs = toEpochMs(dateIso, time);
    if (Number.isFinite(epochMs) && epochMs >= now.getTime()) slots.push(time);
  }
  return slots;
}

/** Validates a public request against the same rules that generated the selectable slots. */
export function isValidRequestedSlot({
  dateIso,
  time,
  durationMinutes = APPOINTMENT_DEFAULT_DURATION_MINUTES,
  now = new Date(),
}:
  {
    dateIso: string;
    time: string;
    durationMinutes?: number;
    now?: Date;
  }): { ok: true } | { ok: false; reason: string } {
  const requestedDay = calendarDay(dateIso);
  const today = calendarDay(bangkokDateIso(now));
  if (requestedDay === null || today === null || !parseTime(time)) {
    return { ok: false, reason: 'วันที่หรือเวลาไม่ถูกต้อง' };
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { ok: false, reason: 'ระยะเวลานัดหมายไม่ถูกต้อง' };
  }

  const advanceDays = requestedDay - today;
  if (advanceDays < 0) return { ok: false, reason: 'ไม่สามารถเลือกวันที่ผ่านมาแล้วได้' };
  if (advanceDays > APPOINTMENT_MAX_ADVANCE_DAYS) {
    return {
      ok: false,
      reason: `เลือกวันนัดหมายล่วงหน้าได้ไม่เกิน ${APPOINTMENT_MAX_ADVANCE_DAYS} วัน`,
    };
  }

  const start = toEpochMs(dateIso, time);
  if (!Number.isFinite(start) || start < now.getTime()) {
    return { ok: false, reason: 'ไม่สามารถเลือกเวลาที่ผ่านมาแล้วได้' };
  }
  if (start - now.getTime() < APPOINTMENT_MIN_LEAD_HOURS * 60 * MINUTE_MS) {
    return {
      ok: false,
      reason: `กรุณาเลือกเวลาล่วงหน้าอย่างน้อย ${APPOINTMENT_MIN_LEAD_HOURS} ชั่วโมง`,
    };
  }

  const hours = hoursForDate(dateIso);
  const requested = minutesOfDay(time);
  const open = hours ? minutesOfDay(hours.open) : null;
  const close = hours ? minutesOfDay(hours.close) : null;
  if (
    !hours ||
    requested === null ||
    open === null ||
    close === null ||
    requested < open ||
    requested + durationMinutes > close ||
    (requested - open) % APPOINTMENT_SLOT_MINUTES !== 0
  ) {
    return { ok: false, reason: 'เวลาที่เลือกอยู่นอกเวลาทำการของคลินิก' };
  }

  return { ok: true };
}

/** Converts a Bangkok wall-clock value to an absolute instant (Thailand has no DST). */
export function toEpochMs(dateIso: string, time: string): number {
  const date = parseDateIso(dateIso);
  const clock = parseTime(time);
  if (!date || !clock) return Number.NaN;
  return (
    Date.UTC(date.year, date.month - 1, date.day, clock.hour, clock.minute) -
    BANGKOK_OFFSET_MS
  );
}

/** Formats the confirmed instant in the customer's language and the clinic's timezone. */
export function formatAppointmentDateTime(epochMs: number, locale: 'th' | 'en'): string {
  const date = new Date(epochMs);
  const intlLocale = locale === 'th' ? 'th-TH' : 'en-US';
  const dateText = date.toLocaleDateString(intlLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  });
  const timeText = date.toLocaleTimeString(intlLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Bangkok',
  });
  return locale === 'th' ? `${dateText} เวลา ${timeText} น.` : `${dateText} at ${timeText}`;
}

/** Half-open ranges touching at an edge do not conflict. */
export function rangesOverlap(
  aStart: number,
  aDuration: number,
  bStart: number,
  bDuration: number,
): boolean {
  return aStart < bStart + bDuration * MINUTE_MS && bStart < aStart + aDuration * MINUTE_MS;
}
