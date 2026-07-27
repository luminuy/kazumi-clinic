# ระบบนัดหมาย (Appointments / Leads)

ระบบนัดหมายของ Kazumi Clinic ต่อจากตาราง `leads` เดิมโดยไม่ลบประวัติคำขอเก่า ลูกค้ายังคงส่ง
“คำขอนัดหมาย” ให้พนักงานตรวจและยืนยัน ไม่ใช่ instant booking ที่ล็อกห้องหรือแพทย์อัตโนมัติ

ทวนกับ implementation บน `origin/main` เมื่อ **2026-07-27** · **Part A + Part B deploy ขึ้น production แล้ว**
เหลือปมเดียวคือยังไม่มีใครยืนยันว่าอีเมล (ยืนยัน/ยกเลิก/เตือน) ถึงกล่องจดหมายจริง

---

## สถานะ

| ส่วน | สถานะ |
| --- | --- |
| ฟอร์มวันที่/เวลาแบบมีโครงสร้าง + email + locale | ✅ โค้ดพร้อม |
| กติกาเวลาทำการ, 30 นาที/slot, ล่วงหน้า 2 ชั่วโมง, ไม่เกิน 60 วัน | ✅ pure logic + Node tests |
| พนักงานยืนยันเวลา/ระยะเวลา + เตือนเวลาทับซ้อน | ✅ โค้ดพร้อม |
| อีเมลยืนยัน/ยกเลิกผ่าน Resend | ✅ ตั้งค่าครบแล้ว (2026-07-27) — ⏳ ยังไม่มีใครทดสอบ delivery จริง |
| หน้านัดหมายของสมาชิก + ยกเลิกเอง | ✅ โค้ดพร้อม |
| guest cancellation link แบบ opaque token | ✅ โค้ดพร้อม |
| Migration `0013_appointments` บน remote D1 | ✅ รันก่อน merge Part A (PR #266) แล้ว |
| ทดสอบบน Cloudflare Worker จริง | ✅ Part A + Part B deploy แล้ว · ⏳ เหลือทดสอบ email delivery |
| ไฟล์ปฏิทิน `.ics` | ✅ แนบกับอีเมลยืนยันนัด |
| reminder ก่อนนัด 24 ชั่วโมง + hourly cron | ✅ ใช้งานจริงแล้ว — `INTERNAL_TASK_SECRET` ตั้งครบทั้ง Worker และ GitHub, ยิงจริงผ่าน (200 ด้วย secret ถูก / 401 ด้วย secret ผิด) |
| เรียง admin dashboard ตามเวลานัดใกล้สุด | ✅ โค้ดพร้อม |

> Migration ใช้ `ALTER TABLE ADD COLUMN` และรันบน remote D1 แล้วก่อน merge PR #266 ห้ามผูก
> `pnpm cf:migrate:appointments` เข้า `cf:deploy` หรือรันซ้ำ เพราะจะ error `duplicate column`

---

## Schema

[migrations/0013_appointments.sql](../migrations/0013_appointments.sql) เพิ่มข้อมูลต่อไปนี้บน
`leads` เดิมจาก [migrations/0006_leads.sql](../migrations/0006_leads.sql):

| คอลัมน์ | ชนิด | ใช้ทำอะไร |
| --- | --- | --- |
| `email` | `TEXT NULL` | ที่อยู่สำหรับอีเมลธุรกรรม |
| `member_id` | `TEXT NULL` FK → `members.id` | ผูกคำขอกับสมาชิก; ลบสมาชิกแล้วเป็น `NULL` |
| `locale` | `TEXT NOT NULL DEFAULT 'th'` | ภาษาที่ลูกค้าใช้ตอนส่งคำขอ (`th`/`en`) |
| `requested_date` / `requested_time` | `TEXT NULL` | วัน `YYYY-MM-DD` และเวลา `HH:MM` ที่ลูกค้าเลือก |
| `scheduled_at` | `INTEGER NULL` | เวลาที่พนักงานยืนยันแล้ว เป็น epoch milliseconds |
| `duration_minutes` | `INTEGER NULL` | ระยะเวลานัดที่พนักงานกำหนด |
| `confirmation_sent_at` | `INTEGER NULL` | เวลาที่ส่งอีเมลยืนยันสำเร็จ |
| `reminder_sent_at` | `INTEGER NULL` | กัน reminder ซ้ำเมื่อ Part B เปิดใช้ |
| `cancel_token` | `TEXT NULL UNIQUE` | token สุ่ม 256-bit สำหรับ guest cancellation link |
| `cancelled_at` / `cancel_reason` | `INTEGER` / `TEXT NULL` | audit การยกเลิก |

ดัชนีใหม่ครอบ `scheduled_at`, `member_id` และ unique `cancel_token` ตารางเดิมและชื่อ `leads`
ไม่เปลี่ยน ไม่มี `DROP`, `RENAME`, table rebuild หรือ `INSERT ... SELECT`

---

## Flow

1. **ลูกค้าส่งคำขอ** — [booking-form.tsx](../components/booking-form.tsx) สร้างตัวเลือกจาก
   `site.hours` ผ่าน [schedule.ts](../lib/appointments/schedule.ts) แล้ว `POST /api/leads`
2. **Route ตรวจและบันทึก** — Zod ตรวจ body, honeypot/rate limit เดิมยังอยู่, slot ถูกตรวจซ้ำฝั่ง server,
   session ที่ล็อกอินอยู่จะผูก `member_id` และใช้อีเมลสมาชิกเป็น fallback จากนั้นสร้าง `cancel_token`
3. **พนักงานยืนยัน** — `/admin/leads` กำหนด epoch time และ duration; ระบบแสดง warning ถ้าทับนัดอื่น
   แต่ไม่ hard block เพราะคลินิกอาจมีหลายห้องหรือหลายแพทย์
4. **ยืนยันทางอีเมล** — ถ้ามี email ระบบสร้างลิงก์จาก origin ของ request จริงและใส่ `/en` ตาม
   `lead.locale`; อีเมลแนบ `.ics` ของเวลาที่พนักงานยืนยัน และความล้มเหลวของ Resend ไม่ย้อน
   appointment ที่บันทึกแล้ว
5. **ลูกค้าติดตาม/ยกเลิก** — สมาชิกดู `/account/appointments` และยกเลิกได้เฉพาะ lead ของตัวเอง;
   guest ใช้ `/appointments/cancel?token=...` หรือ `/en/appointments/cancel?token=...`
6. **เตือนก่อนนัด** — GitHub Actions เรียก `POST /api/internal/appointment-reminders` ทุกชั่วโมง;
   route เลือกนัดในช่วง 23–25 ชั่วโมงข้างหน้า ส่งอีเมล reminder พร้อมลิงก์ยกเลิก และบันทึก
   `reminder_sent_at` หลัง Resend ส่งสำเร็จ
7. **พนักงานได้รับแจ้ง** — การสร้างและยกเลิกเรียก `notifyStaffWebhook()` แบบ awaited แต่
   failure-isolated เหมือน behavior เดิม: webhook ล้มไม่ทำให้ mutation หลักล้ม

สถานะ `leads` คือ `new`, `contacted`, `booked`, `cancelled`, `closed` การยกเลิกเปลี่ยนสถานะและเก็บ
audit fields แทนการลบแถว

---

## Email และ secret

[lib/appointments/notify.ts](../lib/appointments/notify.ts) ยิง Resend REST API โดยตรงและมี
`import 'server-only'` เนื้อหาอยู่ใน `messages/{th,en}.json` ที่ namespace `Appointments`

ต้องมีค่าของ Resend ครบสองตัว — **คนละชนิดกัน** (ตั้งครบแล้วตั้งแต่ 2026-07-27):

| ค่า | ชนิด | ตั้งที่ไหน |
| --- | --- | --- |
| `RESEND_API_KEY` | Secret | `wrangler secret put RESEND_API_KEY` |
| `RESEND_FROM_EMAIL` | Plaintext var | `vars` ใน [wrangler.jsonc](../wrangler.jsonc) — **ห้ามตั้งผ่าน dashboard** เพราะ `wrangler deploy` ลบทิ้ง (ดู [member-system.md](./member-system.md)) |

ถ้าไม่ครบ ฟังก์ชันคืน `not_configured` พร้อม warning และ appointment flow ยังสำเร็จตามปกติ
เงื่อนไขเดียวกับ password reset ดู [member-system.md](./member-system.md) — **ยังไม่มีการทดสอบ delivery จริง**

reminder ใช้ [appointment-reminders.yml](../.github/workflows/appointment-reminders.yml) เป็นนาฬิกา
รายชั่วโมงและตรวจ header `x-internal-secret` ที่ route ภายใน ต้องตั้งค่าเดียวกันทั้ง Worker และ GitHub:

```bash
wrangler secret put INTERNAL_TASK_SECRET
gh secret set INTERNAL_TASK_SECRET
```

โค้ดไม่เก็บค่าจริงหรือ fallback ไว้ใน repo ถ้ายังไม่ตั้ง `INTERNAL_TASK_SECRET` route จะตอบ `401`
และ workflow จะล้มให้เห็นชัดเจน · **ตั้งครบทั้งสองฝั่งแล้วและยิงทดสอบผ่านจริง** (200 ด้วย secret ถูก, 401 ด้วย secret ผิด/ไม่มี)

`LEAD_WEBHOOK_URL` ยังเป็น var เสริมเหมือนระบบเดิม ไม่ตั้งแล้วไม่มีการแจ้งพนักงานทาง webhook แต่ข้อมูล
ยังถูกบันทึกใน D1

---

## ค่าที่ปรับได้

ค่ากลางอยู่ใน [lib/appointments/schedule.ts](../lib/appointments/schedule.ts):

| ค่า | ปัจจุบัน |
| --- | --- |
| `APPOINTMENT_SLOT_MINUTES` | 30 นาที |
| `APPOINTMENT_DEFAULT_DURATION_MINUTES` | 60 นาที |
| `APPOINTMENT_MAX_ADVANCE_DAYS` | 60 วัน |
| `APPOINTMENT_MIN_LEAD_HOURS` | 2 ชั่วโมง |
| Reminder query window | 23–25 ชั่วโมงก่อนนัด ใน `app/api/internal/appointment-reminders/route.ts` |
| Reminder schedule | ทุกต้นชั่วโมง ใน `.github/workflows/appointment-reminders.yml` |

เวลาทำการอ่านจาก `site.hours` ใน [lib/site.ts](../lib/site.ts) เท่านั้น เวลา appointment แปลงด้วย
Asia/Bangkok (UTC+7 ไม่มี DST) และ format ไทยด้วย `Intl` จึงได้ปี พ.ศ. โดยไม่คำนวณเอง

---

## Security และ privacy

- public request และ cancellation route ใช้ Zod + D1 rate limit ก่อน mutation
- member cancellation ตรวจ `lead.member_id === member.id`; id อย่างเดียวไม่ใช่สิทธิ์
- guest token สุ่มด้วย `crypto.getRandomValues` และมี unique index
- invalid/used guest token คืนข้อความทั่วไปเพื่อไม่ช่วย enumeration
- recipient email, token, cancel URL และ Resend response body ไม่ถูกเขียนลง log
- หน้า account และ cancellation ตั้ง `noindex, nofollow`; robots disallow path เหล่านี้ด้วย

---

## ข้อจำกัดตอน dev และวิธี verify

D1 ใช้กับ `next dev` บน macOS 12.x ไม่ได้ เพราะ workerd ต้องการ macOS 13.5+ ดังนั้น
[appointments-schedule.test.ts](../tests/appointments-schedule.test.ts) ครอบเฉพาะ logic ล้วนบน Node
และจงใจไม่ mock [leads-store.ts](../lib/leads-store.ts)

ก่อนเผยแพร่ต้องรัน:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

จากนั้นรัน migration มือ, deploy ผ่าน CD และยิง flow จริงบน Worker พร้อม `wrangler tail` เพราะ Node tests
ไม่พิสูจน์ D1, cookies, WebCrypto หรือ Worker lifecycle ดูข้อจำกัดเดียวกันใน
[member-system.md](./member-system.md)

Part B (`.ics` attachment, `Appointments.reminderEmail`, internal reminder route, hourly GitHub Actions
workflow, เรียง admin list ตาม `scheduled_at`) deploy แล้วและ `INTERNAL_TASK_SECRET` ตั้งครบทั้งสองฝั่ง
พร้อมยิง endpoint ทดสอบผ่านแล้ว — **เหลืออย่างเดียวคือยืนยันว่าอีเมลจาก Resend ถึงกล่องจดหมายจริง**
