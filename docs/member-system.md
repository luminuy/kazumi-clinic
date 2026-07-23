# ระบบสมาชิก + ตะกร้า (Member + Basket)

ระบบสมาชิก ตะกร้า และ checkout ของ Kazumi Clinic อยู่บน D1 เดียวกับตารางอื่น (`kazumi-clinic-tag-cache`). โค้ดหลักอยู่ใน `lib/members/*`, หน้าอยู่ใน `app/(site)/[locale]/{account,cart,search}`, API อยู่ใน `app/api/{account,cart,checkout}`.

## สถาปัตยกรรมโดยย่อ

- **Auth เขียนเอง** (ไม่ใช้ NextAuth) — session เก็บใน D1, คุกกี้ `kz_member_session` เก็บ token จริง (HttpOnly), DB เก็บ `sha256(token)`. รหัสผ่าน hash ด้วย PBKDF2/WebCrypto.
- **ตะกร้า** — guest ผูกคุกกี้ `kz_cart`, ล็อกอินแล้ว merge เข้าบัญชี. เงินเก็บเป็น **satang** (บาท × 100) ทุกที่.
- **Order** — snapshot ชื่อ+ราคาจากตะกร้าตอน checkout (ราคาเปลี่ยนภายหลังไม่กระทบ order เดิม).

## สิ่งที่ต้องตั้งค่าก่อนใช้งานจริง

### 1. Apply migration เข้า D1 (จำเป็น)
ตาราง members/carts/orders/... สร้างจาก `migrations/0009_member_system.sql` — ผูกเข้า `pnpm cf:deploy` แล้ว (idempotent) จึงถูก apply อัตโนมัติทุกครั้งที่ deploy. รัน manual ได้ด้วย:
```bash
pnpm cf:migrate:members
```

### 2. Google / LINE Login (ถ้าจะเปิดใช้)
ปุ่ม Google/LINE แสดงบนหน้า login เสมอ แต่จะทำงานต่อเมื่อมี secret. ถ้ายังไม่ตั้ง กดแล้วเด้งกลับพร้อมข้อความ "ยังไม่ได้ตั้งค่า".

- **Google**: สร้าง OAuth Client (Web) ใน Google Cloud Console → ใส่ Authorized redirect URI = `https://<โดเมน>/api/account/oauth/google/callback` (ต้องเพิ่มทั้ง workers.dev และโดเมนจริง). แล้วตั้ง secret:
  ```bash
  wrangler secret put GOOGLE_CLIENT_ID
  wrangler secret put GOOGLE_CLIENT_SECRET
  ```
- **LINE**: สร้าง LINE Login channel ใน LINE Developers → Callback URL = `https://<โดเมน>/api/account/oauth/line/callback` → เปิด scope `profile openid email`. แล้ว:
  ```bash
  wrangler secret put LINE_CHANNEL_ID
  wrangler secret put LINE_CHANNEL_SECRET
  ```

### 3. Payment gateway (Phase 5 — ยังไม่ได้เชื่อม)
ตอนนี้ checkout รองรับ **จองก่อนจ่ายที่คลินิก** และ **มัดจำ/เต็มจำนวนแบบชำระที่คลินิก** ได้เต็มรูปแบบ. การชำระออนไลน์ (บัตร/พร้อมเพย์) ยังเป็น placeholder — order ถูกสร้างในสถานะ `awaiting_payment` และลูกค้าเห็นข้อความว่าทีมงานจะส่งลิงก์/ติดต่อกลับ.

เชื่อม gateway จริง (Omise / Stripe / 2C2P / GB PrimePay) แก้ **ไฟล์เดียว**: `lib/members/payments.ts` → ฟังก์ชัน `initiatePayment()` — สร้าง hosted checkout session แล้ว `return { status: 'redirect', url }`. อ่านคีย์จาก env (`wrangler secret put`), **ห้าม hardcode**; หน้า hosted ของ gateway เป็นที่กรอกบัตร ไม่ใช่โค้ดนี้. เพิ่ม webhook route เพื่ออัปเดต order → `paid`/`confirmed`.

## ค่าที่ปรับได้

- **% มัดจำ**: `DEPOSIT_PERCENT` ใน `lib/members/config.ts` (ดีฟอลต์ 20)
- **บริการที่ "เพิ่มลงตะกร้า" ได้**: อัตโนมัติจาก item ใน `lib/services.ts` ที่มีทั้ง `id` และ `priceFrom` (ตอนนี้ filler/botox/iv-drip). item ที่ไม่มีราคาคงที่ยังจองผ่าน LINE เหมือนเดิม (ตาม CLAUDE.md §0.2)

## ข้อจำกัดตอน dev

D1 รันใน `next dev` บนเครื่อง macOS 12.x ไม่ได้ (workerd ต้อง 13.5+) → หน้า/ปุ่ม render ได้แต่การเซฟจริง (สมัคร/ล็อกอิน/ตะกร้า/order) ทดสอบได้เฉพาะบน Cloudflare หลัง deploy. เมื่อ D1 ไม่พร้อม API ตอบ error ชัดเจนแทนที่จะพัง.
