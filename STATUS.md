# STATUS — โปรเจกต์อยู่ตรงไหนแล้ว

> **อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง** เพื่อรู้ว่าตอนนี้ถึงไหน ใครทำอะไรค้างไว้
> **"ล่าสุด" = `origin/main` เสมอ** (ดู CLAUDE.md §0.5) — ไฟล์นี้แค่สรุปให้อ่านเร็ว ถ้าขัดกับ git ให้เชื่อ git
> อัปเดตไฟล์นี้เป็นส่วนหนึ่งของ workflow: หลัง **deploy** และตอน **เริ่ม/จบงานสำคัญ** (ดู CLAUDE.md §0)

**อัปเดตล่าสุด:** 2026-07-22 · โดย: Claude Code

---

## 🚀 Deployed ตอนนี้ (เว็บจริง)

| | |
|---|---|
| **workers.dev** | Version `050f0578` — deploy 2026-07-22 · ตรงกับ main `f7c37f3` (design tokens ใหม่ + fix รูป /admin) |
| **โดเมนจริง** (kazumiclinic.com) | ❌ ยังไม่ขึ้น — `SITE_ENV=preview`, robots `Disallow: /` (ตั้งใจ ห้ามลบจนกว่าโดเมนจะขึ้น) |
| **URL ตรวจ** | https://kazumi-clinic.bankjack10452.workers.dev |

> วิธีเช็คว่าเว็บจริง = main หรือยัง: `git rev-parse origin/main` เทียบกับ commit ในตารางบน · deploy ใหม่ = อัปเดต Version + commit ที่นี่

---

## 🔨 กำลังทำ (in progress)

- (ว่าง — ไม่มีงานค้าง)

> ก่อนเริ่มงานที่กินหลายไฟล์ ให้จดที่นี่: **อะไร · เครื่องมือไหน (Claude / Antigravity) · branch ไหน** — กันชนกันและกัน "งานหาย" (ดู CLAUDE.md §0.5 · dual-agent)

---

## 📋 ต่อไป / TODO

- [ ] **เจ้าของทดสอบ**: เปลี่ยนรูปสักช่องใน /admin → รีเฟรชหน้านั้น ควรอัปเดตใน ~ไม่กี่วินาที (ยืนยัน on-demand revalidation หลังแก้ tag cache 2026-07-22)
- [ ] จดโดเมนจริง + ลบ `SITE_ENV=preview` + แก้ robots ตอนโดเมนพร้อม (ดู docs/infrastructure.md)

---

## ⚠️ ปมค้าง / รู้ไว้

- **เปลี่ยนรูปใน /admin แล้วต้องขึ้นเว็บ**: ต้องมีตาราง `revalidations` ใน D1 (fix แล้ว 2026-07-22, `migrations/0007`, ผูกใน `cf:deploy`) — ถ้าหน้าไม่อัปเดตอีก เช็คตารางนี้ก่อน (CLAUDE.md §0.5)
- **สองเครื่องมือแก้ร่วมกัน** (Claude ใน worktree · Antigravity ในโฟลเดอร์หลัก): งานที่ไม่ push = มองไม่เห็นตอน deploy — commit+push ทุกครั้งที่หยุด · `main` มี branch protection แล้ว (ต้องผ่าน PR + CI, push ตรงไม่ได้)
- **deploy เป็น manual**: `pnpm cf:deploy` แล้วยิงเว็บจริง 2 ครั้งเช็ค `x-nextjs-cache` (ISR เสิร์ฟของเก่ารอบแรก) · เช็คสุขภาพเว็บได้ด้วย `pnpm health`

## 🧰 เครื่องมือ (มีตั้งแต่ 2026-07-22)

- **CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) — lint + typecheck + test + build บนทุก PR (รันบน GitHub runner)
- **Test** — `pnpm test` (vitest) · invariant tests ใน `tests/` (no-trailing-slash, service catalog)
- **Health** — `pnpm health` เช็คทุกหน้า 200 · uptime workflow ยิงทุก 6 ชม. ([.github/workflows/uptime.yml](.github/workflows/uptime.yml)) fail แล้ว GitHub เมลเตือน
- **ต้องเปิด R2** (ยังใช้ KV แทน) และ **ขึ้นโดเมนจริง** = งานที่ต้องกดใน Cloudflare dashboard เอง
