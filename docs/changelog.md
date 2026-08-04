# Changelog — งานที่ปิดไปแล้ว

บันทึกงานที่ **เสร็จแล้ว** ย้ายออกมาจาก [STATUS.md](../STATUS.md) เพื่อให้ไฟล์นั้นเหลือแต่ "ตอนนี้/ต่อไป/ค้าง" · เรียงใหม่ → เก่า

> git log บอกสิ่งที่เสร็จอยู่แล้ว — ไฟล์นี้เก็บ **เหตุผลและบทเรียน** ที่ commit message ใส่ไม่หมด

---

## 2026-08-03/04 — รอบ perf + a11y: Desktop 100, Accessibility 100, Mobile ค้าง 82 (PR #307–#315)

**ผล**: Desktop Performance จาก **"Error!" (`NO_LCP`) → 100** · Accessibility **90 → 100** · Mobile Performance ยังไม่ถึงเป้า 90 (ได้ 82, ติดที่ LCP)

สถานะเต็ม ๆ + สิ่งที่ลองแล้วไม่ได้ผล + วิธีวัด อยู่ที่ **[performance.md](./performance.md)** — ไฟล์นั้นคือจุดส่งไม้ต่อ ไม่ใช่ไฟล์นี้

ที่ปิดไป:

- **#307** static asset ทุกไฟล์เสิร์ฟด้วย `max-age=0, must-revalidate` มาตลอด — `headers()` ใน `next.config.mjs` แตะไม่ถึงเพราะ asset ไม่วิ่งผ่าน Worker (พิสูจน์: response ไม่มี CSP header) ต้องใช้ `public/_headers` · พ่วงแก้ `.service-stream-rail` ที่ auto-scroll 72px ตอน layout แรก เฉพาะเดสก์ท็อป เพราะ padding จัดกึ่งกลางคำนวณจากคนละค่ากับความกว้างการ์ด
- **#309** `NextIntlClientProvider` ได้ messages ทั้งไฟล์ (32 namespace) แล้ว serialize ลง flight payload ของทุกหน้า — หน้าแรกแบกข้อความ checkout/ประวัติการจอง/บทความไปด้วย · ส่งเฉพาะ 12 namespace ที่ client component อ่านจริง ลด HTML ทุกหน้า 32KB · กันพลาดด้วยเทสต์ที่ไล่ import graph จากทุกไฟล์ `'use client'` แทนที่จะเชื่อลิสต์
- **#310** `/icon.png` เป็นไฟล์ 1500×1500 ขนาด 315KB **และโหลดสองรอบ** เพราะ `icons.shortcut` ชี้ URL เดียวกับ `icons.icon` → Chrome ยิงคนละ request · 617KB นี้มากกว่า JS + รูปทั้งหน้ารวมกัน และไม่มี Lighthouse audit ตัวไหนฟ้อง เจอจากการอ่าน network log ดิบ
- **#311 → revert #312** proxy รูปมา origin ตัวเอง — เหตุผลฟังขึ้นและมีข้อมูลรองรับ แต่วัดหลัง deploy 6 รอบแล้ว FCP/LCP แย่ลงทั้งคู่ ต้อง revert · บทเรียนอยู่ใน CLAUDE.md §0.5
- **#313 #314** `<dl>` ห่อ `<details>` ทำ accessibility tree เสีย + คอนทราสต์ตก AA 25 จุด → เหลือจุดเดียว (ปุ่ม LINE ซึ่งเป็นสีแบรนด์จริง รอเจ้าของตัดสิน)
- **#315** GA4 แบบเปิดด้วยตัวแปร — ยัง inert สนิท ยังไม่ตั้ง `GA_MEASUREMENT_ID`

**บทเรียนใหญ่สุดของรอบนี้**: `observedFCP` = `observedLCP` = **778ms** — หน้าเว็บจริงพ่นทุกอย่างพร้อมกัน · เลข LCP 4.4s มาจากโมเดลจำลอง Lantern ล้วน ๆ การไล่แก้ network จึงไม่ขยับอะไรเลย 6 การทดลองติด ที่เหลือคือ JS bundle

---

## 2026-07-25 — ต่อ Resend เป็น email provider (PR #264)

เลือก Resend เพราะฟรี 3,000 อีเมล/เดือน (100/วัน) เกินพอสำหรับปริมาณจริง (ลืมรหัสผ่าน + แจ้งสมัครซ้ำ) · ยิง REST API ตรงด้วย `fetch` ไม่ใช้ SDK แบบเดียวกับ `lib/cloudinary-upload.ts`

เจอ 2 บั๊กระหว่างต่อ ไม่ใช่แค่เสียบ provider: (1) ลิงก์รีเซ็ตเดิมสร้างจาก `site.url` (`kazumiclinic.com`) แทนที่จะเป็น origin ของ request จริง — จะ 404 ทันทีเพราะเว็บจริงยังอยู่ workers.dev แก้ด้วยวิธีเดียวกับ OAuth redirect URI (2) token creation + email send อยู่นอก try/catch ของตัวเอง → D1/Resend ล่มเฉพาะตอนอีเมลมีบัญชีจริงจะได้ 502 ต่างจาก 200 ของอีเมลไม่มีบัญชี = account-existence oracle ทางอ้อม

**landmine ที่เจอตอนเขียนเทสต์**: `import 'server-only'` ทำเทสต์เดิมพัง เพราะ package `server-only` ไม่เคยถูกติดตั้งจริง (ไม่เคยมีเทสต์ import ไฟล์ที่ใช้มันมาก่อน) — ติดตั้งจริง + alias ใน `vitest.config.ts` ไปโมดูลเปล่า แก้ให้ 3 ไฟล์พร้อมกัน · เจอปัญหาคล้ายกันกับ `i18n/routing.ts` ที่ดึง `next/navigation` เข้ามาโดยไม่ตั้งใจ แก้ด้วยการย้าย `type Locale` ไปอยู่คู่กับ `LOCALES`/`DEFAULT_LOCALE` ที่ `lib/site.ts` (แพทเทิร์นเดิมจากตอนแก้ sitemap)

เทสต์ 71 → 90 · ยังเชื่อมต่อจริงไม่ได้จนกว่าเจ้าของจะสมัคร Resend + ยืนยันโดเมน (ติดปัญหาเดียวกับขึ้นโดเมนจริง) แล้วตั้ง `RESEND_API_KEY`/`RESEND_FROM_EMAIL`

CI ของ PR นี้ค้าง `queued` บน GitHub นาน **1 ชั่วโมงเต็ม** ก่อนเริ่มรัน (ปกติ ~1-2 นาที) — ยืนยันแล้วว่าไม่ใช่ปัญหาโค้ด/repo (run อื่นก่อน-หลังปกติดี, repo public ไม่ใช่ปัญหา billing minutes) น่าจะเป็น backlog ฝั่ง GitHub Actions

---

## 2026-07-25 — ลบบทความแล้วยังอ่านได้ต่ออีกชั่วโมง (PR #261)

`DELETE /api/admin/blog` purge แค่ `/blog` + sitemap · ขาด `/en/blog` และขาดหน้าบทความเอง → บทความที่คลินิกกดลบยังโชว์บน listing ภาษาอังกฤษและยังเปิด URL ตรงอ่านได้จาก ISR cache ถึง 1 ชั่วโมง · สำหรับเนื้อหาคลินิกที่มักลบเพราะมีอะไรผิด (ราคา/ข้อความที่ยังไม่ผ่านตรวจตาม §0.2) "ลบแล้ว" ต้องแปลว่าหายเดี๋ยวนี้ · แก้ด้วย `DELETE ... RETURNING slug` แล้ว purge ครบ 4 path เท่าตอน publish

**สรุปเรื่อง `blog/[slug]` prerender**: ไม่ทำ และเขียนเหตุผลไว้ใน STATUS แล้ว — slug อยู่ใน D1 ที่ CI เข้าไม่ถึง จะ prerender ต้องให้ CI ถือ Cloudflare token ไปอ่าน D1 ตอน build (เพิ่ม secret + build ล้มได้เมื่อ D1 ล่ม) แลกกับ latency ของ request แรกเท่านั้น

**บันทึกความผิดพลาดของ agent เองลง CLAUDE.md §0.5 สองข้อ**: (1) แตก branch จาก `origin/main` ที่ไม่ได้ fetch สด ทำให้ฐานขาดงานที่เพิ่ง merge เอง (2) เขียนสเปกให้ Codex โดยไม่เปิดไฟล์อ่านก่อน ทำให้สั่งผิด 3 จุดในงานเดียว

---

## 2026-07-25 — กวาดข้อความไทยที่ค้างบนหน้า `/en` ให้หมด (PR #257, #258, #259)

เว็บเป็น 2 ภาษามาตั้งแต่ #233 แต่ยังมีของค้างที่ทำให้ `/en` ใช้งานจริงไม่ได้เต็มที่ · เจอทั้งหมดจากการ**เปิดหน้า `/en` จริงแล้วอ่าน accessibility tree** ไม่ใช่จากการอ่านโค้ด

| PR | ปัญหา |
|---|---|
| [#257](https://github.com/luminuy/kazumi-clinic/pull/257) | ป็อปอัปล็อกอิน (เปิดจากปุ่มบัญชีบน header ทุกหน้า) hardcode ภาษาไทยทั้งไฟล์ |
| [#258](https://github.com/luminuy/kazumi-clinic/pull/258) | 17 ไฟล์ import `Link` จาก `next/link` ซึ่งไม่รู้จัก locale → คนอ่านอังกฤษกดลิงก์แล้วเด้งกลับหน้าไทย เสียภาษาที่เลือกทั้ง session |
| [#259](https://github.com/luminuy/kazumi-clinic/pull/259) | `aria-label` ไทยที่เหลือ (carousel/grid/filter/แถบแบรนด์) + ปุ่ม "ซื้อเลย"/"จองคิว…ผ่าน LINE" |

**วิธีทำงาน**: Claude เขียนสเปกรายจุด → Codex CLI (`gpt-5.6-sol`) ลงมือ → Claude อ่าน diff เองและรัน lint/typecheck/test/build ซ้ำทุกรอบ · Codex ทักกลับ 3 ครั้งว่าสเปกผิดแทนที่จะเดาแก้เอง (เทสต์ที่ Header เป็น sync, `brand-strip` ไม่มี `'use client'`, ปุ่ม autoplay ที่ regex ตรวจไม่เจอ) — ทั้งสามข้อเป็นความผิดของสเปก ไม่ใช่ของ Codex

**บทเรียน**: ระหว่างทางเผลอแตก branch จาก `origin/main` ที่ยังไม่ `fetch` สด ทำให้ขาด #258 ไปทั้งชุด · จับได้เพราะ grep แล้วเจอ aria-label ที่ควรถูกแก้ไปแล้ว → `git merge-base --is-ancestor origin/main HEAD` ก่อน push ทุกครั้ง (CLAUDE.md §0.5 เตือนไว้แล้ว)

---

## 2026-07-25 — ตัด Cloudinary default ที่ตายแล้ว (PR #255)

`kazumi-clinic/brand-mark` กับ `kazumi-clinic/hero-home` ถูกลบจาก Cloudinary ไปแล้ว (404) แต่ยังชิปเป็น `defaultPublicId` · ไม่มีใครเห็นเพราะคลินิกอัปทับทั้งสอง slot — **แต่ปุ่ม "คืนรูปเดิม" ใน /admin คือการกลับไปใช้ default** แปลว่าคลิกเดียวจะทำให้โลโก้ทุกหน้า + hero + `image` ใน JSON-LD ชี้ไปรูปที่ไม่มีอยู่ · ตัด default ทั้งสองออก แล้วทำให้ Header/Footer แสดงเฉพาะตัวหนังสือ, hero เหลือพื้นเข้ม, `primaryImageOfPage` ถูกตัดทิ้งเมื่อไม่มีรูป

**เจอเพิ่มระหว่างแก้**: slot `brand-logo` ไม่เคยมี default → JSON-LD ที่ส่งให้ Google **ไม่มี `logo`** มาตลอด · ใส่ `kazumi-clinic/logo` (ยิงเช็ค 200 + เปิดดูแล้วว่าเป็นโลโก้จริง) เป็น default แล้ว

**กฎใหม่ใน [images.md](./images.md)**: ทุก id ใน `cloudAssets` ต้องยิงขึ้นก่อนถึงจะชิปได้ — default ที่ตายอันตรายกว่าไม่มี default เพราะ /admin เปลี่ยนมันเป็นสถานะจริงได้ด้วยคลิกเดียว

---

## 2026-07-25 — register เลิกเป็น account oracle + breadcrumb ที่ส่งชื่อ key ให้ Google (PR #253)

**register**: อีเมลซ้ำเคยได้ `409 "อีเมลนี้มีบัญชีอยู่แล้ว"` → สคริปต์เดียวไล่เช็คได้ว่าใครเป็นลูกค้าคลินิก (ข้อมูลอ่อนไหวตาม PDPA) · ตอนนี้ตอบ 200 body เดียวกับสมัครสำเร็จ, **ไม่ออก session ให้ใครเลย** (ไม่งั้น `Set-Cookie` บอกความต่างแทน) และเผา `hashPassword()` ทิ้งบนเส้นทางซ้ำเพื่อไม่ให้เวลาตอบเป็นคำตอบ · แลกด้วยการที่คนสมัครใหม่ต้องล็อกอินอีกครั้ง · **ยังปิดไม่สนิท**: สมัครแล้วล็อกอินผ่าน = รู้ว่าอีเมลนั้นเดิมว่าง — ต้อง verify-before-create ทางอีเมลถึงจะปิดจริง

**breadcrumb**: 7 หน้าเรียก `getTranslations('HomePage')` แล้วขอ `'Navigation.home'` ซึ่งเป็น namespace ระดับบน · next-intl ตอบกลับเป็นชื่อคีย์แทนที่จะพัง → JSON-LD บน production ส่ง `"name":"HomePage.Navigation.home"` ให้ Google มาตลอด (ยืนยันด้วย curl ก่อนแก้) · บทเรียน: **missing key ของ next-intl ไม่พัง มันชิป** จึงเพิ่ม invariant test ว่า th/en ต้องมีคีย์ตรงกันและไม่มีค่าว่าง

**ปิดปมค้างเก่า 2 ข้อ**: เทสต์ปุ่มซื้อ/ตะกร้า (jsdom + Testing Library — ล็อกกฎ §0.2 ว่าของที่ยังไม่มีราคาต้องมีแค่ปุ่ม LINE) และ `scripts/verify-reset-revocation.sh` ที่พิสูจน์บน Worker จริงว่ารีเซ็ตรหัสถอน session ทุกเครื่อง (2 → 0, คุกกี้ตายทั้งคู่, token ใช้ครั้งเดียว)

---

## 2026-07-25 — sitemap ครอบทั้ง 2 ภาษา (PR #251)

`app/sitemap.ts` ลิสต์เฉพาะ URL ภาษาไทย ทั้งที่ `alternates.languages` ของทุกหน้าชี้ไป `/en` → เว็บส่งสัญญาณขัดกันเอง · แก้ที่โครงสร้าง: sitemap ประกาศ "หน้า" เป็น path ที่ไม่ผูกภาษา แล้ว `expand()` กระจายเป็นหนึ่ง entry ต่อ locale โดยดึง URL + hreflang จาก `localizedAlternates()` ตัวเดียวกับที่หน้าเว็บใช้ — sitemap จึงขัดกับ canonical ไม่ได้อีกโดยโครงสร้าง · เพิ่ม invariant test 3 ตัว · ยืนยันบน production: 72 URL (36 หน้า × 2 ภาษา) พร้อม hreflang ครบทุก entry

เจอระหว่างตรวจเอกสารใน #250 — ตัวอย่างของกฎ "เอกสารขัดกับโค้ด ให้เชื่อโค้ด แล้วไล่ดูว่าโค้ดขัดกับตัวเองตรงไหนด้วย"

---

## 2026-07-25 — ไล่แก้เอกสารทั้งชุด (PR #250)

เอกสาร 4 ไฟล์บอกข้อเท็จจริงผิด: `deploy-for-antigravity.md` สอนว่า "ไม่มี CI/CD ต้อง deploy มือทุกครั้ง" (CD เปิดตั้งแต่ 2026-07-23) · ค่าสีใน `design.md` + CLAUDE.md §0.4 เป็นของยุค olive ทั้งที่ไซต์ re-tone เป็น Apple neutrals โดยคงชื่อ token เดิม · `infrastructure.md` บอก "ไม่มี Worker secret สักตัว" ทั้งที่มี 7 ตัว และยังบอกว่าอัป Cloudinary แบบ unsigned ทั้งที่ย้ายเป็น signed ตั้งแต่ PR #220 · `member-system.md` บอกปุ่ม OAuth แสดงเสมอ

เพิ่ม: CLAUDE.md §13 (i18n — ไม่เคยมีเอกสารไหนพูดถึงเลยทั้งที่ทุกหน้าอยู่ใต้ `[locale]`), แผนที่เอกสาร "หนึ่งข้อเท็จจริง = หนึ่งเจ้าของไฟล์", ดัชนีบทเรียนใน §0.5, `docs/deploy.md` (เปลี่ยนชื่อจาก deploy-for-antigravity + ลิงก์จาก README/AGENTS/CLAUDE ซึ่งเดิมไม่มีใครลิงก์ถึง), และย้ายประวัติออกจาก STATUS.md มาไฟล์นี้

---

## 2026-07-25 — ระบบรหัสผ่านตายสนิทบน production (PR #247, #248, #249)

**[#247](https://github.com/luminuy/kazumi-clinic/pull/247)** `lib/members/password.ts` ตั้ง PBKDF2 ไว้ 600,000 รอบ แต่ workerd ปฏิเสธเกิน 100,000 → `hashPassword()`/`verifyPassword()` throw ทุกครั้ง = สมัคร/ล็อกอิน/รีเซ็ตรหัสใช้ไม่ได้เลยหลายวัน · เทสต์ 47 ตัวเขียว CI เขียว security audit ชมค่านั้นด้วยซ้ำ เพราะ `vitest` รันบน Node ที่ไม่มีลิมิตนี้ · เจอเพราะยิง `/api/account/register` จริงบน production แล้วได้ 502 → ไล่ด้วย `wrangler tail`

**[#248](https://github.com/luminuy/kazumi-clinic/pull/248)** เพิ่ม `pnpm smoke` ([scripts/smoke.sh](../scripts/smoke.sh)) ยิง register/login จริงหลังทุก deploy · ออกแบบให้ 429 (rate limit) = exit 2 "สรุปไม่ได้" ไม่ใช่ fail เพราะ smoke ที่ปลุกผิดบ่อยจะโดนปิดทิ้ง · cleanup แบบ self-healing (ลบทั้ง prefix `smoke-%@smoke.invalid`)

**[#249](https://github.com/luminuy/kazumi-clinic/pull/249)** บันทึกบทเรียน runtime-vs-test-environment ลง CLAUDE.md §0.5

---

## 2026-07-25 (เช้า) — audit 33 findings ปิดครบ 13 PR (#231–#244)

Claude วางแผน/เขียน spec/ตรวจสอบ · Codex CLI ลงมือแก้โค้ด

| PR | เรื่อง |
|---|---|
| [#231](https://github.com/luminuy/kazumi-clinic/pull/231) | 🔒 `next` 16.2.10 → 16.2.11 — CVE middleware-bypass GHSA-6gpp-xcg3-4w24 + SSRF/DoS 3 ตัว |
| [#233](https://github.com/luminuy/kazumi-clinic/pull/233) | SEO: title ซ้ำแบรนด์, `<html lang>` ตามภาษาจริง, canonical+hreflang แยก th/en, `/llms.txt` |
| [#234](https://github.com/luminuy/kazumi-clinic/pull/234) | error message ดิบหลุดหา client 27 จุด + race condition ตอนสมัคร/สร้าง slug ซ้ำ |
| [#235](https://github.com/luminuy/kazumi-clinic/pull/235) | rate limit admin write/upload, ซ่อนปุ่ม OAuth ที่ยังไม่ตั้งค่า, เลิกเชื่อ email จาก LINE โดยไม่มี verify |
| [#236](https://github.com/luminuy/kazumi-clinic/pull/236) | ลิงก์ order ของ guest หมดอายุใน 7 วัน + CSRF double-submit ที่ checkout |
| [#237](https://github.com/luminuy/kazumi-clinic/pull/237) | lazy-load modal, preconnect Cloudinary, `Promise.all` ใน layout |
| [#238](https://github.com/luminuy/kazumi-clinic/pull/238) | `will-change` เฉพาะตอนรอ animate |
| [#239](https://github.com/luminuy/kazumi-clinic/pull/239) | ลบ dead code 5 จุด + comment ที่ขัดกับโค้ดจริง |
| [#240](https://github.com/luminuy/kazumi-clinic/pull/240) | รวมปุ่ม LINE ท้ายหน้าเป็น `LineCtaButton` (ซ้ำ 6 ไฟล์) |
| [#241](https://github.com/luminuy/kazumi-clinic/pull/241) | `getAllLeads()` ไม่มี LIMIT → ใส่ cap 500 |
| [#242](https://github.com/luminuy/kazumi-clinic/pull/242) | เทสต์ 20 → 39 (deposit/order math, cart clamp, password hashing) |
| [#243](https://github.com/luminuy/kazumi-clinic/pull/243) | **คืน ISR ให้ทั้งเว็บ** — ดูด้านล่าง |
| [#244](https://github.com/luminuy/kazumi-clinic/pull/244) | password reset flow (เทสต์ 39 → 43) |

**#243 สำคัญและมีบทเรียน**: 6 หน้าตั้ง `revalidate=3600` ไว้แต่ถูกเสิร์ฟ dynamic หมด — KV/D1 tag cache ที่ตั้งไว้ไม่ได้ถูกใช้เลย · audit รอบแรกชี้ว่าเป็นเพราะ `cookies()` ใน layout **แต่แก้จุดนั้นอย่างเดียวไม่มีอะไรเปลี่ยน** · ไล่ bisect ด้วยการ build ซ้ำทีละจุดพบว่ามี **3 สาเหตุซ้อนกัน**: (1) `getLocale()` ใน root layout — regression จาก #233 เอง (2) ไม่มี `generateStaticParams` ที่ `[locale]` layout (3) `cookies()` · แก้โดยย้าย document shell ไป `[locale]` layout (ได้ locale จาก `params` ไม่ต้องอ่าน request) + แยก `/admin` เป็น root layout ของตัวเอง + ย้าย cart badge/login state ไป fetch ฝั่ง client · ยืนยันด้วย `x-nextjs-cache: HIT` บน production จริง

---

## 2026-07-24 (ดึก) — patch ความปลอดภัยด่วน: next 16.2.10 มี CVE middleware-bypass

**[#231](https://github.com/luminuy/kazumi-clinic/pull/231)** `pnpm audit --prod` ยืนยันว่า `next@16.2.10` มี 4 high-severity advisory ที่แก้ใน `16.2.11` โดยเฉพาะ **GHSA-6gpp-xcg3-4w24** (middleware/proxy bypass) ซึ่งอันตรายเป็นพิเศษกับเว็บนี้เพราะ auth ของ `/admin` ทั้งหมดพึ่ง `middleware.ts` จุดเดียว (route handler เชื่อ header `x-admin-email` โดยไม่เช็คซ้ำ) — bypass สำเร็จ = เขียน/ลบข้อมูลคลินิกได้โดยไม่ล็อกอิน · แก้ด้วยการ bump เวอร์ชันอย่างเดียว

---

## 2026-07-24 (ค่ำ) — UI fix จากสกรีนช็อตของเจ้าของ

**[#229](https://github.com/luminuy/kazumi-clinic/pull/229)** (1) `<legend>` ใน `CheckoutForm` ใช้ตำแหน่ง default ของ browser ที่คร่อมเส้นขอบบนของ `<fieldset>` เสมอ พอการ์ดเป็นทรงมนหัวข้อเลยดูโผล่ทะลุกรอบ → ซ่อน legend ให้ screen reader อ่านอย่างเดียว (`sr-only`) แล้วใช้ `<p>` แสดงหัวข้อแทน (2) `PromotionsGrid` — `Card` มี `py-(--card-spacing)` และเงื่อนไข `has-[>img:first-child]:pt-0` ไว้ยกเว้นให้รูปชิดขอบ แต่รูปโปรฯ ถูกห่อด้วย `<div>` อีกชั้นเลยไม่เข้าเงื่อนไข → เพิ่ม `pt-0` ตรง ๆ เมื่อการ์ดมีรูป

---

## 2026-07-24 (เย็น) — หน้า Services ทั้ง 9 หมวดได้ระบบซื้อผ่านเว็บ

เจ้าของสั่งให้ Claude วางแผน/ตรวจ, Codex CLI ลงมือแก้โค้ดทุก PR:

- **[#214](https://github.com/luminuy/kazumi-clinic/pull/214)** ปุ่ม "ซ่อน/กู้คืนสินค้า" ใน `/admin/products` — สินค้าที่ซ่อนแล้วเคยหายจากทั้งเว็บและแอดมิน (กู้ไม่ได้เลยนอกจากแก้ D1 ตรง ๆ)
- **[#222](https://github.com/luminuy/kazumi-clinic/pull/222)** หน้า `/filler` ตกไปใช้เทมเพลตธรรมดาเงียบ ๆ เพราะเงื่อนไข `heroImage` บล็อกการ์ดที่มีอยู่แล้ว (รูป hero หายจาก Cloudinary) → fallback เป็นไอคอน
- **[#223](https://github.com/luminuy/kazumi-clinic/pull/223)** เพิ่มปุ่ม "เพิ่มลงตะกร้า" ให้ 5 หมวดที่ไม่เคยมี — ยังไม่ขึ้นจริงเพราะ 5 หมวดนั้นยังไม่มีสินค้าตั้งราคา (รอเจ้าของ/แพทย์ ตาม CLAUDE.md §0.2)
- **[#224](https://github.com/luminuy/kazumi-clinic/pull/224)** สร้าง `components/service-item-actions.tsx` ให้ทั้ง 9 หมวดใช้ร่วมกัน (ก่อนหน้านี้แต่ละหน้าเขียนปุ่มเอง บางหน้า label อังกฤษ บางหน้าไม่มีปุ่ม LINE)
- **[#225](https://github.com/luminuy/kazumi-clinic/pull/225)** ปุ่ม "ซื้อเลย" (เพิ่มตะกร้า+ไปเช็คเอาท์ทันที) + ปุ่มไอคอนตะกร้า/LINE
- **[#226](https://github.com/luminuy/kazumi-clinic/pull/226)** ลบปุ่ม LINE ซ้ำซ้อนบน 3 หน้า
- **[#227](https://github.com/luminuy/kazumi-clinic/pull/227)** ปรับสไตล์ปุ่มตะกร้า+LINE ให้เป็นชุดเดียวกันแบบ Apple style (เอาแพทเทิร์นจากปุ่ม +/- ใน `cart-view.tsx` มาใช้ซ้ำ)

**ยังไม่ทำ**: ปุ่ม "ซื้อเลย"/purchase-action ยังไม่มี automated test คุม

---

## 2026-07-24 (บ่าย) — 6 จุดจาก code/site audit

- **[#215](https://github.com/luminuy/kazumi-clinic/pull/215)** `lib/members/catalog.ts` เคยอ่าน `serviceCategories` hardcoded แทน D1 merged catalogue → แก้ราคา/ซ่อนสินค้าใน /admin ไม่เคยไปถึง cart จริง
- **[#216](https://github.com/luminuy/kazumi-clinic/pull/216)** เพิ่ม `pnpm cf:build` เข้า CI — เดิมเช็คแค่ `next build` ไม่เช็ค OpenNext/Worker build ที่ deploy จริงใช้
- **[#217](https://github.com/luminuy/kazumi-clinic/pull/217)** rate limit `/api/cart/items` (60 req/5min ต่อ IP)
- **[#218](https://github.com/luminuy/kazumi-clinic/pull/218)** sync เอกสารให้ตรง CI/CD จริง + Next.js 16.2
- **[#219](https://github.com/luminuy/kazumi-clinic/pull/219)** เทสต์คุม hide/restore merge logic + cart catalog pricing
- **[#220](https://github.com/luminuy/kazumi-clinic/pull/220)** `lib/cloudinary-upload.ts` เปลี่ยนจาก unsigned preset (`littlesmileflower`, ชื่อหลุดใน git history สาธารณะ) เป็น **signed upload** · ตั้ง secret `CLOUDINARY_API_KEY`/`_SECRET` แล้ว (key `kazumi-clinic-worker`, role Master Admin — free plan ไม่รองรับ scoped role) · เจ้าของทดสอบอัปรูปจริงผ่าน 2026-07-24
  - ⚠️ preset เดิม `littlesmileflower` **ห้ามลบ/ปิด** — โปรเจกต์ littlesmileflower ยังใช้อยู่บนบัญชี Cloudinary เดียวกัน

---

## 2026-07-24 — รูปโปรโมชั่นหายทุก deploy

`cf:deploy` เคยผูก `migrations/0011_promotions_image.sql` ซึ่งเป็น table rebuild ที่ `INSERT ... SELECT` **ไม่ได้ copy `image_public_id`** → รอบแรก (ตารางว่าง) ถูกต้อง แต่รอบถัด ๆ ไปลบรูปทั้งหมดเป็น null ทุก deploy · อาการหลอกมาก: ผู้ใช้อัปรูป → ขึ้น → deploy อะไรก็ได้ → รูปหาย โดยผู้ใช้ "ไม่ได้ทำอะไรเลย" · วินิจฉัยผิดรอบแรกไปโทษ `upsertPromotion` (เป็นปัญหารองจริง แต่ไม่ใช่ต้นเหตุ) แล้วบอกผู้ใช้ให้อัปใหม่ → deploy ถัดไปลบซ้ำอีก

---

## 2026-07-23 — repo เป็น public + branch protection + CD

1. **push ตรงเข้า `main` ไม่ได้แล้ว** — ruleset `protect-main` `bypass_actors: []` · GitHub ตีกลับด้วย `GH013` ทุกกรณี แม้ `--no-verify` · commit บน main ก็ไม่ได้ (pre-commit hook)
2. **repo เป็น public** — ห้ามใส่ความลับลงไฟล์ ใช้ `wrangler secret put` · ห้าม `process.env.X || 'fallback'` สำหรับความลับ
3. **git identity ของ repo นี้** ตั้ง local override เป็น `luminuy` (เดิม global เครื่องเป็น "Little Smile Flower" ทำให้ commit ขึ้นชื่อผิดมา 100+ ตัว)
4. **CD เปิด** ([.github/workflows/deploy.yml](../.github/workflows/deploy.yml)) — CI ผ่านบน main → `pnpm cf:deploy` รันเอง

**ที่ปิดไปด้วยวันนั้น**: CI แดงบน main (lint `no-explicit-any` ใน `lib/session.ts`) · `SESSION_SECRET` ที่ไม่เคยตั้งจน production เซ็น session ด้วยสตริงในกิต (ภายหลังเลิกใช้ JWT ทั้งระบบ — PR #185) · guardrail ย้ายไปอยู่ที่ commit-time + server-side

---

## 2026-07-23 — งาน contact ของ Antigravity ถูก park

เจ้าของสั่งให้ใช้เวอร์ชัน contact ของ Claude (PR #166, deployed) แทน · งาน AG ที่แก้ค้าง (`contact/page.tsx`, `globals.css`, `booking-form.tsx`) เก็บไว้ใน **git stash ของโฟลเดอร์หลัก** ชื่อ `AG-contact-redesign-wip-2026-07-23` — กู้ได้ด้วย `git stash list` แล้ว `git stash apply <ref>` (⚠️ `contact/page.tsx` จะชนกับเวอร์ชันปัจจุบัน ต้อง resolve เอง)

---

## 2026-07-22 — เปลี่ยนรูปใน /admin แล้วหน้าไม่อัปเดต

ตาราง `revalidations` ของ OpenNext ไม่เคยถูกสร้างใน D1 เพราะ `cf:deploy` เลี่ยง workerd ด้วย `wrangler deploy` ตรง ๆ จึงข้าม `populateCache` ที่ปกติเป็นคนสร้าง → `revalidatePath()` ไม่มีที่บันทึก = on-demand ISR ตายเงียบ · แก้ด้วย `migrations/0007_tag_cache_revalidations.sql` ผูกเข้า `cf:deploy` (idempotent)
