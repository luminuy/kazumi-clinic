# ระบบสมาชิก + ตะกร้า (Member + Basket)

ระบบสมาชิก ตะกร้า และ checkout ของ Kazumi Clinic อยู่บน D1 เดียวกับตารางอื่น (`kazumi-clinic-tag-cache`) · โค้ดหลักอยู่ใน `lib/members/*`, หน้าอยู่ใน `app/(site)/[locale]/{account,cart,search}`, API อยู่ใน `app/api/{account,cart,checkout}`

ทวนกับโค้ด + `wrangler secret list` เมื่อ **2026-07-25**

---

## 🔴 กฎข้อแรกก่อนแตะโค้ดส่วนนี้

> **`pnpm test` เขียว + CI เขียว ≠ ระบบใช้งานได้**

`vitest.config.ts` ตั้ง `environment: 'node'` — WebCrypto ของ Node **ไม่มีลิมิตเดียวกับ workerd**

เคสจริง 2026-07-25: `lib/members/password.ts` ตั้ง PBKDF2 ไว้ 600,000 รอบ · workerd ปฏิเสธเกิน **100,000** แล้ว throw `NotSupportedError` → **สมัคร / ล็อกอิน / รีเซ็ตรหัส ตายสนิททั้งหมดหลายวัน** โดยเทสต์ 47 ตัวเขียว และ security audit ยังชมค่านั้นด้วยซ้ำ · เจอเพราะยิง `/api/account/register` จริงบน production แล้วได้ 502

**เพราะงั้น: ทุกครั้งที่แตะ auth/crypto/D1 ต้องยิงของจริงหลัง deploy**

```bash
pnpm smoke     # สมัคร+ล็อกอินจริงบน Worker ด้วยอีเมลใหม่ แล้วลบทิ้ง
npx wrangler tail   # อ่าน error จริงตอนยิง endpoint อื่น
```

`ITERATIONS = 100_000` ใน [lib/members/password.ts](../lib/members/password.ts) เป็นเพดานของ workerd **ห้ามเพิ่ม** · hash เก็บแบบ self-describing (`pbkdf2$<iterations>$<salt>$<hash>`) จึงยังตรวจ hash เก่าที่มีค่ารอบต่างกันได้

---

## สถาปัตยกรรมโดยย่อ

- **Auth เขียนเอง** (ไม่ใช้ NextAuth) — session เก็บใน D1, คุกกี้ `kz_member_session` เก็บ opaque token 256-bit (HttpOnly), DB เก็บ `sha256(token)` · **ไม่มี signing secret ให้หลุด** (ระบบ JWT เก่าถูกลบใน PR #185 — secret `SESSION_SECRET` ที่ยังค้างบน Worker เป็นซากที่ลบได้)
- **รหัสผ่าน** — PBKDF2/WebCrypto 100k รอบ (ดูกฎด้านบน)
- **ตะกร้า** — guest ผูกคุกกี้ `kz_cart`, ล็อกอินแล้ว merge เข้าบัญชี · เงินเก็บเป็น **satang** (บาท × 100) ทุกที่
- **Order** — snapshot ชื่อ+ราคาจากตะกร้าตอน checkout (ราคาเปลี่ยนภายหลังไม่กระทบ order เดิม) · ลิงก์ดู order ของ guest หมดอายุใน 7 วัน
- **CSRF** — double-submit cookie ออกที่ [middleware.ts](../middleware.ts) และตรวจที่ `/api/checkout`
- **Rate limit** — เก็บใน D1 ตาราง `rate_limits` ต่อ IP: register 5/15นาที · login 10/5นาที · cart 60/5นาที · lead/checkout/admin ตามที่ตั้งใน route

---

## สิ่งที่ตั้งค่าไว้แล้ว / ที่ยังค้าง

| ส่วน | สถานะ (2026-07-25) |
| --- | --- |
| Migration `0009_member_system` | ✅ ผูกใน `pnpm cf:deploy` แล้ว (idempotent) — รันมือได้ด้วย `pnpm cf:migrate:members` |
| Rate limit `0010_rate_limits` | ✅ ผูกใน `cf:deploy` เหมือนกัน |
| Google Login | ✅ secret ตั้งแล้ว (`GOOGLE_CLIENT_ID`/`_SECRET`) |
| LINE Login | ✅ secret ตั้งแล้ว (`LINE_CHANNEL_ID`/`_SECRET`) |
| สมัคร/ล็อกอินด้วยรหัสผ่าน | ✅ ใช้งานได้ (หลังแก้ PBKDF2 · PR #247) |
| ลืมรหัสผ่าน | ✅ ตั้งค่าครบแล้ว (2026-07-27) — Resend ยืนยันโดเมน `kazumiclinic.skin` สำเร็จ, `RESEND_API_KEY` (secret) + `RESEND_FROM_EMAIL` (var) ตั้งครบ, ลิงก์ "ลืมรหัสผ่าน?" โผล่บนหน้า login จริงแล้ว (= `isEmailConfigured()` true) · ⏳ **ยังไม่มีใครทดสอบว่าอีเมลถึงกล่องจดหมายจริง** |
| Payment gateway | ❌ ยังไม่เชื่อม — checkout รองรับ "จ่ายที่คลินิก" เต็มรูปแบบ, ชำระออนไลน์เป็น placeholder |
| Account enumeration ที่ `/api/account/register` | ✅ ปิดที่ระดับ response แล้ว — ดูหัวข้อถัดไป |
| ถอน session ทุกเครื่องตอนรีเซ็ตรหัส | ✅ ทดสอบบน Worker จริงแล้ว 2026-07-25 — `bash scripts/verify-reset-revocation.sh` |

### สมัครสมาชิกไม่บอกว่าอีเมลไหนมีบัญชีอยู่

บัญชีของคลินิกความงามบอกได้ว่าคนคนหนึ่ง**เป็นลูกค้าที่นี่** — เป็นข้อมูลส่วนบุคคลที่อ่อนไหวตาม PDPA เพราะงั้น `/api/account/register` จึง:

- ตอบ **200 พร้อม body หน้าตาเดียวกัน** ไม่ว่าอีเมลนั้นจะว่างหรือมีบัญชีอยู่แล้ว (เดิมตอบ 409 "อีเมลนี้มีบัญชีอยู่แล้ว")
- **ไม่ออก session ให้ใครทั้งนั้น** — ถ้าออกเฉพาะเคสสมัครจริง header `Set-Cookie` ก็บอกความต่างแทน · ผู้สมัครจึงถูกส่งไปหน้า `/account/login?registered=1` ที่ข้อความอ่านได้ทั้งสองความหมาย
- เผา `hashPassword()` ทิ้งบนเส้นทางอีเมลซ้ำ เพราะ `createMember()` ตีกลับ **ก่อน** hash — ไม่งั้นเวลาตอบที่เร็วกว่าหนึ่งรอบ PBKDF2 ก็เป็นคำตอบอยู่ดี

> ⚠️ **ยังเหลือช่องที่ปิดไม่ได้จนกว่าจะมีอีเมล**: คนที่สมัครอีเมลหนึ่งแล้ว**ล็อกอินด้วยรหัสที่เพิ่งตั้งสำเร็จ** ย่อมรู้ว่าอีเมลนั้นเดิมยังว่าง · ปิดสนิทต้อง verify-before-create ทางอีเมล — ตอนนี้ตัว provider (Resend) ต่อแล้ว แต่ verify-before-create เป็นงานคนละก้อน ยังไม่ได้ทำ

### ส่งอีเมลด้วย Resend — ตั้งค่าครบแล้ว (2026-07-27)

เลือก [Resend](https://resend.com) เพราะ **ฟรีและพอสำหรับปริมาณของคลินิกนี้**: 3,000 อีเมล/เดือน, 100/วัน — งานที่ยิงจริงมีแค่ "ลืมรหัสผ่าน" กับ "แจ้งว่ามีคนพยายามสมัครซ้ำ" ซึ่งวันนึงคงหลักหน่วย ไม่มีทางถึง 100 (ตรวจราคา/ลิมิตกับเอกสารทางการของ Resend ก่อนอ้างซ้ำ เผื่อเปลี่ยนหลังจากนี้)

`lib/members/password-reset.ts` ยิง REST API ของ Resend ตรง ๆ ด้วย `fetch` (ไม่ใช้ SDK — แบบเดียวกับ [lib/cloudinary-upload.ts](../lib/cloudinary-upload.ts)) `import 'server-only'` กันคีย์หลุดไปฝั่ง client

**เจ้าของทำครบทั้งชุดแล้วเมื่อ 2026-07-27**: สมัคร Resend → เพิ่มโดเมน `kazumiclinic.skin` → ยืนยันด้วย DNS (auto-configure ผ่าน Cloudflare integration หลังโดเมนย้ายมา Cloudflare) → ตั้งค่าครบ

ค่าที่ต้องมี **2 ตัว แต่คนละที่**:

| ค่า | ชนิด | อยู่ที่ไหน |
| --- | --- | --- |
| `RESEND_API_KEY` | Secret | `wrangler secret put RESEND_API_KEY` |
| `RESEND_FROM_EMAIL` | **Plaintext var** | `vars` ใน [wrangler.jsonc](../wrangler.jsonc) — ค่าปัจจุบัน `Kazumi Clinic <noreply@kazumiclinic.skin>` |

> 🔴 **ห้ามตั้ง `RESEND_FROM_EMAIL` เป็น plaintext var ผ่าน Cloudflare dashboard** — `wrangler deploy` ถือว่า `vars` ใน config คือชุดที่สมบูรณ์ แล้วลบตัวที่ไม่อยู่ในนั้นทิ้งเงียบ ๆ · เกิดจริง 2026-07-27: ตั้งผ่าน dashboard สำเร็จ แล้ว deploy ของ PR คนละเรื่องลบทิ้ง → ปุ่ม "ลืมรหัสผ่าน?" หายไปเอง (CLAUDE.md §0.5 · [infrastructure.md](./infrastructure.md))

`isEmailConfigured()` เช็ค 2 ตัวนี้พร้อมกัน — ครบเมื่อไหร่ปุ่ม "ลืมรหัสผ่าน?" โผล่เอง ไม่ต้องแก้โค้ด (ยืนยันบน production แล้วว่าโผล่จริง)

⏳ **ที่ยังเหลือ: ทดสอบ delivery จริง** — `bash scripts/verify-reset-revocation.sh` สร้าง token เองไม่ผ่านอีเมล จึงพิสูจน์แค่ revoke ไม่ใช่ว่าอีเมลถึงกล่องจดหมาย · ต้องกด "ลืมรหัสผ่าน" จริงบนเว็บแล้วเช็คกล่องจดหมาย **ยังไม่มีใครทำ**

**เนื้อหาอีเมล** อยู่ใน `messages/{th,en}.json` ที่ `Account.passwordResetEmail` และ `Account.accountExists` (คีย์เดียวกับที่ใช้ในหน้าเว็บ — ห้ามแก้ที่นี่โดยไม่แก้ทั้งสองภาษา ตาม §13) เลือกภาษาให้ตรงกับที่ผู้ใช้กำลังอ่านอยู่ ณ ตอนกดปุ่ม (ส่งมาจาก client ด้วย `useLocale()`)

> ⚠️ **ลิงก์รีเซ็ตใช้ origin ของ request ที่วิ่งเข้ามาจริง ไม่ใช่ `site.url`** — วันนี้ทั้งสองค่าตรงกันแล้ว (`site.url` = `https://kazumiclinic.skin` = โดเมนที่เสิร์ฟจริง) แต่ **ห้ามเปลี่ยนกลับไปใช้ `site.url`** เพราะตอนที่ทั้งสองไม่ตรงกัน (ยุค workers.dev + `SITE_ENV=preview`) ลิงก์ที่สร้างจาก `site.url` จะ 404 ทันที · ใช้วิธีเดียวกับ OAuth redirect URI ([lib/members/oauth.ts](../lib/members/oauth.ts)): อ่าน origin จาก `new URL(request.url).origin`

### ปุ่ม OAuth แสดงเมื่อไหร่

`configuredProviders()` ใน [lib/members/oauth.ts](../lib/members/oauth.ts) คืนเฉพาะ provider ที่มี **ทั้ง** client id และ secret · หน้า login/register จึง **ซ่อนปุ่มที่ยังไม่ได้ตั้งค่า** แทนที่จะโชว์ปุ่มที่กดแล้วเด้งกลับ (เปลี่ยนใน PR #235)

ตั้ง/เปลี่ยน key:

```bash
wrangler secret put GOOGLE_CLIENT_ID      # + GOOGLE_CLIENT_SECRET
wrangler secret put LINE_CHANNEL_ID       # + LINE_CHANNEL_SECRET
```

Redirect URI ต้องลงทะเบียนกับ provider **ตรงเป๊ะ** เป็น `${origin}/api/account/oauth/<provider>/callback` — ตอนนี้ origin ที่ใช้จริงมีตัวเดียวคือ `https://kazumiclinic.skin` (workers.dev ปิดแล้ว PR #277) · LINE ต้องเปิด scope `profile openid email`

> ⚠️ **ห้ามเชื่อ email จาก LINE โดยไม่ verify** — LINE ส่ง email มาได้โดยที่ผู้ใช้ไม่ได้ยืนยัน การผูกบัญชีด้วย email ดิบ = ยึดบัญชีคนอื่นได้ (ปิดช่องนี้ใน PR #235)

---

## เชื่อม payment gateway (งานถัดไป)

แก้ **ไฟล์เดียว**: [lib/members/payments.ts](../lib/members/payments.ts) → `initiatePayment()` — สร้าง hosted checkout session ของ gateway (Omise / Stripe / 2C2P / GB PrimePay) แล้ว `return { status: 'redirect', url }`

- อ่านคีย์จาก env ผ่าน `wrangler secret put` เท่านั้น **ห้าม hardcode** (repo เป็น public)
- หน้ากรอกบัตรคือ hosted page ของ gateway — **โค้ดนี้ต้องไม่แตะเลขบัตรเลย**
- ต้องเพิ่ม webhook route เพื่ออัปเดต order → `paid`/`confirmed` และต้อง verify ลายเซ็นของ webhook
- ตอนนี้ order ถูกสร้างสถานะ `awaiting_payment` และลูกค้าเห็นข้อความว่าทีมงานจะติดต่อกลับ

## ค่าที่ปรับได้

- **% มัดจำ**: `DEPOSIT_PERCENT` ใน [lib/members/config.ts](../lib/members/config.ts) (ดีฟอลต์ 20)
- **บริการที่ "เพิ่มลงตะกร้า" ได้**: มาจาก merged catalogue (`getAllMergedCategories()` = `lib/services.ts` + ส่วนต่างใน D1 `service_products`) เฉพาะ item ที่มีทั้ง `id` และ `priceFrom` · item ที่ยังไม่มีราคาจองผ่าน LINE เหมือนเดิม (ตาม CLAUDE.md §0.2 — ราคาต้องผ่านเจ้าของ/แพทย์ก่อน)

## ข้อจำกัดตอน dev

D1 รันใน `next dev` บน macOS 12.x ไม่ได้ (workerd ต้อง 13.5+) → หน้า/ปุ่ม render ได้ แต่การเซฟจริง (สมัคร/ล็อกอิน/ตะกร้า/order) ทดสอบได้เฉพาะบน Cloudflare หลัง deploy · เมื่อ D1 ไม่พร้อม API ตอบ error ชัดเจนแทนที่จะพังเงียบ

## เทสต์ที่มีอยู่

- `tests/members-*.test.ts` (password, password-reset, cart, catalog, money) + `tests/account-*-route.test.ts` — logic ล้วนบน Node
- `tests/service-item-actions.test.tsx` — ปุ่มซื้อ/ตะกร้า/LINE ใน jsdom (ล็อกกฎ §0.2: ของที่ยังไม่มีราคาต้องมีแค่ปุ่ม LINE) · ไฟล์ `.tsx` เปิด jsdom ด้วย docblock `@vitest-environment jsdom` ตัวอื่นยังรันบน node ตามเดิม
- **ไม่มีอันไหนครอบพฤติกรรม runtime ของ workerd** (ดูกฎข้อแรก)

### ตรวจ runtime ที่เทสต์พิสูจน์ไม่ได้

```bash
pnpm smoke                              # สมัคร/ล็อกอินจริงหลัง deploy
bash scripts/verify-reset-revocation.sh # รีเซ็ตรหัสแล้ว session ทุกเครื่องต้องตาย
```

`verify-reset-revocation.sh` สร้างสมาชิกชั่วคราว เปิด 2 session ยัด reset token ลง D1 เอง (เพราะยังไม่มี provider ส่งอีเมล) แล้วตรวจว่า: `member_sessions` เหลือ 0 · คุกกี้ทั้งสองใบใช้ไม่ได้ · token ถูกใช้ครั้งเดียว · รหัสเก่าใช้ไม่ได้ รหัสใหม่ใช้ได้ · แล้วลบข้อมูลตัวเองทิ้ง (กวาด `reset-probe-%@smoke.invalid` ทั้ง prefix เผื่อรอบก่อนตายกลางคัน) · exit `2` = เจอ rate limit สรุปไม่ได้ ไม่ใช่พัง
