// Single source of truth for business info — import this everywhere instead of hardcoding.
// TODO: replace `url` with the real production domain once it's registered.
export const site = {
  name: 'Kazumi Clinic',
  nameTh: 'คาซึมิ คลินิก',
  tagline: 'Where balance purity becomes eternal beauty.',
  taglineJa: '純粋さは永遠の美へ',
  taglineTh: 'Minimal Change. Maximum Confidence.',
  description:
    'Kazumi Clinic สถานเสริมความงามย่านสุขุมวิท กรุงเทพฯ ให้บริการฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ และ IV Drip วิตามิน โดยแพทย์ผู้เชี่ยวชาญ',
  url: 'https://kazumiclinic.com',
  phone: '081-712-7486',
  phoneIntl: '+66817127486',
  lineUrl: 'https://lin.ee/1tshhNn',
  instagram: 'https://instagram.com/kazumiclinic',
  instagramHandle: '@kazumiclinic',
  facebook: 'https://www.facebook.com/kazumiclinicskin/',
  address: {
    line1: '1558 โครงการไดมอนด์คอนโด',
    street: 'ถนนสุขุมวิท',
    subdistrict: 'แขวงพระโขนงเหนือ',
    district: 'เขตคลองเตย',
    province: 'กรุงเทพมหานคร',
    postalCode: '10110',
    country: 'TH',
  },
  addressFull:
    '1558 โครงการไดมอนด์คอนโด ถนนสุขุมวิท แขวงพระโขนงเหนือ เขตคลองเตย กรุงเทพมหานคร 10110',
  geo: {
    // TODO: confirm exact lat/lng from Google Business Profile (approximate Diamond Condo Sukhumvit location for now)
    lat: 13.7053,
    lng: 100.5875,
  },
  license: 'มสพ.สบส.338/2569',
  hours: [
    { day: 'Monday', open: '09:00', close: '22:00' },
    { day: 'Tuesday', open: '09:00', close: '22:00' },
    { day: 'Wednesday', open: '09:00', close: '22:00' },
    { day: 'Thursday', open: '09:00', close: '22:00' },
    { day: 'Friday', open: '09:00', close: '22:00' },
    { day: 'Saturday', open: '09:00', close: '22:00' },
    { day: 'Sunday', open: '09:00', close: '17:00' },
  ],
} as const;

type DayName = (typeof site.hours)[number]['day'];

const dayLabelsTh: Record<DayName, { long: string; short: string }> = {
  Monday: { long: 'จันทร์', short: 'จ' },
  Tuesday: { long: 'อังคาร', short: 'อ' },
  Wednesday: { long: 'พุธ', short: 'พ' },
  Thursday: { long: 'พฤหัสบดี', short: 'พฤ' },
  Friday: { long: 'ศุกร์', short: 'ศ' },
  Saturday: { long: 'เสาร์', short: 'ส' },
  Sunday: { long: 'อาทิตย์', short: 'อา' },
};

export type HoursStyle = 'long' | 'short';

export type HoursLine = { days: string; time: string };

// '09:00' → '9:00' — schema.org needs the padded 24h form, Thai copy reads better without it.
function formatTime(time: string) {
  return time.replace(/^0/, '');
}

function formatDays(days: DayName[], style: HoursStyle) {
  const label = (day: DayName) => dayLabelsTh[day][style];
  if (days.length === 1) return label(days[0]);
  if (days.length === 2) return `${label(days[0])}, ${label(days[1])}`;
  return `${label(days[0])}–${label(days[days.length - 1])}`;
}

/**
 * Collapses `site.hours` into display lines, merging runs of days that share the same
 * open/close — e.g. `[{ days: 'จันทร์–เสาร์', time: '9:00–22:00' }, { days: 'อาทิตย์', … }]`.
 * Runs are found over adjacent entries, so `site.hours` must stay in week order.
 */
export function hoursLines(style: HoursStyle = 'long'): HoursLine[] {
  const groups: { days: DayName[]; open: string; close: string }[] = [];

  for (const hour of site.hours) {
    const current = groups[groups.length - 1];
    if (current && current.open === hour.open && current.close === hour.close) {
      current.days.push(hour.day);
    } else {
      groups.push({ days: [hour.day], open: hour.open, close: hour.close });
    }
  }

  return groups.map((group) => ({
    days: formatDays(group.days, style),
    time: `${formatTime(group.open)}–${formatTime(group.close)}`,
  }));
}

/** Same grouping as `hoursLines`, flattened into one sentence for prose and JSON-LD. */
export function hoursText(style: HoursStyle = 'long', separator = ' และ '): string {
  return hoursLines(style)
    .map((line) => `${line.days} ${line.time}`)
    .join(separator);
}
