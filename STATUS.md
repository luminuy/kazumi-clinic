# STATUS — โปรเจกต์อยู่ตรงไหนแล้ว

> **อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง** เพื่อรู้ว่าตอนนี้ถึงไหน ใครทำอะไรค้างไว้
> **"ล่าสุด" = `origin/main` เสมอ** (ดู CLAUDE.md §0.5) — ไฟล์นี้แค่สรุปให้อ่านเร็ว ถ้าขัดกับ git ให้เชื่อ git
> อัปเดตไฟล์นี้เป็นส่วนหนึ่งของ workflow: หลัง **deploy** และตอน **เริ่ม/จบงานสำคัญ** (ดู CLAUDE.md §0)

**อัปเดตล่าสุด:** 2026-07-23 · โดย: Antigravity

---

## 🚀 Deployed ตอนนี้ (เว็บจริง)

| | |
|---|---|
| **workers.dev** | Version `e5e6376` — deploy 2026-07-23 · ตรงกับ main `e5e6376` (redesign Contact Page using Stitch Apple UI patterns) |
| **โดเมนจริง** (kazumiclinic.com) | ❌ ยังไม่ขึ้น — `SITE_ENV=preview`, robots `Disallow: /` (ตั้งใจ ห้ามลบจนกว่าโดเมนจะขึ้น) |
| **URL ตรวจ** | https://kazumi-clinic.bankjack10452.workers.dev |

> วิธีเช็คว่าเว็บจริง = main หรือยัง: `git rev-parse origin/main` เทียบกับ commit ในตารางบน · deploy ใหม่ = อัปเดต Version + commit ที่นี่

---

## 🔨 กำลังทำ (in progress)

- (ว่าง — ไม่มีงานค้าง)

> ก่อนเริ่มงานที่กินหลายไฟล์ ให้จดที่นี่: **อะไร · เครื่องมือไหน (Claude / Antigravity) · branch ไหน** — กันชนกันและกัน "งานหาย" (ดู CLAUDE.md §0.5 · dual-agent)

### 📨 ส่งไม้ต่อ → Antigravity (2026-07-23 เช้า · จาก Claude Code)

**3 อย่างที่เปลี่ยนวันนี้และกระทบวิธีทำงานโดยตรง — อ่านก่อนแตะโค้ด:**

1. **push ตรงเข้า `main` ไม่ได้แล้ว** GitHub ตีกลับด้วย `GH013` ทุกกรณี แม้ `--no-verify` · เจอ error นี้ = ทำผิดวิธี ไม่ใช่ของพัง → `git switch -c <branch>` → PR → รอ `verify` เขียว → merge · **commit บน main ก็ไม่ได้** (pre-commit hook บล็อก)
2. **repo เป็น public แล้ว** — ห้ามใส่ความลับลงไฟล์เด็ดขาด ใช้ `wrangler secret put` · ห้าม `process.env.X || 'fallback'` สำหรับความลับ
3. **git identity ของ repo นี้** ตั้ง local override เป็น `luminuy` แล้ว (เดิม global เครื่องเป็น "Little Smile Flower" ทำให้ commit ขึ้นชื่อผิดมา 100+ ตัว) — ไม่ต้องแก้อะไรเพิ่ม

**ที่ปิดไปแล้ววันนี้:** CI แดงบน main (lint `no-explicit-any` ใน `lib/session.ts`) · `SESSION_SECRET` ที่ไม่เคยตั้งจน production เซ็น session ด้วยสตริงในกิต (ตั้ง secret + deploy + เทสต์ล็อกไว้แล้ว) · guardrail ย้ายไปอยู่ที่ commit-time + server-side

**งานถัดไปอยู่ใน TODO ข้างล่าง** — ตัวที่พร้อมทำสุดคือเชื่อม payment gateway (`lib/members/payments.ts`)

---

## 📋 ต่อไป / TODO

- [x] **ระบบสมาชิก — เปิด Google/LINE Login**: ตั้ง secret `GOOGLE_CLIENT_ID/SECRET`, `LINE_CHANNEL_ID/SECRET` ด้วย `wrangler secret put` + เพิ่ม redirect URI ใน console (ดู [docs/member-system.md](docs/member-system.md)) — ปุ่มขึ้นแล้วแต่ยังกดไม่ผ่านจนกว่าจะตั้งคีย์
- [ ] **ระบบสมาชิก — เชื่อม payment gateway**: แก้ `lib/members/payments.ts` (`initiatePayment`) — ตอนนี้ checkout รองรับจองก่อนจ่ายที่คลินิกได้เต็ม, ชำระออนไลน์เป็น placeholder
- [ ] **เจ้าของทดสอบ**: เปลี่ยนรูปสักช่องใน /admin → รีเฟรชหน้านั้น ควรอัปเดตใน ~ไม่กี่วินาที (ยืนยัน on-demand revalidation หลังแก้ tag cache 2026-07-22)
- [ ] จดโดเมนจริง + ลบ `SITE_ENV=preview` + แก้ robots ตอนโดเมนพร้อม (ดู docs/infrastructure.md)

---

## ⚠️ ปมค้าง / รู้ไว้

- **งาน contact ของ Antigravity ถูก park ไว้ (2026-07-23)**: เจ้าของสั่งให้ใช้เวอร์ชัน contact ของ Claude (PR #166, deployed) แทน · งาน AG ที่แก้ค้าง (`contact/page.tsx`, `globals.css`, `booking-form.tsx`) เก็บไว้ใน **git stash ของโฟลเดอร์หลัก** ชื่อ `AG-contact-redesign-wip-2026-07-23` — กู้ได้ด้วย `git stash list` แล้ว `git stash apply <ref>` (⚠️ `contact/page.tsx` จะชนกับเวอร์ชันปัจจุบัน ต้อง resolve เอง)
- **เปลี่ยนรูปใน /admin แล้วต้องขึ้นเว็บ**: ต้องมีตาราง `revalidations` ใน D1 (fix แล้ว 2026-07-22, `migrations/0007`, ผูกใน `cf:deploy`) — ถ้าหน้าไม่อัปเดตอีก เช็คตารางนี้ก่อน (CLAUDE.md §0.5)
- **สองเครื่องมือแก้ร่วมกัน** (Claude ใน worktree · Antigravity ในโฟลเดอร์หลัก): งานที่ไม่ push = มองไม่เห็นตอน deploy — commit+push ทุกครั้งที่หยุด · ✅ `main` **บังคับด้วย ruleset แล้ว** (repo เป็น public ตั้งแต่ 2026-07-23) — push ตรงเข้า main โดน GitHub ตีกลับทุกกรณี แม้ `--no-verify` ต้องผ่าน PR + `verify` เขียวเท่านั้น
- **repo เป็น public แล้ว** (2026-07-23) — โค้ดและประวัติทั้งหมดเปิดสาธารณะ · ห้าม commit ความลับลงไฟล์เด็ดขาด ใช้ `wrangler secret put` เท่านั้น · ความลับที่หลุดไปแล้วถือว่าหลุดถาวร ต้อง rotate ไม่ใช่ลบ commit
- **deploy เป็น manual**: `pnpm cf:deploy` แล้วยิงเว็บจริง 2 ครั้งเช็ค `x-nextjs-cache` (ISR เสิร์ฟของเก่ารอบแรก) · เช็คสุขภาพเว็บได้ด้วย `pnpm health`

## 🧰 เครื่องมือ (มีตั้งแต่ 2026-07-22)

- **CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) — lint + typecheck + test + build บนทุก PR (รันบน GitHub runner)
- **Test** — `pnpm test` (vitest) · invariant tests ใน `tests/` (no-trailing-slash, service catalog)
- **Health** — `pnpm health` เช็คทุกหน้า 200 · uptime workflow ยิงทุก 6 ชม. ([.github/workflows/uptime.yml](.github/workflows/uptime.yml)) fail แล้ว GitHub เมลเตือน
- **Branch protection** — ruleset `protect-main` ([rules](https://github.com/luminuy/kazumi-clinic/rules)) `bypass_actors: []` → ต้องผ่าน PR + check `verify` เขียว, ห้าม force-push, ห้ามลบ branch · owner ก็ข้ามไม่ได้ (ทดสอบแล้วโดน `GH013`)
- **Git hooks** ([.githooks/](.githooks/)) — `pre-commit` กัน commit บน main · `pre-push` กัน push เข้า main + รัน lint/typecheck ให้ถ้ามีโค้ดเปลี่ยน (เปิดใช้ตอน `pnpm install` หรือ `pnpm setup:hooks`) · ให้ feedback เร็วก่อนถึง GitHub, bypass ได้ด้วย `--no-verify` แต่ ruleset จะดักอยู่ดี
- **ต้องเปิด R2** (ยังใช้ KV แทน) และ **ขึ้นโดเมนจริง** = งานที่ต้องกดใน Cloudflare dashboard เอง
