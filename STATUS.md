# STATUS — โปรเจกต์อยู่ตรงไหนแล้ว

> **อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง** เพื่อรู้ว่าตอนนี้ถึงไหน ใครทำอะไรค้างไว้
> **"ล่าสุด" = `origin/main` เสมอ** (ดู CLAUDE.md §0.5) — ไฟล์นี้แค่สรุปให้อ่านเร็ว ถ้าขัดกับ git ให้เชื่อ git
> อัปเดตไฟล์นี้เป็นส่วนหนึ่งของ workflow: หลัง **deploy** และตอน **เริ่ม/จบงานสำคัญ** (ดู CLAUDE.md §0)

**อัปเดตล่าสุด:** 2026-07-24 15:52 · โดย: Claude Code (ร่วมกับ Codex CLI เป็นคนลงมือแก้โค้ด — ดู "ปมค้าง" ด้านล่าง)

---

## 🚀 Deployed ตอนนี้ (เว็บจริง)

| | |
|---|---|
| **workers.dev** | Version `fd8886ca` — deploy 2026-07-24 08:51 UTC (ผ่าน CD อัตโนมัติ) · ตรงกับ main `5652ac5` (PR #220 signed Cloudinary upload — ล่าสุดของ 6 PR ที่ merge วันนี้: #215–#220) |
| **โดเมนจริง** (kazumiclinic.com) | ❌ ยังไม่ขึ้น — `SITE_ENV=preview`, robots `Disallow: /` (ตั้งใจ ห้ามลบจนกว่าโดเมนจะขึ้น) |
| **URL ตรวจ** | https://kazumi-clinic.bankjack10452.workers.dev |

> วิธีเช็คว่าเว็บจริง = main หรือยัง: `git rev-parse origin/main` เทียบกับ commit ในตารางบน · deploy ใหม่ = อัปเดต Version + commit ที่นี่

> ⚡ **CD เปิดแล้ว 2026-07-23** ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)): CI ผ่านบน main → `pnpm cf:deploy` รันเอง ไม่ต้อง deploy มือ · **merge เข้า main = ขึ้นเว็บจริงอัตโนมัติ** → security review ต้องทำ **ก่อน merge** (ดู CLAUDE.md §0) · ตาราง Deployed นี้ agent ที่ merge ควรอัปเดตหลัง CD เสร็จ (ยืนยัน Version ID จาก run ของ Deploy workflow)

---

## 🔨 กำลังทำ (in progress)

- (ว่าง — PR #215–#220 merge + deploy ครบแล้ว)

> ก่อนเริ่มงานที่กินหลายไฟล์ ให้จดที่นี่: **อะไร · เครื่องมือไหน (Claude / Antigravity) · branch ไหน** — กันชนกันและกัน "งานหาย" (ดู CLAUDE.md §0.5 · dual-agent)

### ✅ ปิดวันนี้ (2026-07-24 บ่าย) — 6 จุดจาก code/site audit, Claude วางแผน + Codex CLI ลงมือ

ทั้งหมด merge + deploy แล้ว (main `5652ac5`, workers.dev `fd8886ca`):

1. **[#215](https://github.com/luminuy/kazumi-clinic/pull/215)** `lib/members/catalog.ts` เคยอ่าน `serviceCategories` hardcoded แทน D1 merged catalogue → แก้ราคา/ซ่อนสินค้าใน /admin ไม่เคยไปถึง cart จริง ตอนนี้อ่าน `getAllMergedCategories()` แล้ว (async)
2. **[#216](https://github.com/luminuy/kazumi-clinic/pull/216)** เพิ่ม `pnpm cf:build` เข้า CI (`ci.yml`) — เดิม CI เช็คแค่ `next build` ไม่เช็ค OpenNext/Worker build ที่ deploy จริงใช้
3. **[#217](https://github.com/luminuy/kazumi-clinic/pull/217)** เพิ่ม rate limit ให้ `/api/cart/items` (60 req/5min ต่อ IP) — เดิมไม่มีเลยต่างจาก login/lead/checkout
4. **[#218](https://github.com/luminuy/kazumi-clinic/pull/218)** sync `README.md`/`docs/infrastructure.md`/`docs/deploy-for-antigravity.md` ให้ตรง CI/CD จริง + Next.js 16.2 (README เคยบอก 15.5)
5. **[#219](https://github.com/luminuy/kazumi-clinic/pull/219)** เพิ่มเทสต์คุม hide/restore merge logic (`tests/service-products-store.test.ts`) และ cart catalog pricing (`tests/members-catalog.test.ts`) — เดิมมีแค่ 2 ไฟล์เทสต์
6. **[#220](https://github.com/luminuy/kazumi-clinic/pull/220)** `lib/cloudinary-upload.ts` เปลี่ยนจาก unsigned preset (`littlesmileflower`, ชื่อหลุดอยู่ใน git history สาธารณะ) เป็น **signed upload** — ต้องตั้ง secret `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` ก่อน (**ตั้งแล้ว**, key name `kazumi-clinic-worker`, role **Master Admin** — Cloudinary free plan ไม่รองรับ scoped role แบบจำกัดเฉพาะโฟลเดอร์) · ทดสอบอัปรูปจริงที่ `/admin/products` แล้วผ่าน (เจ้าของยืนยัน 2026-07-24)
   - ⚠️ **preset เดิม `littlesmileflower` ห้ามลบ/ปิด** — ยังมีโปรเจกต์ littlesmileflower ใช้งานจริงอยู่ (บัญชี Cloudinary เดียวกัน) การปิด full signed-upload migration ของ preset นั้นเป็นงานฝั่งโปรเจกต์นั้น ไม่ใช่ Kazumi

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
- [ ] **เจ้าของอัปรูปที่หายกลับเข้า /admin/images**: asset เดิมบน Cloudinary หายไปหลายใบ (404) — `hero-filler`, `hero-skin-booster`, `hero-iv-drip-1/2/3`, `doctor-pratch`, `og-about`, `brand-logo`, โปสเตอร์ Karisma/Velvet Glow · PR #211 ตัด default ที่ตายแล้วออก หน้าจึงแสดงกล่องไอคอนแทนรูปแตก **จนกว่าจะอัปใหม่** · การ์ดทุก slot พร้อมรับอัปที่ /admin/images แล้ว
- [ ] จดโดเมนจริง + ลบ `SITE_ENV=preview` + แก้ robots ตอนโดเมนพร้อม (ดู docs/infrastructure.md)

---

## ⚠️ ปมค้าง / รู้ไว้

- **งาน contact ของ Antigravity ถูก park ไว้ (2026-07-23)**: เจ้าของสั่งให้ใช้เวอร์ชัน contact ของ Claude (PR #166, deployed) แทน · งาน AG ที่แก้ค้าง (`contact/page.tsx`, `globals.css`, `booking-form.tsx`) เก็บไว้ใน **git stash ของโฟลเดอร์หลัก** ชื่อ `AG-contact-redesign-wip-2026-07-23` — กู้ได้ด้วย `git stash list` แล้ว `git stash apply <ref>` (⚠️ `contact/page.tsx` จะชนกับเวอร์ชันปัจจุบัน ต้อง resolve เอง)
- **เปลี่ยนรูปใน /admin แล้วต้องขึ้นเว็บ**: ต้องมีตาราง `revalidations` ใน D1 (fix แล้ว 2026-07-22, `migrations/0007`, ผูกใน `cf:deploy`) — ถ้าหน้าไม่อัปเดตอีก เช็คตารางนี้ก่อน (CLAUDE.md §0.5)
- **สองเครื่องมือแก้ร่วมกัน** (Claude ใน worktree · Antigravity ในโฟลเดอร์หลัก): งานที่ไม่ push = มองไม่เห็นตอน deploy — commit+push ทุกครั้งที่หยุด · ✅ `main` **บังคับด้วย ruleset แล้ว** (repo เป็น public ตั้งแต่ 2026-07-23) — push ตรงเข้า main โดน GitHub ตีกลับทุกกรณี แม้ `--no-verify` ต้องผ่าน PR + `verify` เขียวเท่านั้น
- **repo เป็น public แล้ว** (2026-07-23) — โค้ดและประวัติทั้งหมดเปิดสาธารณะ · ห้าม commit ความลับลงไฟล์เด็ดขาด ใช้ `wrangler secret put` เท่านั้น · ความลับที่หลุดไปแล้วถือว่าหลุดถาวร ต้อง rotate ไม่ใช่ลบ commit
- **deploy มี CI/CD แล้ว**: `.github/workflows/deploy.yml` จะรัน `pnpm cf:deploy` อัตโนมัติเมื่อ merge เข้า `main` (ต้องตั้ง `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` เป็น GitHub Repository Secrets ก่อน) · ถ้ายังไม่ตั้ง secret สามารถ deploy manual ได้ด้วย `pnpm cf:deploy` แล้วยิงเว็บจริง 2 ครั้งเช็ค `x-nextjs-cache` (ISR เสิร์ฟของเก่ารอบแรก) · เช็คสุขภาพเว็บได้ด้วย `pnpm health`
- **Codex CLI (`codex exec`) เป็นเครื่องมือลงมือแก้โค้ดตัวใหม่ตั้งแต่ 2026-07-24** — เจ้าของสั่งชัดว่า Claude วางแผน/เขียนสเปก/ตรวจสอบ, Codex เป็นคนแก้โค้ดจริง (`-s workspace-write`, sandbox ไม่มี network — curl/fetch เว็บจริงไม่ได้ ต้องให้ Claude ทำส่วนที่ต้องใช้ network) · Claude ต้อง verify เองทุกครั้งด้วย lint/typecheck/test/build ไม่เชื่อคำอ้าง "ผ่านแล้ว" ของ Codex เฉยๆ (เจอเคสจริงที่ Codex รายงาน `pnpm cf:build` fail เพราะ sandbox ไม่มี network ไปดึง Google Fonts ไม่ใช่โค้ดพัง — Claude ต้อง re-run เองถึงจะรู้)
- **Cloudinary account (`dvskwrapm`) เป็นแพลนฟรี** — ไม่รองรับ scoped/restricted API key role (จำกัดสิทธิ์เฉพาะโฟลเดอร์) ต้องใช้ role "Master Admin" เท่านั้นสำหรับคีย์ใหม่ที่สร้างแยกจาก Root · account นี้ใช้ร่วมกับโปรเจกต์ littlesmileflower ด้วย — **ห้ามลบ/ปิด unsigned preset ชื่อ `littlesmileflower`** เด็ดขาดแม้จะรู้ว่าชื่อมันหลุดอยู่ใน git history สาธารณะของ Kazumi แล้ว (PR #220 เลิกใช้ preset นี้ในโค้ด Kazumi แล้ว แต่ preset ตัวเองยังต้องอยู่เพื่อ littlesmileflower)

## 🧰 เครื่องมือ (มีตั้งแต่ 2026-07-22)

- **CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) — lint + typecheck + test + build บนทุก PR (รันบน GitHub runner)
- **Test** — `pnpm test` (vitest) · invariant tests ใน `tests/` (no-trailing-slash, service catalog)
- **Health** — `pnpm health` เช็คทุกหน้า 200 · uptime workflow ยิงทุก 6 ชม. ([.github/workflows/uptime.yml](.github/workflows/uptime.yml)) fail แล้ว GitHub เมลเตือน
- **Branch protection** — ruleset `protect-main` ([rules](https://github.com/luminuy/kazumi-clinic/rules)) `bypass_actors: []` → ต้องผ่าน PR + check `verify` เขียว, ห้าม force-push, ห้ามลบ branch · owner ก็ข้ามไม่ได้ (ทดสอบแล้วโดน `GH013`)
- **Git hooks** ([.githooks/](.githooks/)) — `pre-commit` กัน commit บน main · `pre-push` กัน push เข้า main + รัน lint/typecheck ให้ถ้ามีโค้ดเปลี่ยน (เปิดใช้ตอน `pnpm install` หรือ `pnpm setup:hooks`) · ให้ feedback เร็วก่อนถึง GitHub, bypass ได้ด้วย `--no-verify` แต่ ruleset จะดักอยู่ดี
- **DB Backup** ([.github/workflows/backup.yml](.github/workflows/backup.yml)) — export D1 ทั้งก้อนทุกวัน 02:00 (Asia/Bangkok) → encrypt AES256 → เก็บเป็น GitHub artifact 30 วัน (off-Cloudflare DR เสริม Time Travel 30 วันของ D1) · ⚠️ **ต้องตั้ง GitHub secret `BACKUP_PASSPHRASE`** ก่อน workflow ถึงจะทำงาน (dump มี PII + repo public → ต้อง encrypt) · restore: decrypt แล้ว `wrangler d1 execute --file`
- **ต้องเปิด R2** (ยังใช้ KV แทน) และ **ขึ้นโดเมนจริง** = งานที่ต้องกดใน Cloudflare dashboard เอง
