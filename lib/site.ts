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
