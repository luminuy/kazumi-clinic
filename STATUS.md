# STATUS — โปรเจกต์อยู่ตรงไหนแล้ว

> **อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง** เพื่อรู้ว่าตอนนี้ถึงไหน ใครทำอะไรค้างไว้
> **"ล่าสุด" = `origin/main` เสมอ** (ดู CLAUDE.md §0.5) — ไฟล์นี้แค่สรุปให้อ่านเร็ว ถ้าขัดกับ git ให้เชื่อ git
> อัปเดตไฟล์นี้เป็นส่วนหนึ่งของ workflow: หลัง **deploy** และตอน **เริ่ม/จบงานสำคัญ** (ดู CLAUDE.md §0)
> งานที่ปิดไปแล้วย้ายไป [docs/changelog.md](docs/changelog.md) — ไฟล์นี้เก็บแค่ **ตอนนี้ · ต่อไป · ค้าง**

**อัปเดตล่าสุด:** 2026-07-25 06:30 UTC · โดย: Claude Code

---

## 🚀 Deployed ตอนนี้ (เว็บจริง)

| | |
|---|---|
| **workers.dev** | Version `90d47839` — deploy 2026-07-25 06:26 UTC ผ่าน CD (run [30147475833](https://github.com/luminuy/kazumi-clinic/actions/runs/30147475833)) · ตรงกับ main `19f9cbf` (PR [#251](https://github.com/luminuy/kazumi-clinic/pull/251)) · ยืนยัน `/sitemap.xml` = 200 · 72 URL (36 หน้า × 2 ภาษา) |
| **โดเมนจริง** (kazumiclinic.com) | ❌ ยังไม่ขึ้น — `SITE_ENV=preview`, robots `Disallow: /` (ตั้งใจ ห้ามลบจนกว่าโดเมนจะขึ้น) |
| **URL ตรวจ** | https://kazumi-clinic.bankjack10452.workers.dev · ตรวจ 2026-07-25: HTTP 200 |

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
| **`/api/account/register` รั่ว account enumeration** | ผ่าน 409 "อีเมลนี้มีบัญชีอยู่แล้ว" (forgot-password ปิดช่องนี้แล้ว) — trade-off UX ที่เจ้าของต้องตัดสินก่อนแก้ |
| **Password reset ส่งอีเมลไม่ได้** | ไม่มี provider — วางไว้หลัง seam `lib/members/password-reset.ts` (`isEmailConfigured()` อ่าน `EMAIL_API_KEY` เป็นชื่อ placeholder) · ลิงก์ "ลืมรหัสผ่าน?" **ซ่อนอยู่** จนกว่าจะตั้ง secret จริง แล้วมันจะโผล่เอง — ตั้งใจ ไม่ใช่ของค้าง |
| **ถอน session ทุกเครื่องตอนรีเซ็ตรหัส ยังไม่ได้ทดสอบ runtime** | PR #244 ใช้ `db.batch()` ให้ atomic แต่ตรวจด้วยการอ่านโค้ดเท่านั้น — ต้องมี D1 จริง + สมาชิกจริงถึงจะยิงทดสอบได้ |
| **`blog/[slug]` ไม่ prerender ตอน build** | slug อยู่ใน D1 · ใส่ `generateStaticParams` คืน list ว่างเพื่อให้เข้า ISR ตอน on-demand แล้ว ถ้าอยาก prerender จริงต้องให้ CI เข้าถึง D1 ได้ |
| **ปุ่มซื้อเลย/purchase actions ไม่มีเทสต์** | `components/service-item-actions.tsx`, `components/account/add-to-cart-button.tsx` (PR #225, #227) |

---

## 📋 ต่อไป / TODO

- [ ] **เชื่อม payment gateway**: แก้ `lib/members/payments.ts` (`initiatePayment`) — ตอนนี้จองก่อนจ่ายที่คลินิกได้เต็ม, ชำระออนไลน์เป็น placeholder (ดู [docs/member-system.md](docs/member-system.md))
- [ ] **เจ้าของอัปรูปที่หายกลับเข้า /admin/images**: asset เดิมบน Cloudinary หายไปหลายใบ (404) — `hero-filler`, `hero-skin-booster`, `hero-iv-drip-1/2/3`, `doctor-pratch`, `og-about`, `brand-logo`, โปสเตอร์ Karisma/Velvet Glow · PR #211 ตัด default ที่ตายแล้วออก หน้าจึงแสดงกล่องไอคอนแทนรูปแตก **จนกว่าจะอัปใหม่**
- [ ] **เจ้าของทดสอบ**: เปลี่ยนรูปสักช่องใน /admin → รีเฟรชหน้านั้น ควรอัปเดตใน ~ไม่กี่วินาที (ยืนยัน on-demand revalidation หลังแก้ tag cache 2026-07-22)
- [ ] **ขึ้นโดเมนจริง**: จดโดเมน → เปลี่ยน `site.url` → **ลบ var `SITE_ENV`** → เพิ่ม destination ใน Cloudflare Access (ดู docs/infrastructure.md)
- [ ] **เปิด R2** (ตอนนี้ใช้ KV แทน) — ต้องกดเปิดใน Cloudflare dashboard เอง
- [ ] **ตั้ง GitHub secret `BACKUP_PASSPHRASE`** ไม่งั้น workflow backup D1 ไม่ทำงาน
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
| **DB Backup** ([backup.yml](.github/workflows/backup.yml)) | export D1 ทุกวัน 02:00 (Asia/Bangkok) → encrypt AES256 → artifact 30 วัน · ⚠️ ต้องตั้ง secret `BACKUP_PASSPHRASE` ก่อนถึงจะทำงาน |
