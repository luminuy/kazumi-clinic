# Performance & Accessibility — สถานะ, สิ่งที่ลองแล้ว, และอะไรเหลือ

ไฟล์นี้เป็น **จุดส่งไม้ต่อของงาน perf/a11y** — ใครมารับงานต่อ อ่านไฟล์นี้ไฟล์เดียวพอ

> ⚠️ **สิ่งที่มีค่าที่สุดในไฟล์นี้คือหัวข้อ "ลองแล้วไม่ได้ผล"** ไม่ใช่หัวข้อ "ทำแล้ว" · ทุกบรรทัดในนั้นคือการทดลองที่วัดจริงแล้วล้มเหลว — ถ้าไม่อ่าน จะเสียเวลาทำซ้ำทั้งหมด (มีอันหนึ่งที่ deploy ขึ้น production ไปแล้วต้อง revert)

---

## คะแนนล่าสุด

**PageSpeed Insights, `https://kazumiclinic.skin/`, เก็บ 2026-08-04 12:44 GMT+7** (Lighthouse 13.4.1, Emulated Moto G Power)

| | Performance | Accessibility | Best Practices | SEO | Agentic Browsing |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Desktop** | **100** | **100** | **100** | **100** | 3/3 |
| **Mobile** | **82** | **100** | **100** | **100** | 3/3 |

Mobile metrics: FCP 2.1s · **LCP 4.4s** · TBT 40ms · CLS 0.047 · SI 3.3s

คะแนน Performance mobile ติดที่ **LCP อย่างเดียว** — คำนวณย้อนกลับได้: FCP 0.85×10 + SI 0.92×10 + **LCP 0.38×25** + TBT 1.00×30 + CLS ~1.00×25 ≈ 82 · ถ้า LCP ลงมาที่ ~2.9s จะได้ ~90

---

## ทำอะไรไปแล้ว (2026-08-03 → 08-04)

| PR | เรื่อง | ผลที่วัดได้ |
| --- | --- | --- |
| [#307](https://github.com/luminuy/kazumi-clinic/pull/307) | `public/_headers` ให้ `/_next/static/*` เป็น `immutable` + แก้ `.service-stream-rail` auto-scroll | static asset เดิมเป็น `max-age=0, must-revalidate` ทุกไฟล์ · rail เลิก auto-scroll 72px ตอน layout แรกบนเดสก์ท็อป |
| [#309](https://github.com/luminuy/kazumi-clinic/pull/309) | ส่งเฉพาะ i18n namespace ที่ client component อ่านจริง | HTML ทุกหน้า **−32KB raw / −5KB gzip** · TBT ในการวัดรอบนั้น 610ms → 80ms |
| [#310](https://github.com/luminuy/kazumi-clinic/pull/310) | favicon 1500px 315KB ที่โหลดสองรอบ | น้ำหนักหน้า **1,456KB → 833KB (−43%)** |
| [#313](https://github.com/luminuy/kazumi-clinic/pull/313) [#314](https://github.com/luminuy/kazumi-clinic/pull/314) | `<dl>` ที่ห่อ `<details>` + คอนทราสต์ 25 จุด | **Accessibility 90 → 100** · Agent Accessibility ผ่าน |
| [#315](https://github.com/luminuy/kazumi-clinic/pull/315) | GA4 แบบเปิดด้วยตัวแปร | ยัง inert — ดูหัวข้อ "ค้างรอเจ้าของ" |
| [#317](https://github.com/luminuy/kazumi-clinic/pull/317) | เมนูแฮมเบอร์เกอร์มือถือ (Base UI Dialog) เป็น `next/dynamic` | JS ที่ต้อง parse ก่อน hydrate **−59KB raw / −18.4KB gzip (−9%)** ทุกหน้าสาธารณะ · HTML หน้าแรก −15.7KB raw · A/B localhost 3 รอบ/ฝั่ง: score median **66 → 86**, LCP median **3,890 → 3,722ms**, TBT median 933 → 175ms (ทุกรอบของฝั่งใหม่ดีกว่าทุกรอบของฝั่งเก่า) |

ผลรวม: Desktop จาก **"Error!" (`NO_LCP`) → 100** · Accessibility **90 → 100** · Mobile ยังไม่ถึงเป้า

---

## 🔴 ลองแล้วไม่ได้ผล — อย่าทำซ้ำ

ทุกอันวัดแบบ A/B จริง ไม่ใช่ความเห็น

| สิ่งที่ลอง | สมมุติฐาน | ผลจริง |
| --- | --- | --- |
| **proxy รูปมา origin เดียวกัน** ([#311](https://github.com/luminuy/kazumi-clinic/pull/311) → revert [#312](https://github.com/luminuy/kazumi-clinic/pull/312)) | ตัด DNS+TCP+TLS ของ `res.cloudinary.com` ที่ขวางหน้ารูป LCP | **แย่ลงทั้งคู่** — FCP median 2,622 → 3,166ms, LCP 4,564 → 5,124ms (วัด 6 รอบ) · preload ของรูป hero อยู่ที่ byte 280 ของ HTML **ก่อน** `<link stylesheet>` ที่ byte 1351 → พอมา origin เดียวกันเลยแย่ง connection กับ CSS ที่บล็อกการ render |
| **`experimental.inlineCss`** | ตัด render-blocking stylesheet 2 ไฟล์ (Lighthouse บอกประหยัด 580ms) | เสมอตัว — LCP +39ms, FCP −9ms · แต่ HTML โต **41KB → 88KB gzip** · เคยลองมาแล้วครั้งหนึ่ง 2026-08-03 ผลเหมือนกัน |
| **บล็อกฟอนต์ทั้งหมด (101KB)** | ฟอนต์แย่งแบนด์วิดท์กับรูป LCP / font swap สร้าง LCP candidate ใหม่ | LCP −201ms (อยู่ในช่วง noise) · Render Delay ยัง 3,428ms |
| **บล็อก RSC prefetch ทั้งหมด (93KB, 25 request)** | prefetch แย่งแบนด์วิดท์ | ไม่ขยับ (LCP 4,326 → 4,564) |
| **ตัด `opacity: 0` ออกจาก `@keyframes hero-enter`** | element hero เริ่มที่โปร่งใส 100% → Chrome ไม่นับเป็น LCP candidate | ไม่ขยับ (LCP +201ms) · สมมุติฐานฟังขึ้นมากแต่ผิด |
| **`browserslist` สมัยใหม่ เพื่อตัด polyfill 13KB** | Next น่าจะ gate polyfill ด้วย browserslist | build ออกมา **เท่าเดิมเป๊ะ 1,137,986 bytes** — `next/dist/client/app-globals.js` `require()` polyfill แบบไม่มีเงื่อนไข |
| **`turbopack.resolveAlias` ชี้ polyfill ไปโมดูลเปล่า** | บังคับตัด polyfill ที่ browserslist ตัดไม่ได้ | polyfill ยังหลุดเข้า bundle อยู่ดี (alias ไม่ match relative require ภายใน dist ของ Next) |

---

## 🔑 กุญแจสำคัญที่คนถัดไปต้องเข้าใจก่อนลงมือ

**LCP 4.4s ไม่ใช่เวลาจริงที่ผู้ใช้เห็น** — ค่า `observed` จากทุกรอบที่วัดคือ:

```
observedFirstContentfulPaint: 778
observedLargestContentfulPaint: 778   ← เท่ากันเป๊ะ
```

หน้าเว็บจริงพ่นทุกอย่างพร้อมกันที่ ~0.8 วินาที · เลข 4.4s มาจาก **Lantern** ซึ่งเป็นโมเดลจำลองของ Lighthouse ที่เอา trace จริงมายืดใหม่บน Slow-4G + CPU ช้า 4 เท่า

แปลว่า **การไล่แก้ network (ลด request, ลด origin, ลดไบต์) จะไม่ขยับเลข** — ที่ Lantern คิดเป็นเวลากั้นการ paint คือ **JavaScript ที่หน้านี้ส่งไป hydrate** ต่างหาก · หน้าแรกส่ง JS ที่เบราว์เซอร์สมัยใหม่โหลดจริง **~191KB gzip / 12 chunk** (หลัง [#317](https://github.com/luminuy/kazumi-clinic/pull/317) · ก่อนหน้านั้น 211KB / 13) และ chunk เดียว (`react-dom`, 70KB gzip) กิน scripting หลักร้อย ms ทุกครั้ง — ดูตารางแจกแจงในหัวข้อ "อะไรเหลือ" ข้อ 1

นี่คือเหตุผลที่การทดลอง 6 อันข้างบนล้มหมด — มันแก้ผิดชั้น

---

## 📋 อะไรเหลือ

### 1. ลดขนาด JS bundle (งานจริง — ทางเดียวที่เหลือที่จะพา mobile ถึง 90)

ไม่ใช่ config flag · ต้องไล่ว่า client component ตัวไหนบนหน้าแรก**จำเป็นต้อง hydrate จริง**

⚠️ **ตัวเลข "244KB / 18 chunk" ที่เคยเขียนไว้ทำให้ประเมินสูงเกินจริง** — วัดของจริงทีละก้อน 2026-08-04 พบว่าในนั้นมี **polyfill 39.5KB gzip ที่ติดแอตทริบิวต์ `noModule`** อยู่ด้วย ซึ่ง Chrome (และ Lighthouse) **ไม่โหลดเลย** · JS ที่เบราว์เซอร์สมัยใหม่โหลดจริงคือ ~211KB gzip / 13 ก้อน และหลัง [#317](https://github.com/luminuy/kazumi-clinic/pull/317) เหลือ **191KB / 12 ก้อน**

แจกแจงตามเจ้าของ (gzip, วัดหลัง #317):

| ก้อน | คือใคร | ลดได้ไหม |
| --- | --- | --- |
| 70.5KB | `react-dom` | ❌ ตายตัว |
| 37.3KB | react-server-dom (ตัวอ่าน RSC flight payload) | ❌ ตายตัว |
| 12.8 + 9.2 + 8.9 + 4.5 + 4.2 + 2.3 + 1.5KB | router / next-runtime / `next/image` / turbopack runtime | ❌ ตายตัว |
| **20.0KB** | โค้ด client ของเราเอง (HeaderActions, LanguageSwitcher, ปุ่มเมนู, cloudinary loader) | 🟡 |
| **12.0KB** | `next-intl` client runtime + `@formatjs/intl-messageformat` | 🟡 |
| **8.5KB** | `clsx` + `tailwind-merge` (ผ่าน `cn()`) | 🟡 |

⇒ **framework กินไป ~152KB (79%)** เหลือส่วนที่โค้ดเราคุมได้จริงแค่ ~40KB gzip · "ลด JS 30-40%" เป็นไปไม่ได้ในทางเลข ให้ตั้งเป้าที่ *ลดงาน parse/hydrate* แทนการไล่ไบต์

ที่ยังพอมีเนื้อ เรียงตามความคุ้ม:

1. **ถอด `next-intl` ออกจาก client bundle ของหน้าสาธารณะ** (−12KB gzip + JSON ใน HTML อีก ~22KB raw) — วิธี: ให้ client component รับข้อความเป็น prop แทน `useTranslations()` (แบบที่ [components/map-embed.tsx](../components/map-embed.tsx) กับ [components/mobile-menu-sheet.tsx](../components/mobile-menu-sheet.tsx) ทำอยู่) แล้วย้าย `NextIntlClientProvider` ลงไปไว้เฉพาะหน้าที่ต้องใช้จริง (cart / checkout / account / search / blog) · ⚠️ ตัวที่ยากคือ `search-modal` กับ `login-modal` ซึ่งอยู่บน header ของทุกหน้า — ถ้าถอด provider ออกจาก layout ต้องแก้สองตัวนี้ให้รับ prop ก่อน ไม่งั้นพังตอน runtime
2. `components/service-carousel.tsx` — autoplay carousel มี `useLayoutEffect` + `setInterval` + scroll handler · การ์ด 9 ใบ hydrate ทั้งชุด
3. `components/promotion-card-grid.tsx`, `components/promotion-carousel.tsx` — ตรรกะ client ตัวเดียวคือเปิด/ปิดปุ่มลูกศรตามตำแหน่ง scroll ซึ่งทำด้วย CSS ล้วนได้

คำถามที่ควรถาม: อันไหนแปลงเป็น server component ได้, อันไหน `next/dynamic` ได้, อันไหน CSS ล้วนแทนได้ (แบบที่ [#306](https://github.com/luminuy/kazumi-clinic/pull/306) ทำกับ `reveal`)

> ⚠️ ก่อนแตะ `service-carousel.tsx` อ่าน §0.5 ของ [CLAUDE.md](../CLAUDE.md) เรื่อง rail กับ `scroll-snap` ก่อน — ไฟล์นี้เคยทำ LCP พังมาแล้วสองรอบด้วยคนละสาเหตุ

### 2. ปิด Cloudflare Web Analytics (เจ้าของกดเอง — agent ทำไม่ได้)

Cloudflare dashboard → **Analytics & Logs → Web Analytics**

beacon ตัวนี้ครองเส้นทางที่ยาวที่สุดใน network dependency tree คนเดียว: `document → beacon.min.js → /cdn-cgi/rum` = **659ms** จาก max critical path 659ms · ตัดออกแล้วเส้นทางยาวสุดเหลือ ~397ms (ฟอนต์) และ audit `Use efficient cache lifetimes` หายไปด้วย (มันฟ้อง beacon ตัวนี้ตัวเดียว)

**หลังปิดแล้วต้องทำต่อ**: ลบ `https://static.cloudflareinsights.com` (script-src) และ `https://cloudflareinsights.com` (connect-src) ออกจาก CSP ใน [next.config.mjs](../next.config.mjs)

### 3. ปุ่ม LINE ตกเกณฑ์คอนทราสต์ (รอเจ้าของตัดสิน)

ขาวบน `--mint` `#06c755` = **2.26:1** (ต้องการ 4.5:1) · เป็นจุดเดียวที่เหลือในทั้งเว็บหลัง #313/#314 · แต่ `#06c755` คือสีแบรนด์ LINE จริง และ [CLAUDE.md](../CLAUDE.md) §0.4 ระบุว่า `--mint` เท่ากับ `--line` โดยตั้งใจ

ทางเลือก: (ก) พื้นปุ่มเป็น `--forest` `#006e2b` + อักษรขาว = 6.43:1 · (ข) คงเขียว LINE เปลี่ยนอักษรเป็นสีเข้ม · (ค) ปล่อยไว้ — **เป็น CTA หลักของธุรกิจ อย่าเปลี่ยนเองโดยไม่ถาม**

### 4. GA4 — ยัง inert ([#315](https://github.com/luminuy/kazumi-clinic/pull/315))

โค้ดอยู่บน production แล้วแต่ไม่โหลดอะไรเลยจนกว่าจะตั้ง `GA_MEASUREMENT_ID` เป็น **GitHub repository variable** (ไม่ใช่ `wrangler.jsonc` — ดู [infrastructure.md](./infrastructure.md))

⚠️ **GA4 จะทำให้คะแนนแย่ลง** วัดแล้ว: `gtag.js` = **148KB** บนสาย / 418KB หลังคลาย เทียบกับ Cloudflare beacon 11KB / 32KB — **หนักกว่า 13 เท่า** · ถ้าเปิด GA4 ให้เตรียมใจว่า mobile จะหล่นจาก 82 · เปลี่ยน `afterInteractive` → `lazyOnload` ใน [components/google-analytics.tsx](../components/google-analytics.tsx) ช่วยได้บ้าง แลกกับความแม่นของ bounce rate

⚠️ **PDPA**: GA4 เก็บ IP + พฤติกรรม = ข้อมูลส่วนบุคคล และเว็บยังไม่มี cookie consent banner · Cloudflare Web Analytics ไม่ใช้คุกกี้จึงไม่มีปมนี้ แต่ GA4 มี — ต้องตัดสินใจก่อนเปิด

### 5. ของที่ **ไม่ต้องทำ** (ติดป้าย Unscored ใน Lighthouse — ไม่ขยับคะแนน)

`Legacy JavaScript` (13KB) · `Reduce unused JavaScript` (22KB, อยู่ในก้อน react-dom) · `Use efficient cache lifetimes` (5KB, เป็น beacon ของ Cloudflare) · `Avoid non-composited animations` (จุดบอกตำแหน่ง carousel transition `width` — แก้ได้แต่ต้องรื้อวิธีวางจุดทั้งแถว) · `Avoid long main-thread tasks`

---

## 🔬 วิธีวัด — และกับดักที่เสียเวลาไปมากที่สุด

### กับดัก 1: เครื่อง dev นี้วัด TBT ไม่ได้

รัน Lighthouse URL เดียวกัน 5 รอบได้ TBT **70ms, 90ms, 1210ms, 1480ms, 2600ms** — เพราะ Chrome ของเจ้าของเปิดค้าง 22 process แย่ง CPU

**ใช้ได้**: FCP/LCP median จากอย่างน้อย 3 รอบ · **ใช้ไม่ได้**: TBT, Speed Index, คะแนนรวม

### กับดัก 2: PSI quota หมดวันละเร็วมาก

`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?...` แบบไม่มี API key ตอบ **429 `Quota exceeded ... per day`** หลังยิงไม่กี่ครั้ง และ **รีเซ็ตตามเวลา Pacific ไม่ใช่เวลาไทย** (= ~14:00 น. บ้านเรา) · หน้าเว็บ PSI ก็ใช้ quota เดียวกัน จะค้างที่ "Running analysis"

→ ถ้าจะวัดถี่ ๆ ต้องขอ API key หรือให้เจ้าของกดเอง

### กับดัก 3: แท็บที่ไม่ visible ไม่มีวัน fire LCP

`document.visibilityState === 'hidden'` → `PerformanceObserver` ของ `largest-contentful-paint` จะไม่ยิงเลย · in-app browser pane เป็น hidden — เกือบวินิจฉัยผิดเพราะข้อนี้ · ใช้ headless Chrome ผ่าน CDP แทน (headless นับเป็น visible)

### กับดัก 4: สคริปต์วัดคอนทราสต์ที่อ่านสีด้วย regex จะมองไม่เห็นของจริง

Chrome คืนสีที่มี alpha มาเป็น **`oklab(...)`** ไม่ใช่ `rgba()` · parser แบบ regex จะดึงตัวเลขผิดแล้วได้ ratio มั่ว → **ต้อง resolve ผ่าน canvas** (`ctx.fillStyle = css` แล้ว `getImageData`) และ composite ทับพื้นหลังจริงเหมือนเบราว์เซอร์

ตารางที่ได้จากการวัด (ใช้ตัดสินใจได้เลย):

- `--ink` / `--foreground` ต้อง alpha **≥65%** ถึงผ่าน 4.5:1 (60% = 4.35–4.48 ตกแบบเฉียดฉิว)
- `--store-muted` / `--olive-light` **ห้ามใส่ alpha เลย** (0.8 ยังได้แค่ 3.39)

### กับดัก 5: หน้าเว็บบนเครื่อง dev เรนเดอร์ไม่ครบ

ไม่มี binding D1 → ไม่มีรูป hero, ไม่มีสินค้า, `/filler` มี `<img>` 0 ตัว · **การสแกน a11y/perf บน localhost จะพลาดของจริง** — เจอมาแล้ว: `text-[var(--store-ink)]/40` ในฟอร์มล็อกอินโผล่เฉพาะตอนสแกน production ([#314](https://github.com/luminuy/kazumi-clinic/pull/314))

→ สแกนบน production เสมอ แต่อย่าลืมยิงซ้ำ 2-3 ครั้งเพราะ ISR เสิร์ฟของเก่าในครั้งแรก

### ท่าที่ใช้ได้จริง

- **A/B ที่เชื่อได้**: build สองเวอร์ชัน → `next start` → Lighthouse 3 รอบต่อเวอร์ชัน → เทียบ **median ของ FCP/LCP** · localhost ตัด noise ของ ISP ออก และ FCP นิ่งระดับ spread 33ms
- **ตัดตัวแปรโดยไม่ต้อง build ใหม่**: `npx lighthouse <url> --blocked-url-patterns='*.woff2'` (หรือ `'*_rsc=*'`) — พิสูจน์ได้ว่า *อะไรไม่ใช่สาเหตุ* เร็วมาก
- **ดู `observed*` ใน `audits.metrics` เสมอ ก่อนเชื่อเลขที่ Lighthouse โชว์** — ถ้า observed FCP = observed LCP แปลว่าปัญหาอยู่ในโมเดลจำลอง ไม่ใช่ในหน้าเว็บ
- **จับ auto-scroll ของ rail**: ดักที่ `addEventListener('scroll', …, {capture: true})` ผ่าน CDP `Page.addScriptToEvaluateOnNewDocument` ตั้งแต่ก่อน navigate · scroll event ใด ๆ ที่เกิดก่อนโค้ด carousel ทำงาน = บั๊ก
