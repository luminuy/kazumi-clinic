# STATUS — โปรเจกต์อยู่ตรงไหนแล้ว

> **อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง** เพื่อรู้ว่าตอนนี้ถึงไหน ใครทำอะไรค้างไว้
> **"ล่าสุด" = `origin/main` เสมอ** (ดู CLAUDE.md §0.5) — ไฟล์นี้แค่สรุปให้อ่านเร็ว ถ้าขัดกับ git ให้เชื่อ git
> อัปเดตไฟล์นี้เป็นส่วนหนึ่งของ workflow: หลัง **deploy** และตอน **เริ่ม/จบงานสำคัญ** (ดู CLAUDE.md §0)
> งานที่ปิดไปแล้วย้ายไป [docs/changelog.md](docs/changelog.md) — ไฟล์นี้เก็บแค่ **ตอนนี้ · ต่อไป · ค้าง**

**อัปเดตล่าสุด:** 2026-07-27 09:00 UTC · โดย: Claude Code

---

## 🚀 Deployed ตอนนี้ (เว็บจริง)

| | |
|---|---|
| **workers.dev** | Version `8dce1ff9` — code deploy 2026-07-27 08:55 UTC ผ่าน CD (run [30251716336](https://github.com/luminuy/kazumi-clinic/actions/runs/30251716336)) ตรงกับ main `301499a` (PR [#268](https://github.com/luminuy/kazumi-clinic/pull/268) — ระบบนัดหมาย Part B: .ics แนบอีเมล, reminder 24 ชม., เรียง admin ตามเวลานัด) ต่อด้วย secret-change redeploy ตอนตั้ง `INTERNAL_TASK_SECRET` (`wrangler secret put` + `gh secret set` ตั้งค่าเดียวกันทั้งคู่แล้ว) · ยิงจริงหลัง deploy: `POST /api/internal/appointment-reminders` ด้วย secret ถูกต้องตอบ `200 {"ok":true,"checked":0,"sent":0}`, ด้วย secret ผิด/ไม่มี header ตอบ `401` ตามที่ตั้งใจ · PR #266 (Part A) ก็ deploy+ยิงจริงแล้วก่อนหน้านี้เหมือนกัน (migration `0013_appointments` รันบน remote D1 ก่อน merge, `/api/leads` schema ใหม่, cancel flow ทั้ง guest/member ยิงจริงผ่านหมด) |
| **โดเมนจริง** (kazumiclinic.com) | ❌ ยังไม่ขึ้น — `SITE_ENV=preview`, robots `Disallow: /` (ตั้งใจ ห้ามลบจนกว่าโดเมนจะขึ้น) |
| **URL ตรวจ** | https://kazumi-clinic.bankjack10452.workers.dev · ตรวจ 2026-07-27: HTTP 200 |

> วิธียืนยันว่าเว็บ = main: `git rev-parse origin/main` เทียบ commit ข้างบน · Version ID จริงเอาจาก `npx wrangler deployments list` หรือ log ของ workflow `Deploy`
>
> ⚡ **merge เข้า main = ขึ้นเว็บจริงอัตโนมัติ** (CD ตั้งแต่ 2026-07-23) → security/medical review ต้องเสร็จ **ก่อน merge** · agent ที่ merge ควรอัปเดตตารางนี้หลัง CD เสร็จ

---

## 🔨 กำลังทำ (in progress)

- (ว่าง)

> ก่อนเริ่มงานที่กินหลายไฟล์ ให้จดที่นี่: **อะไร · เครื่องมือไหน (Claude / Antigravity / Codex) · branch ไหน** — กันชนกันและกัน "งานหาย" (CLAUDE.md §0.5 · dual-agent)

---

## ⚠️ ค้างไว้ให้คนถัดไป

| เรื่อง | รายละเอียด |
|---|---|
| **Password reset ส่งอีเมลไม่ได้ — โค้ดเสร็จแล้ว รอเจ้าของ (PR #264)** | ต่อ [Resend](https://resend.com) แล้ว (ฟรี 3,000/เดือน พอสำหรับปริมาณคลินิกนี้) แต่ยังส่งจริงไม่ได้จนกว่าเจ้าของจะ (1) สมัคร Resend (2) ยืนยันโดเมนด้วย DNS — **ติดปัญหาเดียวกับที่ขึ้นโดเมนจริงติด**: `kazumiclinic.com` ยังไม่ยืนยันว่าเป็นของใคร ใช้โดเมนอื่นที่ถืออยู่จริงส่งอีเมลไปก่อนได้ ไม่ต้องรอโดเมนเว็บ (3) `wrangler secret put RESEND_API_KEY` + `RESEND_FROM_EMAIL` — ตั้งครบเมื่อไหร่ปุ่ม "ลืมรหัสผ่าน?" โผล่เอง ดู [docs/member-system.md](docs/member-system.md) |
| **`blog/[slug]` ไม่ prerender ตอน build — ตั้งใจ ไม่ใช่ของค้าง** | slug อยู่ใน D1 ซึ่ง CI เข้าไม่ถึง · `generateStaticParams` คืน list ว่างเพื่อให้เข้า ISR ตอน on-demand (คนแรกที่เปิดจ่ายค่า render, ที่เหลือได้ cache) · จะ prerender จริงต้องให้ CI ถือ Cloudflare API token ไปอ่าน D1 ตอน build = เพิ่ม secret + ทำให้ build ล้มได้เมื่อ D1 ล่ม แลกกับ latency ของ request แรกเท่านั้น — **ไม่คุ้ม อย่าเปลี่ยนโดยไม่มีเหตุใหม่** |

---

## 📋 ต่อไป / TODO

- [x] **ระบบนัดหมาย Part A + B เสร็จและ deploy แล้ว** (ดู [docs/appointments.md](docs/appointments.md)) — จอง/ยืนยัน/ยกเลิก, อีเมลยืนยัน/ยกเลิก/เตือน, แนบ `.ics`, reminder 24 ชม. ผ่าน `app/api/internal/appointment-reminders` + GitHub Actions cron รายชั่วโมง, เรียง `/admin/leads` ตามเวลานัดใกล้สุด · `INTERNAL_TASK_SECRET` ตั้งแล้วทั้ง `wrangler secret put`/`gh secret set` และยิงจริงผ่าน (200 ด้วย secret ถูก, 401 ด้วย secret ผิด/ไม่มี) · **ยังไม่มีใครทดสอบว่าอีเมล (ยืนยัน/ยกเลิก/เตือน) ส่งถึงจริง** — บล็อกเดียวกับแถวบนสุดของตาราง "ค้าง" (รอ Resend ยืนยันโดเมน)
- [ ] **เชื่อม payment gateway**: แก้ `lib/members/payments.ts` (`initiatePayment`) — ตอนนี้จองก่อนจ่ายที่คลินิกได้เต็ม, ชำระออนไลน์เป็น placeholder (ดู [docs/member-system.md](docs/member-system.md))
- [ ] **เจ้าของอัปรูปเข้า /admin/images** — ตรวจของจริง 2026-07-25: มี **36 slot** · มีรูปจริง **6** (`about-hero`, `brand-mark`, `collagen-booster-editorial`, `hero-collagen-booster`, `hero-contact`, `hero-home` — โหลดได้ 200 ทุกใบ) + `brand-logo` ที่ใช้ default `kazumi-clinic/logo` · **ที่เหลือว่าง** จึงขึ้นกล่องไอคอน (ไม่ใช่รูปแตก) · ที่ควรอัปก่อนเพราะเห็นบ่อยสุด: `doctor-pratch`, `og-about` (รูปตอนแชร์ลิงก์), `hero-filler`, `hero-botox`, `hero-iv-drip-2` (ใช้ทั้ง /services และการ์ดแชร์ /blog)
- [ ] **เจ้าของทดสอบ**: เปลี่ยนรูปสักช่องใน /admin → รีเฟรชหน้านั้น ควรอัปเดตใน ~ไม่กี่วินาที (ยืนยัน on-demand revalidation หลังแก้ tag cache 2026-07-22)
- [ ] **ขึ้นโดเมนจริง**: จดโดเมน → เปลี่ยน `site.url` → **ลบ var `SITE_ENV`** → เพิ่ม destination ใน Cloudflare Access (ดู docs/infrastructure.md) · ความเป็นเจ้าของ `kazumiclinic.com` ยังไม่ยืนยันในเอกสาร แต่**เจ้าของแจ้งด้วยวาจา 2026-07-25 ว่าทีมกำลังซื้อโดเมนอยู่** (ยังไม่ได้ตรวจซ้ำด้วย `dig`/registrar — ตรวจก่อนอ้างเป็นข้อเท็จจริงในเอกสารอื่น) · ข้อนี้บล็อกทั้งการขึ้นเว็บจริง**และ**การยืนยันโดเมนกับ Resend (ข้อบนสุดของตาราง "ค้าง")
- [ ] **เจ้าของลบ orphan บน Cloudinary** (ไม่เร่ง): `kazumi-clinic/promo-velvet-glow`, `kazumi-clinic/promo-karisma-collagen` — เก็บภาพสลับกันมาแต่ต้น ไม่มีโค้ดไหนอ้างถึงแล้ว · ลบที่ Media Library ของบัญชี `dvskwrapm` เท่านั้น (agent ไม่มีและไม่ควรถือคีย์ Master Admin ของบัญชีที่ใช้ร่วมกับ littlesmileflower)
- [ ] **เปิด R2** (ตอนนี้ใช้ KV แทน) — ต้องกดเปิดใน Cloudflare dashboard เอง
- [x] **`BACKUP_PASSPHRASE`** ตั้งแล้วตั้งแต่ 2026-07-23 — backup D1 รันจริงทุกวัน (ตรวจ 2026-07-25: `gh secret list` + 3 run ล่าสุด success · artifact ล่าสุด 43,932 bytes หมดอายุ 2026-08-23) · **เก็บ passphrase ไว้ให้ดี ถ้าหาย backup ทุกก้อนอ่านไม่ได้**
- [x] เปิด Google/LINE Login — secret ตั้งครบแล้ว (ยืนยัน `wrangler secret list` 2026-07-25)

---

## ⚠️ ปมค้าง / รู้ไว้

- **สองเครื่องมือแก้ร่วมกัน** (Claude ใน worktree · Antigravity ในโฟลเดอร์หลัก · Codex CLI): งานที่ไม่ push = มองไม่เห็นตอน deploy — commit+push ทุกครั้งที่หยุด · `main` บังคับด้วย ruleset แล้ว push ตรงไม่ได้ทุกกรณี
- **repo เป็น public** (2026-07-23) — โค้ดและประวัติทั้งหมดเปิดสาธารณะ · ห้าม commit ความลับเด็ดขาด ใช้ `wrangler secret put` · ความลับที่หลุดไปแล้วถือว่าหลุดถาวร **ต้อง rotate ไม่ใช่ลบ commit**
- **งาน contact ของ Antigravity ถูก park** — เก็บใน git stash ของโฟลเดอร์หลักชื่อ `AG-contact-redesign-wip-2026-07-23` (ดู [docs/changelog.md](docs/changelog.md))
- **Codex CLI: ใช้ `-m gpt-5.6-sol` เสมอ** — default `gpt-5.6-terra` อ่อนกว่าและเคยค้าง 40 นาทีกับงานแก้ 3 บรรทัด · **แต่ `sol` ก็ค้างได้** (เคยค้าง 27 นาที) → จับว่าค้างจริงด้วย: มีไฟล์ rollout ใหม่ใน `~/.codex/sessions/<yyyy>/<mm>/<dd>/` ไหม + log file ยังโตอยู่ไหม (`stat -f %m`) — process อยู่แต่ log ไม่ขยับเกิน ~3 นาที = ค้าง ให้ kill แล้วรันใหม่
- ⚠️ **Codex ชอบแก้ `STATUS.md` เองโดยไม่ได้สั่ง** และเนื้อหาที่มันเขียนมักเก่า — ตรวจ `git status` ทุกครั้งหลัง Codex จบ ถ้ามันแตะ STATUS.md ให้ `git checkout -- STATUS.md` แล้วเขียนเอง
- **Codex เป็นคนลงมือแก้โค้ด, Claude วางแผน/ตรวจ** (เจ้าของสั่งตั้งแต่ 2026-07-24) · sandbox ของ Codex ไม่มี network → งานที่ต้อง curl/fetch ต้องให้ Claude ทำ · Claude ต้อง verify เองทุกครั้งด้วย lint/typecheck/test/build ไม่เชื่อคำอ้าง "ผ่านแล้ว"
- **Cloudinary account (`dvskwrapm`) เป็นแพลนฟรี** — ไม่รองรับ scoped API key role ต้องใช้ Master Admin · ใช้ร่วมกับ littlesmileflower → **ห้ามลบ/ปิด unsigned preset `littlesmileflower`** แม้ Kazumi เลิกใช้แล้ว (PR #220)
- **CI ค้างสถานะ `queued` (0 steps) นาน ๆ ได้โดยไม่ใช่ของเราพัง** — เจอจริง 2026-07-25 (PR #264): job ค้าง queued **1 ชั่วโมงเต็ม** ทั้งที่ run อื่นก่อน/หลังวิ่งปกติ ~1-2 นาที (repo public → ไม่ใช่ปัญหา billing minutes) แล้วอยู่ ๆ ก็เริ่มรันเองและผ่านปกติ · น่าจะเป็น backlog ฝั่ง GitHub Actions runner ที่พ้นการควบคุมเรา · ก่อนสงสัยว่า repo/PR มีปัญหา ให้เช็คก่อนว่า run อื่นในช่วงเวลาเดียวกันค้างเหมือนกันไหม (`gh run list -L 5`) ถ้าค้างเฉพาะตัวเดียวก็แค่รอ ไม่ต้อง debug โค้ด

---

## 🧰 เครื่องมือ

| เครื่องมือ | ทำอะไร |
|---|---|
| **CI** ([ci.yml](.github/workflows/ci.yml)) | lint + typecheck + test + build + `cf:build` บนทุก PR และ push:main |
| **CD** ([deploy.yml](.github/workflows/deploy.yml)) | CI ผ่านบน main → `pnpm cf:deploy` อัตโนมัติ (gate ด้วย `workflow_run`) |
| **Branch protection** | ruleset `protect-main` ([rules](https://github.com/luminuy/kazumi-clinic/rules)) `bypass_actors: []` → ต้องผ่าน PR + check `verify` เขียว · owner ก็ข้ามไม่ได้ |
| **Git hooks** ([.githooks/](.githooks/)) | `pre-commit` กัน commit บน main · `pre-push` กัน push เข้า main + รัน lint/typecheck ถ้ามีโค้ดเปลี่ยน (เปิดตอน `pnpm install`) |
| **Test** | `pnpm test` (vitest) — invariant tests + member/cart/password · ⚠️ รันบน Node ไม่ใช่ workerd |
| **Health** | `pnpm health` เช็คทุกหน้า 200 · uptime workflow ยิงทุก 6 ชม. ([uptime.yml](.github/workflows/uptime.yml)) |
| **Smoke** | `pnpm smoke` สมัคร/ล็อกอินจริงบน Worker หลัง deploy (exit 2 = 429 สรุปไม่ได้ ไม่ใช่ fail) |
| **DB Backup** ([backup.yml](.github/workflows/backup.yml)) | export D1 ทุกวัน 02:00 (Asia/Bangkok) → encrypt GPG → artifact 30 วัน · ✅ ทำงานอยู่จริง (ตรวจ 2026-07-25) · restore: `gpg --batch --decrypt --passphrase "$BACKUP_PASSPHRASE" -o restore.sql <ไฟล์>.gpg` แล้ว `wrangler d1 execute --file` |
