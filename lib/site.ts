// Single source of truth for business info — import this everywhere instead of hardcoding.
// TODO: replace `url` with the real production domain once it's registered.
export const site = {
  name: 'Kazumi Clinic',
  nameTh: 'คาซึมิ คลินิก',
  // Cloudinary public IDs, not public/ paths — /admin replaces these, so they must not be
  // baked into the build. Render them through next/image or cld(); never glue site.url onto them.
  logo: 'kazumi-clinic/brand-logo',
  logoMark: 'kazumi-clinic/brand-mark',
  tagline: 'Where balance purity becomes eternal beauty.',
  taglineJa: '純粋さは永遠の美へ',
  taglineTh: 'Minimal Change. Maximum Confidence.',
  description:
    'Kazumi Clinic คลินิกความงามย่านสุขุมวิท กรุงเทพฯ ให้บริการฟิลเลอร์ โบท็อกซ์ IV Drip วิตามิน สกินบูสเตอร์ และคอลลาเจนบูสเตอร์ โดยแพทย์ประเมินและวางแผนการดูแลเฉพาะบุคคล',
  url: 'https://kazumiclinic.com',
  phone: '081-712-7486',
  phoneIntl: '+66817127486',
  phoneUrl: 'tel:+66817127486',
  lineUrl: 'https://lin.ee/1tshhNn',
  instagram: 'https://instagram.com/kazumiclinic',
  instagramHandle: '@kazumiclinic',
  facebook: 'https://www.facebook.com/kazumiclinicskin/',
  address: {
    line1: '1558 โครงการไดมอนด์คอนโด',
    street: 'ถนนสุขุมวิท',
    subdistrict: 'แขวงพระโขนงเหนือ',
    district: 'เขตวัฒนา',
    province: 'กรุงเทพมหานคร',
    postalCode: '10110',
    country: 'TH',
  },
  addressFull: '1558 โครงการไดมอนด์คอนโด ถนนสุขุมวิท แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพมหานคร 10110',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Kazumi%20Clinic%201558%20Sukhumvit%20Road%20Bangkok',
  mapsEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.1662424348838!2d100.59685397496709!3d13.708379298297611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29f0a7f2125af%3A0x69eb1dcf129ee74b!2sKazumi%20Clinic!5e0!3m2!1sth!2sth!4v1784213088666!5m2!1sth!2sth',
  geo: {
    lat: 13.708379298297611,
    lng: 100.59685397496709,
  },
  license: 'มสพ.สบส.338/2569',
  doctors: [
    {
      name: 'นายแพทย์ปราชญ์ อาชวนิจกุล',
      nickname: 'คุณหมอโอ๊ต',
      licenseNo: 'ว.75302',
      role: 'ผู้ออกแบบโปรแกรมฟิลเลอร์ปรับรูปหน้า',
    },
  ],
  hours: [
    { day: 'Monday', open: '09:00', close: '22:00' },
    { day: 'Tuesday', open: '09:00', close: '22:00' },
    { day: 'Wednesday', open: '09:00', close: '22:00' },
    { day: 'Thursday', open: '09:00', close: '22:00' },
    { day: 'Friday', open: '09:00', close: '22:00' },
    { day: 'Saturday', open: '09:00', close: '22:00' },
    { day: 'Sunday', open: '09:00', close: '17:00' },
  ],
  hoursDisplay: {
    weekdays: 'จันทร์–เสาร์ 9:00–22:00',
    sunday: 'อาทิตย์ 9:00–17:00',
    short: 'ทุกวัน 9:00–22:00 (อาทิตย์ 9:00–17:00)',
  },
} as const;

/**
 * True while the site is served from somewhere that isn't its real domain — currently the
 * workers.dev deploy that exists because kazumiclinic.com isn't confirmed ours yet.
 *
 * Everything SEO-facing (canonical, sitemap, JSON-LD @id) is built from `site.url`, so on a
 * preview host every one of those URLs points somewhere other than the page being served. That's
 * fine only as long as no crawler is allowed in — see app/robots.ts. Set by SITE_ENV in
 * wrangler.jsonc; remove that var when a real domain is pointed at the Worker.
 */
export function isPreviewDeploy() {
  return process.env.SITE_ENV === 'preview';
}
