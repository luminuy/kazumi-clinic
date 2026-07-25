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
| ลืมรหัสผ่าน | ⚠️ flow ครบแล้ว แต่ **ส่งอีเมลไม่ได้** — ยังไม่มี provider · ลิงก์บนหน้า login **ซ่อนอยู่** จนกว่าจะตั้ง key จริง (ตั้งใจ) |
| Payment gateway | ❌ ยังไม่เชื่อม — checkout รองรับ "จ่ายที่คลินิก" เต็มรูปแบบ, ชำระออนไลน์เป็น placeholder |
| Account enumeration ที่ `/api/account/register` | ⚠️ ยังรั่วผ่าน 409 "อีเมลนี้มีบัญชีอยู่แล้ว" — เป็น trade-off UX ที่เจ้าของต้องตัดสิน (forgot-password ปิดช่องนี้แล้ว) |

### ปุ่ม OAuth แสดงเมื่อไหร่

`configuredProviders()` ใน [lib/members/oauth.ts](../lib/members/oauth.ts) คืนเฉพาะ provider ที่มี **ทั้ง** client id และ secret · หน้า login/register จึง **ซ่อนปุ่มที่ยังไม่ได้ตั้งค่า** แทนที่จะโชว์ปุ่มที่กดแล้วเด้งกลับ (เปลี่ยนใน PR #235)

ตั้ง/เปลี่ยน key:

```bash
wrangler secret put GOOGLE_CLIENT_ID      # + GOOGLE_CLIENT_SECRET
wrangler secret put LINE_CHANNEL_ID       # + LINE_CHANNEL_SECRET
```

Redirect URI ต้องลงทะเบียนกับ provider **ตรงเป๊ะ** เป็น `${origin}/api/account/oauth/<provider>/callback` — ต้องเพิ่มทั้ง workers.dev และโดเมนจริงตอนขึ้นโดเมน · LINE ต้องเปิด scope `profile openid email`

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

`tests/members-*.test.ts` (password, password-reset, cart, catalog, money) + `tests/account-*-route.test.ts` — ครอบ logic ล้วนบน Node · **ไม่ครอบพฤติกรรม runtime ของ workerd** (ดูกฎข้อแรก) · ปุ่ม "ซื้อเลย"/`service-item-actions.tsx` ยังไม่มีเทสต์
